package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.response.WarrantyValidationResponseDTO;
import com.swp391.warrantymanagement.entity.InstalledPart;
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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service implementation cho nghiệp vụ kiểm tra bảo hành.
 * <p>
 * <strong>Business rules quan trọng:</strong>
 * <ul>
 *     <li>Bảo hành hợp lệ khi: Chưa quá warrantyEndDate VÀ chưa vượt giới hạn km</li>
 *     <li>Grace period: 30 ngày sau khi hết hạn vẫn có thể bảo hành tính phí</li>
 *     <li>Phí bảo hành = % của chi phí sửa chữa, tăng theo thời gian quá hạn</li>
 *     <li>Giới hạn km mặc định: 100,000 km (có thể configure theo model xe)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarrantyValidationServiceImpl implements WarrantyValidationService {

    private final VehicleRepository vehicleRepository;
    private final InstalledPartRepository installedPartRepository;

    // ========== CONSTANTS - Business Rules Configuration ==========

    /**
     * Giới hạn km mặc định cho bảo hành xe điện EV
     */
    private static final int DEFAULT_MILEAGE_LIMIT = 100_000;

    /**
     * Grace period (ngày) sau khi hết hạn vẫn có thể bảo hành tính phí
     */
    private static final int GRACE_PERIOD_DAYS = 180; // 6 tháng

    /**
     * Phần trăm phí bảo hành tối thiểu (của chi phí sửa chữa)
     */
    private static final BigDecimal MIN_FEE_PERCENTAGE = new BigDecimal("0.20"); // 20%

    /**
     * Phần trăm phí bảo hành tối đa
     */
    private static final BigDecimal MAX_FEE_PERCENTAGE = new BigDecimal("0.50"); // 50%

    /**
     * Phí bảo hành cơ bản tối thiểu (VNĐ)
     */
    private static final BigDecimal BASE_FEE = new BigDecimal("500000"); // 500,000 VNĐ

    // ========== PUBLIC METHODS ==========

    @Override
    public WarrantyValidationResponseDTO validateVehicleWarranty(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + vehicleId));

        return buildWarrantyValidationResponse(vehicle, null);
    }

    @Override
    public WarrantyValidationResponseDTO validateInstalledPartWarranty(Long installedPartId) {
        InstalledPart installedPart = installedPartRepository.findById(installedPartId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy linh kiện với ID: " + installedPartId));

        Vehicle vehicle = installedPart.getVehicle();
        return buildWarrantyValidationResponse(vehicle, installedPart);
    }

    @Override
    public WarrantyValidationResponseDTO validateVehicleWarrantyByVin(String vehicleVin) {
        Vehicle vehicle = vehicleRepository.findByVehicleVin(vehicleVin)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với VIN: " + vehicleVin));

        return buildWarrantyValidationResponse(vehicle, null);
    }

    @Override
    public WarrantyValidationResponseDTO calculatePaidWarrantyFee(Long vehicleId, BigDecimal estimatedRepairCost) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + vehicleId));

        WarrantyValidationResponseDTO response = buildWarrantyValidationResponse(vehicle, null);

        // Chỉ tính phí nếu hết hạn nhưng còn trong grace period
        if (response.getCanProvidePaidWarranty()) {
            BigDecimal fee = calculateWarrantyFee(
                    response.getDaysRemaining(),
                    response.getMileageRemaining(),
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

        Vehicle vehicle = installedPart.getVehicle();
        WarrantyValidationResponseDTO response = buildWarrantyValidationResponse(vehicle, installedPart);

        // Tính phí nếu có thể bảo hành tính phí
        if (response.getCanProvidePaidWarranty()) {
            BigDecimal fee = calculateWarrantyFee(
                    response.getPartDaysRemaining() != null ? response.getPartDaysRemaining() : response.getDaysRemaining(),
                    response.getMileageRemaining(),
                    estimatedRepairCost
            );
            response.setEstimatedWarrantyFee(fee);
            response.setFeeNote(buildFeeNote(
                    response.getPartDaysRemaining() != null ? response.getPartDaysRemaining() : response.getDaysRemaining(),
                    response.getMileageRemaining(),
                    fee
            ));
        }

        return response;
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Xây dựng response đầy đủ cho warranty validation
     */
    private WarrantyValidationResponseDTO buildWarrantyValidationResponse(Vehicle vehicle, InstalledPart installedPart) {
        LocalDate today = LocalDate.now();

        // Tính toán thông tin bảo hành của xe
        long daysRemaining = ChronoUnit.DAYS.between(today, vehicle.getWarrantyEndDate());
        int mileageRemaining = DEFAULT_MILEAGE_LIMIT - vehicle.getMileage();

        // Xác định trạng thái bảo hành
        WarrantyStatus warrantyStatus = determineWarrantyStatus(
                vehicle.getWarrantyEndDate(),
                vehicle.getMileage(),
                installedPart != null ? installedPart.getWarrantyExpirationDate() : null
        );

        // Build response
        WarrantyValidationResponseDTO response = WarrantyValidationResponseDTO.builder()
                .warrantyStatus(warrantyStatus)
                .statusDescription(warrantyStatus.getDescription())
                .isValidForFreeWarranty(warrantyStatus.isValid())
                .canProvidePaidWarranty(canProvidePaidWarranty(warrantyStatus, daysRemaining))
                .warrantyStartDate(vehicle.getWarrantyStartDate())
                .warrantyEndDate(vehicle.getWarrantyEndDate())
                .daysRemaining(daysRemaining)
                .currentMileage(vehicle.getMileage())
                .mileageLimit(DEFAULT_MILEAGE_LIMIT)
                .mileageRemaining(mileageRemaining)
                .vehicleId(vehicle.getVehicleId())
                .vehicleVin(vehicle.getVehicleVin())
                .vehicleName(vehicle.getVehicleName())
                .expirationReasons(buildExpirationReasons(warrantyStatus, daysRemaining, mileageRemaining))
                .build();

        // Thêm thông tin linh kiện nếu có
        if (installedPart != null) {
            LocalDate partExpirationDate = installedPart.getWarrantyExpirationDate();
            long partDaysRemaining = ChronoUnit.DAYS.between(today, partExpirationDate);

            response.setInstalledPartId(installedPart.getInstalledPartId());
            response.setPartName(installedPart.getPart().getPartName());
            response.setPartWarrantyExpirationDate(partExpirationDate);
            response.setPartDaysRemaining(partDaysRemaining);
        }

        return response;
    }

    /**
     * Xác định trạng thái bảo hành dựa trên ngày và km
     */
    private WarrantyStatus determineWarrantyStatus(LocalDate warrantyEndDate, Integer currentMileage, LocalDate partExpirationDate) {
        LocalDate today = LocalDate.now();

        // Kiểm tra bảo hành linh kiện trước (nếu có)
        if (partExpirationDate != null && today.isAfter(partExpirationDate)) {
            return WarrantyStatus.PART_WARRANTY_EXPIRED;
        }

        boolean dateExpired = today.isAfter(warrantyEndDate);
        boolean mileageExpired = currentMileage > DEFAULT_MILEAGE_LIMIT;

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

    /**
     * Kiểm tra xem có thể cung cấp bảo hành tính phí hay không
     * <p>
     * Business rule: Chỉ cho phép bảo hành tính phí trong grace period (180 ngày)
     */
    private boolean canProvidePaidWarranty(WarrantyStatus status, long daysRemaining) {
        if (status == WarrantyStatus.VALID) {
            return false; // Còn bảo hành miễn phí thì không cần tính phí
        }

        // Cho phép bảo hành tính phí nếu:
        // - Hết hạn không quá GRACE_PERIOD_DAYS
        long daysExpired = Math.abs(daysRemaining);
        return daysExpired <= GRACE_PERIOD_DAYS;
    }

    /**
     * Tính phí bảo hành dựa trên thời gian quá hạn và chi phí sửa chữa
     * <p>
     * <strong>Công thức:</strong>
     * <ul>
     *     <li>Phí = MAX(BASE_FEE, estimatedRepairCost * feePercentage)</li>
     *     <li>feePercentage tăng tuyến tính từ MIN_FEE_PERCENTAGE đến MAX_FEE_PERCENTAGE</li>
     *     <li>theo thời gian quá hạn (0 ngày → MIN%, GRACE_PERIOD_DAYS → MAX%)</li>
     * </ul>
     */
    private BigDecimal calculateWarrantyFee(Long daysRemaining, Integer mileageRemaining, BigDecimal estimatedRepairCost) {
        if (estimatedRepairCost == null || estimatedRepairCost.compareTo(BigDecimal.ZERO) <= 0) {
            return BASE_FEE;
        }

        // Tính số ngày đã quá hạn
        long daysExpired = Math.abs(daysRemaining);

        // Tính phần trăm phí dựa trên thời gian quá hạn
        // Càng quá hạn lâu, phí càng cao
        BigDecimal progressRatio = BigDecimal.valueOf(daysExpired)
                .divide(BigDecimal.valueOf(GRACE_PERIOD_DAYS), 4, BigDecimal.ROUND_HALF_UP);

        BigDecimal feePercentage = MIN_FEE_PERCENTAGE.add(
                MAX_FEE_PERCENTAGE.subtract(MIN_FEE_PERCENTAGE).multiply(progressRatio)
        );

        // Tính phí
        BigDecimal calculatedFee = estimatedRepairCost.multiply(feePercentage);

        // Đảm bảo phí không thấp hơn BASE_FEE
        return calculatedFee.max(BASE_FEE);
    }

    /**
     * Xây dựng ghi chú về phí bảo hành
     */
    private String buildFeeNote(Long daysRemaining, Integer mileageRemaining, BigDecimal fee) {
        long daysExpired = Math.abs(daysRemaining);

        StringBuilder note = new StringBuilder();
        note.append("Phí bảo hành: ").append(formatCurrency(fee)).append(" VNĐ\n");
        note.append("Lý do: ");

        if (daysRemaining < 0) {
            note.append("Quá hạn bảo hành ").append(daysExpired).append(" ngày. ");
        }
        if (mileageRemaining < 0) {
            note.append("Vượt giới hạn km ").append(Math.abs(mileageRemaining)).append(" km. ");
        }

        note.append("\nPhí bao gồm: Chi phí linh kiện, công sửa chữa, và phí quản lý.");
        note.append("\nLưu ý: Phí có thể thay đổi tùy thuộc vào tình trạng thực tế của xe.");

        return note.toString();
    }

    /**
     * Xây dựng lý do hết hạn bảo hành
     */
    private String buildExpirationReasons(WarrantyStatus status, long daysRemaining, int mileageRemaining) {
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
                reasons.append("Hết hạn bảo hành theo số km (vượt ")
                        .append(Math.abs(mileageRemaining))
                        .append(" km)");
                break;
            case EXPIRED_BOTH:
                reasons.append("Hết hạn bảo hành theo cả thời gian (quá ")
                        .append(Math.abs(daysRemaining))
                        .append(" ngày) và số km (vượt ")
                        .append(Math.abs(mileageRemaining))
                        .append(" km)");
                break;
            case PART_WARRANTY_EXPIRED:
                reasons.append("Linh kiện đã hết hạn bảo hành");
                break;
        }

        return reasons.toString();
    }

    /**
     * Format số tiền theo chuẩn Việt Nam
     */
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f", amount);
    }
}
