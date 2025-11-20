package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.response.WarrantyValidationResponseDTO;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.enums.WarrantyStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.WarrantyValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service implementation cho nghiệp vụ kiểm tra bảo hành (OPTION 2: HIERARCHY WARRANTY).
 * <p>
 * <strong>Hierarchy Warranty Logic:</strong>
 * <ul>
 *     <li><strong>Extended Warranty Parts</strong> (hasExtendedWarranty = true):
 *         Linh kiện QUAN TRỌNG (Battery, Motor) → Kiểm tra part-level warranty</li>
 *     <li><strong>Standard Parts</strong> (hasExtendedWarranty = false):
 *         Linh kiện THƯỜNG (Đèn, nội thất) → Kiểm tra vehicle-level warranty</li>
 * </ul>
 * <p>
 * <strong>Business rules quan trọng:</strong>
 * <ul>
 *     <li>Part warranty: Kiểm tra warrantyExpirationDate VÀ mileage since installation</li>
 *     <li>Vehicle warranty: Kiểm tra vehicle.warrantyEndDate VÀ vehicle.mileage</li>
 *     <li>Grace period & fee: Sử dụng config từ Part entity (linh kiện đắt = period dài, phí thấp)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarrantyValidationServiceImpl implements WarrantyValidationService {

    private final VehicleRepository vehicleRepository;
    private final InstalledPartRepository installedPartRepository;

    // ========== FALLBACK CONSTANTS (khi Part không có config) ==========

    private static final int DEFAULT_VEHICLE_MILEAGE_LIMIT = 100_000;
    private static final int DEFAULT_GRACE_PERIOD_DAYS = 180;
    private static final BigDecimal DEFAULT_MIN_FEE_PERCENTAGE = new BigDecimal("0.20");
    private static final BigDecimal DEFAULT_MAX_FEE_PERCENTAGE = new BigDecimal("0.50");
    private static final BigDecimal BASE_FEE = new BigDecimal("500000");

    // ========== PUBLIC METHODS ==========

    @Override
    public WarrantyValidationResponseDTO validateVehicleWarranty(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + vehicleId));

        return buildVehicleWarrantyValidationResponse(vehicle);
    }

    @Override
    public WarrantyValidationResponseDTO validateInstalledPartWarranty(Long installedPartId) {
        InstalledPart installedPart = installedPartRepository.findById(installedPartId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy linh kiện với ID: " + installedPartId));

        return buildPartWarrantyValidationResponse(installedPart);
    }

    @Override
    public WarrantyValidationResponseDTO validateVehicleWarrantyByVin(String vehicleVin) {
        Vehicle vehicle = vehicleRepository.findByVehicleVin(vehicleVin)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với VIN: " + vehicleVin));

        return buildVehicleWarrantyValidationResponse(vehicle);
    }

    @Override
    public WarrantyValidationResponseDTO calculatePaidWarrantyFee(Long vehicleId, BigDecimal estimatedRepairCost) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + vehicleId));

        WarrantyValidationResponseDTO response = buildVehicleWarrantyValidationResponse(vehicle);

        if (response.getCanProvidePaidWarranty()) {
            BigDecimal fee = calculateWarrantyFee(
                    response.getDaysRemaining(),
                    DEFAULT_GRACE_PERIOD_DAYS,
                    DEFAULT_MIN_FEE_PERCENTAGE,
                    DEFAULT_MAX_FEE_PERCENTAGE,
                    estimatedRepairCost
            );
            response.setEstimatedWarrantyFee(fee);
            response.setFeeNote(buildFeeNote(response.getDaysRemaining(), response.getMileageRemaining(), fee));
        }

        return response;
    }

    @Override
    public WarrantyValidationResponseDTO calculatePaidWarrantyFeeForPart(Long installedPartId, BigDecimal estimatedRepairCost) {
        InstalledPart installedPart = installedPartRepository.findById(installedPartId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy linh kiện với ID: " + installedPartId));

        WarrantyValidationResponseDTO response = buildPartWarrantyValidationResponse(installedPart);

        if (response.getCanProvidePaidWarranty()) {
            Part part = installedPart.getPart();

            // Sử dụng config từ Part (nếu có), fallback về default
            int gracePeriod = part.getGracePeriodDays() != null ? part.getGracePeriodDays() : DEFAULT_GRACE_PERIOD_DAYS;
            BigDecimal minFee = part.getPaidWarrantyFeePercentageMin() != null ? part.getPaidWarrantyFeePercentageMin() : DEFAULT_MIN_FEE_PERCENTAGE;
            BigDecimal maxFee = part.getPaidWarrantyFeePercentageMax() != null ? part.getPaidWarrantyFeePercentageMax() : DEFAULT_MAX_FEE_PERCENTAGE;

            Long daysRemaining = response.getPartDaysRemaining() != null ? response.getPartDaysRemaining() : response.getDaysRemaining();

            BigDecimal fee = calculateWarrantyFee(daysRemaining, gracePeriod, minFee, maxFee, estimatedRepairCost);
            response.setEstimatedWarrantyFee(fee);
            response.setFeeNote(buildFeeNote(daysRemaining, response.getMileageRemaining(), fee));
        }

        return response;
    }

    // ========== HIERARCHY LOGIC: PART WARRANTY VALIDATION ==========

    /**
     * Kiểm tra bảo hành theo Part (HIERARCHY: Extended Warranty Parts).
     * <p>
     * Áp dụng khi: {@code part.hasExtendedWarranty = true}
     */
    private WarrantyValidationResponseDTO buildPartWarrantyValidationResponse(InstalledPart installedPart) {
        Part part = installedPart.getPart();
        Vehicle vehicle = installedPart.getVehicle();
        LocalDate today = LocalDate.now();

        // Kiểm tra xem part có extended warranty không
        if (part.getHasExtendedWarranty() != null && part.getHasExtendedWarranty()) {
            // Extended warranty part → Kiểm tra part-level warranty
            return buildExtendedPartWarrantyResponse(installedPart, today);
        } else {
            // Standard part → Kiểm tra vehicle-level warranty
            return buildVehicleWarrantyValidationResponse(vehicle);
        }
    }

    /**
     * Build response cho Extended Warranty Part.
     * CRITICAL: Phải kiểm tra CẢ vehicle warranty VÀ part warranty, áp dụng điều kiện NGHIÊM NGẶT NHẤT
     * theo business rules (WARRANTY_BUSINESS_RULES.md dòng 59-70)
     */
    private WarrantyValidationResponseDTO buildExtendedPartWarrantyResponse(InstalledPart installedPart, LocalDate today) {
        Part part = installedPart.getPart();
        Vehicle vehicle = installedPart.getVehicle();

        // ===== 1. KIỂM TRA PART WARRANTY =====
        int currentMileage = vehicle.getMileage();
        int mileageAtInstallation = installedPart.getMileageAtInstallation() != null ? installedPart.getMileageAtInstallation() : 0;
        int mileageSinceInstallation = currentMileage - mileageAtInstallation;

        Integer partMileageLimit = installedPart.getWarrantyMileageLimit() != null
                ? installedPart.getWarrantyMileageLimit()
                : part.getDefaultWarrantyMileage();

        LocalDate partExpirationDate = installedPart.getWarrantyExpirationDate();
        long partDaysRemaining = ChronoUnit.DAYS.between(today, partExpirationDate);
        Integer partMileageRemaining = partMileageLimit != null ? partMileageLimit - mileageSinceInstallation : null;

        WarrantyStatus partStatus = determinePartWarrantyStatus(
                today,
                partExpirationDate,
                mileageSinceInstallation,
                partMileageLimit
        );

        // ===== 2. KIỂM TRA VEHICLE WARRANTY =====
        LocalDate vehicleExpirationDate = vehicle.getWarrantyEndDate();
        long vehicleDaysRemaining = ChronoUnit.DAYS.between(today, vehicleExpirationDate);
        int vehicleMileageRemaining = DEFAULT_VEHICLE_MILEAGE_LIMIT - currentMileage;

        WarrantyStatus vehicleStatus = determineVehicleWarrantyStatus(
                today,
                vehicleExpirationDate,
                currentMileage,
                DEFAULT_VEHICLE_MILEAGE_LIMIT
        );

        // ===== 3. ÁP DỤNG ĐIỀU KIỆN NGHIÊM NGẶT NHẤT =====
        // Lấy status TỆ NHẤT (VALID < EXPIRED_MILEAGE < EXPIRED_DATE < EXPIRED_BOTH)
        WarrantyStatus finalStatus = getStrictestStatus(partStatus, vehicleStatus);

        // Lấy daysRemaining TỆ NHẤT (số âm lớn nhất = quá hạn lâu nhất)
        long finalDaysRemaining = Math.min(partDaysRemaining, vehicleDaysRemaining);

        // Lấy warrantyEndDate tương ứng với daysRemaining tệ nhất
        LocalDate finalWarrantyEndDate = (partDaysRemaining <= vehicleDaysRemaining) ? partExpirationDate : vehicleExpirationDate;

        // Lấy mileageRemaining TỆ NHẤT (số âm lớn nhất = vượt nhiều nhất)
        // Luôn so sánh CẢ part và vehicle mileage
        Integer finalMileageRemaining;
        Integer finalMileageLimit;
        if (partMileageRemaining != null) {
            // So sánh part mileage với vehicle mileage, lấy TỆ NHẤT
            finalMileageRemaining = Math.min(partMileageRemaining, vehicleMileageRemaining);
            // Nếu vehicle tệ hơn, dùng vehicle limit, ngược lại dùng part limit
            finalMileageLimit = (vehicleMileageRemaining < partMileageRemaining)
                ? DEFAULT_VEHICLE_MILEAGE_LIMIT
                : partMileageLimit;
        } else {
            // Nếu part không có mileage limit, chỉ dùng vehicle
            finalMileageRemaining = vehicleMileageRemaining;
            finalMileageLimit = DEFAULT_VEHICLE_MILEAGE_LIMIT;
        }

        // Grace period
        int gracePeriod = part.getGracePeriodDays() != null ? part.getGracePeriodDays() : DEFAULT_GRACE_PERIOD_DAYS;
        boolean canProvidePaidWarranty = canProvidePaidWarranty(finalStatus, finalDaysRemaining, gracePeriod);

        // Build detailed expiration reasons
        String detailedReasons = buildDetailedExpirationReasons(
            finalStatus,
            partStatus, vehicleStatus,
            partDaysRemaining, vehicleDaysRemaining,
            partMileageRemaining, vehicleMileageRemaining,
            partExpirationDate, vehicleExpirationDate
        );

        return WarrantyValidationResponseDTO.builder()
                .warrantyStatus(finalStatus)
                .statusDescription(finalStatus.getDescription())
                .isValidForFreeWarranty(finalStatus.isValid())
                .canProvidePaidWarranty(canProvidePaidWarranty)
                .warrantyStartDate(installedPart.getInstallationDate())
                .warrantyEndDate(finalWarrantyEndDate)
                .daysRemaining(finalDaysRemaining)
                .currentMileage(currentMileage)
                .mileageLimit(finalMileageLimit)
                .mileageRemaining(finalMileageRemaining)
                .installedPartId(installedPart.getInstalledPartId())
                .partName(part.getPartName())
                .partWarrantyExpirationDate(partExpirationDate)
                .partDaysRemaining(partDaysRemaining)
                .vehicleId(vehicle.getVehicleId())
                .vehicleVin(vehicle.getVehicleVin())
                .vehicleName(vehicle.getVehicleName())
                .expirationReasons(detailedReasons)
                .gracePeriodDays(gracePeriod)
                .build();
    }

    /**
     * Lấy warranty status NGHIÊM NGẶT NHẤT giữa part và vehicle.
     * Priority: VALID < EXPIRED_MILEAGE < EXPIRED_DATE < EXPIRED_BOTH
     */
    private WarrantyStatus getStrictestStatus(WarrantyStatus partStatus, WarrantyStatus vehicleStatus) {
        // Nếu một trong hai là EXPIRED_BOTH → return EXPIRED_BOTH
        if (partStatus == WarrantyStatus.EXPIRED_BOTH || vehicleStatus == WarrantyStatus.EXPIRED_BOTH) {
            return WarrantyStatus.EXPIRED_BOTH;
        }

        // Nếu một trong hai là EXPIRED_DATE
        if (partStatus == WarrantyStatus.EXPIRED_DATE || vehicleStatus == WarrantyStatus.EXPIRED_DATE) {
            // Nếu cái kia là EXPIRED_MILEAGE → return EXPIRED_BOTH
            if (partStatus == WarrantyStatus.EXPIRED_MILEAGE || vehicleStatus == WarrantyStatus.EXPIRED_MILEAGE) {
                return WarrantyStatus.EXPIRED_BOTH;
            }
            return WarrantyStatus.EXPIRED_DATE;
        }

        // Nếu một trong hai là EXPIRED_MILEAGE
        if (partStatus == WarrantyStatus.EXPIRED_MILEAGE || vehicleStatus == WarrantyStatus.EXPIRED_MILEAGE) {
            return WarrantyStatus.EXPIRED_MILEAGE;
        }

        // Cả hai đều VALID
        return WarrantyStatus.VALID;
    }

    /**
     * Xác định warranty status cho Part (extended warranty).
     */
    private WarrantyStatus determinePartWarrantyStatus(LocalDate today, LocalDate expirationDate,
                                                       int mileageSinceInstallation, Integer mileageLimit) {
        boolean dateExpired = today.isAfter(expirationDate);
        boolean mileageExpired = mileageLimit != null && mileageSinceInstallation > mileageLimit;

        if (!dateExpired && !mileageExpired) {
            return WarrantyStatus.VALID;
        } else if (dateExpired && mileageExpired) {
            return WarrantyStatus.EXPIRED_BOTH;
        } else if (dateExpired) {
            return WarrantyStatus.EXPIRED_DATE;
        } else {
            return WarrantyStatus.EXPIRED_MILEAGE;
        }
    }

    // ========== HIERARCHY LOGIC: VEHICLE WARRANTY VALIDATION ==========

    /**
     * Kiểm tra bảo hành theo Vehicle (HIERARCHY: Standard Parts).
     * <p>
     * Áp dụng khi: {@code part.hasExtendedWarranty = false} hoặc kiểm tra vehicle-level
     */
    private WarrantyValidationResponseDTO buildVehicleWarrantyValidationResponse(Vehicle vehicle) {
        LocalDate today = LocalDate.now();

        long daysRemaining = ChronoUnit.DAYS.between(today, vehicle.getWarrantyEndDate());
        int mileageRemaining = DEFAULT_VEHICLE_MILEAGE_LIMIT - vehicle.getMileage();

        WarrantyStatus status = determineVehicleWarrantyStatus(
                today,
                vehicle.getWarrantyEndDate(),
                vehicle.getMileage(),
                DEFAULT_VEHICLE_MILEAGE_LIMIT
        );

        boolean canProvidePaidWarranty = canProvidePaidWarranty(status, daysRemaining, DEFAULT_GRACE_PERIOD_DAYS);

        return WarrantyValidationResponseDTO.builder()
                .warrantyStatus(status)
                .statusDescription(status.getDescription())
                .isValidForFreeWarranty(status.isValid())
                .canProvidePaidWarranty(canProvidePaidWarranty)
                .warrantyStartDate(vehicle.getWarrantyStartDate())
                .warrantyEndDate(vehicle.getWarrantyEndDate())
                .daysRemaining(daysRemaining)
                .currentMileage(vehicle.getMileage())
                .mileageLimit(DEFAULT_VEHICLE_MILEAGE_LIMIT)
                .mileageRemaining(mileageRemaining)
                .vehicleId(vehicle.getVehicleId())
                .vehicleVin(vehicle.getVehicleVin())
                .vehicleName(vehicle.getVehicleName())
                .expirationReasons(buildExpirationReasons(status, daysRemaining, mileageRemaining))
                .gracePeriodDays(DEFAULT_GRACE_PERIOD_DAYS)
                .build();
    }

    /**
     * Xác định warranty status cho Vehicle.
     */
    private WarrantyStatus determineVehicleWarrantyStatus(LocalDate today, LocalDate warrantyEndDate,
                                                          int currentMileage, int mileageLimit) {
        boolean dateExpired = today.isAfter(warrantyEndDate);
        boolean mileageExpired = currentMileage > mileageLimit;

        if (!dateExpired && !mileageExpired) {
            return WarrantyStatus.VALID;
        } else if (dateExpired && mileageExpired) {
            return WarrantyStatus.EXPIRED_BOTH;
        } else if (dateExpired) {
            return WarrantyStatus.EXPIRED_DATE;
        } else {
            return WarrantyStatus.EXPIRED_MILEAGE;
        }
    }

    // ========== COMMON HELPER METHODS ==========

    /**
     * Kiểm tra xem có thể cung cấp bảo hành tính phí hay không.
     */
    private boolean canProvidePaidWarranty(WarrantyStatus status, long daysRemaining, int gracePeriodDays) {
        if (status == WarrantyStatus.VALID) {
            return false; // Còn bảo hành miễn phí
        }

        long daysExpired = Math.abs(daysRemaining);
        return daysExpired <= gracePeriodDays;
    }

    /**
     * Tính phí bảo hành.
     * <p>
     * Phí tăng tuyến tính từ minFee% đến maxFee% theo thời gian quá hạn.
     */
    private BigDecimal calculateWarrantyFee(Long daysRemaining, int gracePeriodDays,
                                           BigDecimal minFeePercentage, BigDecimal maxFeePercentage,
                                           BigDecimal estimatedRepairCost) {
        if (estimatedRepairCost == null || estimatedRepairCost.compareTo(BigDecimal.ZERO) <= 0) {
            return BASE_FEE;
        }

        long daysExpired = Math.abs(daysRemaining);

        // Tính phần trăm phí dựa trên thời gian quá hạn
        BigDecimal progressRatio = BigDecimal.valueOf(daysExpired)
                .divide(BigDecimal.valueOf(gracePeriodDays), 4, RoundingMode.HALF_UP);

        BigDecimal feePercentage = minFeePercentage.add(
                maxFeePercentage.subtract(minFeePercentage).multiply(progressRatio)
        );

        BigDecimal calculatedFee = estimatedRepairCost.multiply(feePercentage);

        return calculatedFee.max(BASE_FEE);
    }

    /**
     * Xây dựng ghi chú về phí bảo hành.
     */
    private String buildFeeNote(Long daysRemaining, Integer mileageRemaining, BigDecimal fee) {
        long daysExpired = Math.abs(daysRemaining);

        StringBuilder note = new StringBuilder();
        note.append("Phí bảo hành: ").append(formatCurrency(fee)).append(" VNĐ\n");
        note.append("Lý do: ");

        if (daysRemaining < 0) {
            note.append("Quá hạn bảo hành ").append(daysExpired).append(" ngày. ");
        }
        if (mileageRemaining != null && mileageRemaining < 0) {
            note.append("Vượt giới hạn km ").append(Math.abs(mileageRemaining)).append(" km. ");
        }

        note.append("\nPhí bao gồm: Chi phí linh kiện, công sửa chữa, và phí quản lý.");
        note.append("\nLưu ý: Phí có thể thay đổi tùy thuộc vào tình trạng thực tế của xe.");

        return note.toString();
    }

    /**
     * Build detailed expiration reasons showing BOTH part and vehicle status
     */
    private String buildDetailedExpirationReasons(
            WarrantyStatus finalStatus,
            WarrantyStatus partStatus, WarrantyStatus vehicleStatus,
            long partDaysRemaining, long vehicleDaysRemaining,
            Integer partMileageRemaining, Integer vehicleMileageRemaining,
            LocalDate partExpirationDate, LocalDate vehicleExpirationDate) {

        if (finalStatus == WarrantyStatus.VALID) {
            return "Bảo hành còn hiệu lực";
        }

        StringBuilder reasons = new StringBuilder();

        // Phân tích chi tiết từng thành phần
        boolean partExpired = partStatus != WarrantyStatus.VALID;
        boolean vehicleExpired = vehicleStatus != WarrantyStatus.VALID;

        if (partExpired && vehicleExpired) {
            // CẢ HAI hết hạn
            reasons.append("Hết hạn bảo hành do CẢ linh kiện VÀ xe: ");

            // Part expiration details
            if (partDaysRemaining < 0) {
                reasons.append("Linh kiện quá hạn ")
                        .append(Math.abs(partDaysRemaining))
                        .append(" ngày (hết hạn: ")
                        .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(partExpirationDate))
                        .append(")");
            }
            if (partMileageRemaining != null && partMileageRemaining < 0) {
                reasons.append(", vượt ")
                        .append(Math.abs(partMileageRemaining))
                        .append(" km");
            }

            reasons.append(". ");

            // Vehicle expiration details
            if (vehicleDaysRemaining < 0) {
                reasons.append("Xe quá hạn ")
                        .append(Math.abs(vehicleDaysRemaining))
                        .append(" ngày (hết hạn: ")
                        .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(vehicleExpirationDate))
                        .append(")");
            }
            if (vehicleMileageRemaining < 0) {
                reasons.append(", vượt ")
                        .append(Math.abs(vehicleMileageRemaining))
                        .append(" km");
            }

            reasons.append(". → Áp dụng điều kiện NGHIÊM NGẶT NHẤT: ")
                    .append(Math.max(Math.abs(partDaysRemaining), Math.abs(vehicleDaysRemaining)))
                    .append(" ngày quá hạn");

        } else if (vehicleExpired) {
            // CHỈ xe hết hạn (part còn VALID)
            reasons.append("Xe đã hết hạn bảo hành: ");
            if (vehicleDaysRemaining < 0) {
                reasons.append("Quá hạn ")
                        .append(Math.abs(vehicleDaysRemaining))
                        .append(" ngày (hết hạn: ")
                        .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(vehicleExpirationDate))
                        .append(")");
            }
            if (vehicleMileageRemaining < 0) {
                reasons.append(", vượt giới hạn ")
                        .append(Math.abs(vehicleMileageRemaining))
                        .append(" km");
            }
            reasons.append(". Mặc dù linh kiện còn ")
                    .append(partDaysRemaining)
                    .append(" ngày bảo hành, nhưng theo quy định phải áp dụng điều kiện NGHIÊM NGẶT NHẤT (xe đã hết hạn)");

        } else if (partExpired) {
            // CHỈ part hết hạn (vehicle còn VALID)
            reasons.append("Linh kiện đã hết hạn bảo hành: ");
            if (partDaysRemaining < 0) {
                reasons.append("Quá hạn ")
                        .append(Math.abs(partDaysRemaining))
                        .append(" ngày (hết hạn: ")
                        .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(partExpirationDate))
                        .append(")");
            }
            if (partMileageRemaining != null && partMileageRemaining < 0) {
                reasons.append(", vượt giới hạn ")
                        .append(Math.abs(partMileageRemaining))
                        .append(" km");
            }
            reasons.append(". Mặc dù xe còn ")
                    .append(vehicleDaysRemaining)
                    .append(" ngày bảo hành (")
                    .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(vehicleExpirationDate))
                    .append("), nhưng theo quy định phải áp dụng điều kiện NGHIÊM NGẶT NHẤT (linh kiện đã hết hạn)");
        }

        return reasons.toString();
    }

    /**
     * Xây dựng lý do hết hạn bảo hành (method cũ, giữ lại cho compatibility).
     */
    private String buildExpirationReasons(WarrantyStatus status, long daysRemaining, Integer mileageRemaining) {
        if (status == WarrantyStatus.VALID) {
            return "Bảo hành còn hiệu lực";
        }

        StringBuilder reasons = new StringBuilder();

        switch (status) {
            case EXPIRED_DATE:
                reasons.append("Hết hạn bảo hành theo thời gian (quá ")
                        .append(Math.abs(daysRemaining))
                        .append(" ngày)");
                break;
            case EXPIRED_MILEAGE:
                if (mileageRemaining != null) {
                    reasons.append("Hết hạn bảo hành theo số km (vượt ")
                            .append(Math.abs(mileageRemaining))
                            .append(" km)");
                }
                break;
            case EXPIRED_BOTH:
                reasons.append("Hết hạn bảo hành theo cả thời gian (quá ")
                        .append(Math.abs(daysRemaining))
                        .append(" ngày)");
                if (mileageRemaining != null) {
                    reasons.append(" và số km (vượt ")
                            .append(Math.abs(mileageRemaining))
                            .append(" km)");
                }
                break;
            case PART_WARRANTY_EXPIRED:
                reasons.append("Linh kiện đã hết hạn bảo hành");
                break;
        }

        return reasons.toString();
    }

    /**
     * Format số tiền theo chuẩn Việt Nam.
     */
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f", amount);
    }
}
