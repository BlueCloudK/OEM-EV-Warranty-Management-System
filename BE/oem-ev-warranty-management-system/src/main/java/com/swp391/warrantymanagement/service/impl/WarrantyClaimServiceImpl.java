package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.ServiceHistoryDetail;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;
import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service xử lý warranty claims với workflow: SUBMITTED → MANAGER_REVIEW → PROCESSING → COMPLETED/REJECTED.
 * Bao gồm business validations, work log tracking, và tự động tạo service history khi hoàn tất.
 */
@Service
@RequiredArgsConstructor
public class WarrantyClaimServiceImpl implements WarrantyClaimService {

    private static final Logger logger = LoggerFactory.getLogger(WarrantyClaimServiceImpl.class);

    // Default constants (giống WarrantyValidationServiceImpl để đảm bảo consistency)
    private static final int DEFAULT_GRACE_PERIOD_DAYS = 180;
    private static final int DEFAULT_VEHICLE_MILEAGE_LIMIT = 100_000; // 100,000 km

    private final WarrantyClaimRepository warrantyClaimRepository;
    private final InstalledPartRepository installedPartRepository;
    private final PartRepository partRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ServiceHistoryRepository serviceHistoryRepository;
    private final com.swp391.warrantymanagement.repository.WorkLogRepository workLogRepository;

    /**
     * Lấy tất cả warranty claims với phân trang cho Admin/EVM Staff.
     *
     * @param pageable thông tin phân trang và sắp xếp
     * @return PagedResponse chứa danh sách WarrantyClaimResponseDTO
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getAllClaimsPage(Pageable pageable) {
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findAll(pageable);
        List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            claimPage.getNumber(),
            claimPage.getSize(),
            claimPage.getTotalElements(),
            claimPage.getTotalPages(),
            claimPage.isFirst(),
            claimPage.isLast()
        );
    }

    /**
     * Lấy thông tin chi tiết warranty claim theo ID.
     *
     * @param id warranty claim ID
     * @return WarrantyClaimResponseDTO chứa thông tin claim
     * @throws ResourceNotFoundException nếu claim không tồn tại
     */
    @Override
    public WarrantyClaimResponseDTO getClaimById(Long id) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));
        return WarrantyClaimMapper.toResponseDTO(claim);
    }

    /**
     * Tạo warranty claim mới với validations về vehicle ownership và warranty expiration.
     * <p>
     * <strong>Business validations:</strong>
     * <ul>
     * <li>Vehicle phải tồn tại trong hệ thống</li>
     * <li>Installed part phải tồn tại và thuộc về vehicle đó</li>
     * <li>Warranty của installed part phải còn hạn</li>
     * </ul>
     *
     * @param requestDTO thông tin warranty claim mới
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã tạo
     * @throws ResourceNotFoundException nếu vehicle hoặc installed part không tồn tại
     * @throws IllegalArgumentException nếu part không thuộc vehicle hoặc warranty đã hết hạn
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO createClaim(WarrantyClaimRequestDTO requestDTO) {
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", requestDTO.getInstalledPartId()));

        if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
            throw new IllegalArgumentException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        // Kiểm tra warranty expiration với HIERARCHY WARRANTY MODEL
        LocalDate today = LocalDate.now();
        Part part = installedPart.getPart();

        // Xác định warranty expiration date theo hierarchy model
        LocalDate expirationDate;
        String warrantyType;

        if (part != null && part.getHasExtendedWarranty() != null && part.getHasExtendedWarranty()) {
            // Extended warranty part → Check part-level warranty
            expirationDate = installedPart.getWarrantyExpirationDate();
            warrantyType = "part-level (extended warranty)";
            logger.info("Checking part-level warranty for extended part: {}", part.getPartName());
        } else {
            // Standard part → Check vehicle-level warranty
            expirationDate = vehicle.getWarrantyEndDate();
            warrantyType = "vehicle-level (standard part)";
            logger.info("Checking vehicle-level warranty for standard part: {}", part != null ? part.getPartName() : "unknown");
        }

        if (expirationDate.isBefore(today)) {
            // Warranty đã hết hạn - kiểm tra grace period
            long daysExpired = ChronoUnit.DAYS.between(expirationDate, today);

            // Lấy grace period từ Part (nếu có), fallback về default
            int gracePeriodDays = part != null && part.getGracePeriodDays() != null
                ? part.getGracePeriodDays()
                : DEFAULT_GRACE_PERIOD_DAYS;

            // Nếu còn trong grace period VÀ là paid warranty claim → Cho phép
            if (daysExpired <= gracePeriodDays) {
                if (requestDTO.getIsPaidWarranty() != null && requestDTO.getIsPaidWarranty()) {
                    // Valid paid warranty claim trong grace period
                    logger.info("Creating paid warranty claim in grace period: installedPartId={}, daysExpired={}, gracePeriod={}, warrantyType={}, usingDefault={}",
                        requestDTO.getInstalledPartId(), daysExpired, gracePeriodDays, warrantyType, (part == null || part.getGracePeriodDays() == null));
                } else {
                    // Hết hạn nhưng không phải paid warranty
                    throw new IllegalArgumentException("Warranty (" + warrantyType + ") expired on " + expirationDate +
                        ". To create a claim, use paid warranty option (isPaidWarranty=true).");
                }
            } else {
                // Quá grace period
                throw new IllegalArgumentException("Warranty (" + warrantyType + ") expired on " + expirationDate +
                    " and grace period of " + gracePeriodDays + " days has passed. Cannot create claim.");
            }
        }

        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Helper method tạo unique ID cho installed part với format "IP-XXXXXXXX".
     *
     * @return installed part ID với 8 ký tự UUID viết hoa
     */
    private String generateInstalledPartId() {
        return "IP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Cập nhật thông tin warranty claim (description và installed part).
     * <p>
     * <strong>Lưu ý:</strong> Chỉ update description và installed part. Để thay đổi status, sử dụng các workflow methods.
     *
     * @param id claim ID cần cập nhật
     * @param requestDTO thông tin cập nhật
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim hoặc installed part không tồn tại
     * @throws IllegalArgumentException nếu part không thuộc vehicle hoặc warranty đã hết hạn
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO updateClaim(Long id, WarrantyClaimRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));

        claim.setDescription(requestDTO.getDescription());

        // Update paid warranty fields if provided
        if (requestDTO.getIsPaidWarranty() != null) {
            claim.setIsPaidWarranty(requestDTO.getIsPaidWarranty());
        }
        if (requestDTO.getWarrantyFee() != null) {
            claim.setWarrantyFee(requestDTO.getWarrantyFee());
        }
        if (requestDTO.getPaidWarrantyNote() != null) {
            claim.setPaidWarrantyNote(requestDTO.getPaidWarrantyNote());
        }

        if (!claim.getInstalledPart().getInstalledPartId().equals(requestDTO.getInstalledPartId())) {
            InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
                .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", requestDTO.getInstalledPartId()));

            if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
                throw new IllegalArgumentException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
            }

            // Kiểm tra warranty expiration với HIERARCHY WARRANTY MODEL khi đổi part
            LocalDate today = LocalDate.now();
            Part part = installedPart.getPart();
            Vehicle vehicle = installedPart.getVehicle();

            // Xác định warranty expiration date theo hierarchy model
            LocalDate expirationDate;
            String warrantyType;

            if (part != null && part.getHasExtendedWarranty() != null && part.getHasExtendedWarranty()) {
                // Extended warranty part → Check part-level warranty
                expirationDate = installedPart.getWarrantyExpirationDate();
                warrantyType = "part-level (extended warranty)";
                logger.info("Checking part-level warranty for extended part: {}", part.getPartName());
            } else {
                // Standard part → Check vehicle-level warranty
                expirationDate = vehicle.getWarrantyEndDate();
                warrantyType = "vehicle-level (standard part)";
                logger.info("Checking vehicle-level warranty for standard part: {}", part != null ? part.getPartName() : "unknown");
            }

            if (expirationDate.isBefore(today)) {
                // Warranty đã hết hạn - kiểm tra grace period
                long daysExpired = ChronoUnit.DAYS.between(expirationDate, today);

                // Lấy grace period từ Part (nếu có), fallback về default
                int gracePeriodDays = part != null && part.getGracePeriodDays() != null
                    ? part.getGracePeriodDays()
                    : DEFAULT_GRACE_PERIOD_DAYS;

                // Nếu còn trong grace period VÀ là paid warranty claim → Cho phép
                if (daysExpired <= gracePeriodDays) {
                    if (claim.getIsPaidWarranty() != null && claim.getIsPaidWarranty()) {
                        // Valid paid warranty claim trong grace period
                        logger.info("Updating claim to expired part with paid warranty: claimId={}, installedPartId={}, daysExpired={}, gracePeriod={}, warrantyType={}, usingDefault={}",
                            id, requestDTO.getInstalledPartId(), daysExpired, gracePeriodDays, warrantyType, (part == null || part.getGracePeriodDays() == null));
                    } else {
                        // Hết hạn nhưng claim không phải paid warranty
                        throw new IllegalArgumentException("Warranty (" + warrantyType + ") expired on " + expirationDate +
                            ". Cannot switch to expired part without paid warranty.");
                    }
                } else {
                    // Quá grace period
                    throw new IllegalArgumentException("Warranty (" + warrantyType + ") expired on " + expirationDate +
                        " and grace period of " + gracePeriodDays + " days has passed.");
                }
            }

            claim.setInstalledPart(installedPart);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Cập nhật status của warranty claim với business logic validation.
     *
     * @param id claim ID
     * @param requestDTO thông tin status mới
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu status transition không hợp lệ
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO updateClaimStatus(Long id, WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));

        if (!isValidStatusTransition(claim.getStatus(), requestDTO.getStatus())) {
            throw new IllegalStateException("Invalid status transition from " + claim.getStatus() + " to " + requestDTO.getStatus());
        }

        claim.setStatus(requestDTO.getStatus());
        if (requestDTO.getStatus() == WarrantyClaimStatus.COMPLETED) {
            claim.setResolutionDate(LocalDateTime.now());
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Xóa warranty claim theo ID với role-based validation.
     * <p>
     * <strong>Quyền hạn:</strong>
     * <ul>
     * <li>ADMIN: Có thể xóa claim ở bất kỳ trạng thái nào</li>
     * <li>SC_STAFF: Chỉ có thể xóa claim ở trạng thái SUBMITTED hoặc PENDING_PAYMENT</li>
     * </ul>
     *
     * @param id claim ID cần xóa
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu SC_STAFF cố gắng xóa claim không ở trạng thái SUBMITTED/PENDING_PAYMENT
     */
    @Override
    @Transactional
    public void deleteClaim(Long id) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));

        // Kiểm tra quyền xóa dựa trên role
        Optional<String> currentUsername = SecurityUtil.getCurrentUsername();
        if (currentUsername.isPresent()) {
            User currentUser = userRepository.findByUsername(currentUsername.get())
                .orElse(null);

            if (currentUser != null) {
                String roleName = currentUser.getRole().getRoleName();

                // SC_STAFF chỉ có thể xóa claims ở trạng thái SUBMITTED hoặc PENDING_PAYMENT
                if ("SC_STAFF".equals(roleName)) {
                    if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED &&
                        claim.getStatus() != WarrantyClaimStatus.PENDING_PAYMENT) {
                        throw new IllegalStateException(
                            "SC_STAFF can only delete claims in SUBMITTED or PENDING_PAYMENT status. " +
                            "Current status: " + claim.getStatus()
                        );
                    }
                    logger.info("SC_STAFF {} deleting claim {} in status {}",
                        currentUsername.get(), id, claim.getStatus());
                }
                // ADMIN có thể xóa bất kỳ claim nào
                else if ("ADMIN".equals(roleName)) {
                    logger.info("ADMIN {} deleting claim {} in status {}",
                        currentUsername.get(), id, claim.getStatus());
                }
            }
        }

        warrantyClaimRepository.deleteById(id);
        logger.info("Successfully deleted warranty claim {}", id);
    }

    /**
     * Validate status transition theo state machine rules.
     *
     * @param current status hiện tại
     * @param target status mục tiêu
     * @return true nếu transition hợp lệ
     */
    private boolean isValidStatusTransition(WarrantyClaimStatus current, WarrantyClaimStatus target) {
        switch (current) {
            case SUBMITTED:
                // Free warranty: SUBMITTED → MANAGER_REVIEW
                return target == WarrantyClaimStatus.MANAGER_REVIEW || target == WarrantyClaimStatus.REJECTED;

            case PENDING_PAYMENT:
                // Paid warranty: chờ thanh toán → đã xác nhận thanh toán
                return target == WarrantyClaimStatus.PAYMENT_CONFIRMED || target == WarrantyClaimStatus.REJECTED;

            case PAYMENT_CONFIRMED:
                // Paid warranty: đã thanh toán → chuyển sang manager review
                return target == WarrantyClaimStatus.MANAGER_REVIEW || target == WarrantyClaimStatus.REJECTED;

            case MANAGER_REVIEW:
                return target == WarrantyClaimStatus.PROCESSING || target == WarrantyClaimStatus.REJECTED;

            case PROCESSING:
                return target == WarrantyClaimStatus.COMPLETED || target == WarrantyClaimStatus.REJECTED;

            default:
                return false;
        }
    }

    /**
     * SC Staff tạo warranty claim với status SUBMITTED (chờ admin review).
     *
     * @param requestDTO thông tin warranty claim
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã tạo
     * @throws ResourceNotFoundException nếu vehicle hoặc installed part không tồn tại
     * @throws IllegalArgumentException nếu part không thuộc vehicle hoặc warranty đã hết hạn
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO createClaimBySCStaff(WarrantyClaimRequestDTO requestDTO) {
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", requestDTO.getInstalledPartId()));

        if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
            throw new IllegalArgumentException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        // Kiểm tra warranty expiration với grace period support
        // Theo business rules: Phải kiểm tra CẢ vehicle warranty VÀ part warranty (cả time VÀ mileage), áp dụng điều kiện nghiêm ngặt nhất
        LocalDate today = LocalDate.now();
        LocalDate partExpirationDate = installedPart.getWarrantyExpirationDate();
        LocalDate vehicleExpirationDate = vehicle.getWarrantyEndDate();

        // Lấy grace period từ Part (nếu có), fallback về default
        Part part = installedPart.getPart();
        int gracePeriodDays = part != null && part.getGracePeriodDays() != null
            ? part.getGracePeriodDays()
            : DEFAULT_GRACE_PERIOD_DAYS;

        // 1. Tính số ngày hết hạn theo THỜI GIAN
        long partDaysExpired = partExpirationDate.isBefore(today) ? ChronoUnit.DAYS.between(partExpirationDate, today) : 0;
        long vehicleDaysExpired = vehicleExpirationDate.isBefore(today) ? ChronoUnit.DAYS.between(vehicleExpirationDate, today) : 0;

        // 2. Kiểm tra MILEAGE (số km)
        int currentVehicleMileage = vehicle.getMileage();
        int vehicleMileageLimit = DEFAULT_VEHICLE_MILEAGE_LIMIT;
        boolean vehicleMileageExpired = currentVehicleMileage > vehicleMileageLimit;

        // Part mileage check (nếu có extended warranty)
        boolean partMileageExpired = false;
        if (part.getHasExtendedWarranty() != null && part.getHasExtendedWarranty()) {
            int mileageAtInstallation = installedPart.getMileageAtInstallation() != null ? installedPart.getMileageAtInstallation() : 0;
            int mileageSinceInstallation = currentVehicleMileage - mileageAtInstallation;
            Integer partMileageLimit = installedPart.getWarrantyMileageLimit() != null
                ? installedPart.getWarrantyMileageLimit()
                : part.getDefaultWarrantyMileage();
            if (partMileageLimit != null) {
                partMileageExpired = mileageSinceInstallation > partMileageLimit;
            }
        }

        // 3. Áp dụng điều kiện nghiêm ngặt nhất
        long maxDaysExpired = Math.max(partDaysExpired, vehicleDaysExpired);
        boolean isExpiredByDate = maxDaysExpired > 0;
        boolean isExpiredByMileage = vehicleMileageExpired || partMileageExpired;
        boolean isExpired = isExpiredByDate || isExpiredByMileage;

        if (isExpired) {
            // Warranty đã hết hạn - kiểm tra grace period
            // LƯU Ý: Grace period CHỈ áp dụng cho THỜI GIAN, KHÔNG áp dụng cho MILEAGE
            // Nếu hết hạn do mileage → LUÔN LUÔN yêu cầu paid warranty
            // Nếu hết hạn do time trong grace period → có thể paid warranty

            if (isExpiredByMileage && !isExpiredByDate) {
                // Chỉ hết hạn do mileage, time còn hiệu lực
                if (requestDTO.getIsPaidWarranty() != null && requestDTO.getIsPaidWarranty()) {
                    logger.info("SC_STAFF creating paid warranty claim (expired by mileage): installedPartId={}, vehicleMileage={}, limit={}",
                        requestDTO.getInstalledPartId(), currentVehicleMileage, vehicleMileageLimit);
                } else {
                    throw new IllegalArgumentException("Warranty expired by mileage (" + currentVehicleMileage + " km > " + vehicleMileageLimit + " km)." +
                        " To create a claim, use paid warranty option (isPaidWarranty=true).");
                }
            } else if (maxDaysExpired <= gracePeriodDays) {
                // Hết hạn do time NHƯNG còn trong grace period
                if (requestDTO.getIsPaidWarranty() != null && requestDTO.getIsPaidWarranty()) {
                    // Valid paid warranty claim trong grace period
                    logger.info("SC_STAFF creating paid warranty claim in grace period: installedPartId={}, partDaysExpired={}, vehicleDaysExpired={}, maxDaysExpired={}, gracePeriod={}",
                        requestDTO.getInstalledPartId(), partDaysExpired, vehicleDaysExpired, maxDaysExpired, gracePeriodDays);
                } else {
                    // Hết hạn nhưng không phải paid warranty
                    String expiredEntity = vehicleDaysExpired > partDaysExpired ? "vehicle" : "part";
                    LocalDate expiredDate = vehicleDaysExpired > partDaysExpired ? vehicleExpirationDate : partExpirationDate;
                    throw new IllegalArgumentException("Warranty expired on " + expiredDate + " (" + expiredEntity + ")." +
                        " To create a claim, use paid warranty option (isPaidWarranty=true).");
                }
            } else {
                // Quá grace period (theo TIME)
                String expiredEntity = vehicleDaysExpired > partDaysExpired ? "vehicle" : "part";
                LocalDate expiredDate = vehicleDaysExpired > partDaysExpired ? vehicleExpirationDate : partExpirationDate;
                throw new IllegalArgumentException("Warranty expired on " + expiredDate + " (" + expiredEntity + ")" +
                    " and grace period of " + gracePeriodDays + " days has passed (expired " + maxDaysExpired + " days ago). Cannot create claim.");
            }
        }

        // Validation: Paid warranty must have warrantyFee > 0 (per business rules)
        if (requestDTO.getIsPaidWarranty() != null && requestDTO.getIsPaidWarranty()) {
            if (requestDTO.getWarrantyFee() == null || requestDTO.getWarrantyFee().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Paid warranty claim must have warrantyFee > 0. " +
                    "Use /api/warranty-validation/vehicle/{vehicleId}/calculate-fee to calculate the fee.");
            }
        }

        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);

        // Set initial status based on warranty type
        // - FREE warranty: SUBMITTED (go to admin review immediately)
        // - PAID warranty: PENDING_PAYMENT (wait for customer payment first)
        if (requestDTO.getIsPaidWarranty() != null && requestDTO.getIsPaidWarranty()) {
            claim.setStatus(WarrantyClaimStatus.PENDING_PAYMENT);
            logger.info("SC_STAFF creating PAID warranty claim - status set to PENDING_PAYMENT: claimId={}", claim.getWarrantyClaimId());
        } else {
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            logger.info("SC_STAFF creating FREE warranty claim - status set to SUBMITTED: claimId={}", claim.getWarrantyClaimId());
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Admin accept claim, chuyển status sang MANAGER_REVIEW.
     * Accepts claims from two sources:
     * - FREE warranty: SUBMITTED → MANAGER_REVIEW
     * - PAID warranty: PAYMENT_CONFIRMED → MANAGER_REVIEW (after customer paid)
     *
     * @param claimId claim ID cần accept
     * @param note ghi chú của admin (optional)
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu claim không ở status SUBMITTED hoặc PAYMENT_CONFIRMED
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO adminAcceptClaim(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        // Accept claims from SUBMITTED (free warranty) or PAYMENT_CONFIRMED (paid warranty)
        if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED &&
            claim.getStatus() != WarrantyClaimStatus.PAYMENT_CONFIRMED) {
            throw new IllegalStateException(
                "Claim must be in SUBMITTED (free warranty) or PAYMENT_CONFIRMED (paid warranty) status to accept. " +
                "Current status: " + claim.getStatus());
        }

        claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);

        if (note != null && !note.trim().isEmpty()) {
            claim.setDescription(claim.getDescription() + "\n[Admin Note]: " + note);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        logger.info("Admin accepted claim {} from status {} to MANAGER_REVIEW", claimId, claim.getStatus());
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Admin reject claim, chuyển status sang REJECTED và set resolution date.
     * Can reject from any non-final status (SUBMITTED, PENDING_PAYMENT, PAYMENT_CONFIRMED, MANAGER_REVIEW).
     *
     * @param claimId claim ID cần reject
     * @param reason lý do từ chối
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu claim đã ở final status (COMPLETED/REJECTED)
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO adminRejectClaim(Long claimId, String reason) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        // Cannot reject if already in final status
        if (claim.getStatus().isFinalStatus()) {
            throw new IllegalStateException("Cannot reject claim that is already in final status: " + claim.getStatus());
        }

        claim.setStatus(WarrantyClaimStatus.REJECTED);
        claim.setDescription(claim.getDescription() + "\n[Admin Rejection]: " + reason);
        claim.setResolutionDate(LocalDateTime.now());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        logger.info("Admin rejected claim {} with reason: {}", claimId, reason);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * SC Staff hoặc Admin xác nhận khách hàng đã thanh toán phí bảo hành tại quầy.
     * Chuyển status từ PENDING_PAYMENT sang PAYMENT_CONFIRMED.
     *
     * @param claimId claim ID cần xác nhận thanh toán
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu claim không ở status PENDING_PAYMENT
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO confirmPayment(Long claimId) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        if (claim.getStatus() != WarrantyClaimStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Claim must be in PENDING_PAYMENT status to confirm payment. Current status: " + claim.getStatus());
        }

        claim.setStatus(WarrantyClaimStatus.PAYMENT_CONFIRMED);

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        logger.info("Payment confirmed for claim {} - status updated to PAYMENT_CONFIRMED", claimId);

        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Technician bắt đầu xử lý claim, chuyển status từ MANAGER_REVIEW sang PROCESSING và tạo work log.
     *
     * @param claimId claim ID cần xử lý
     * @param note ghi chú của technician (optional)
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu claim không ở status MANAGER_REVIEW
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        if (claim.getStatus() != WarrantyClaimStatus.MANAGER_REVIEW) {
            throw new IllegalStateException("Claim must be in MANAGER_REVIEW status to start processing. Current status: " + claim.getStatus());
        }

        // Check daily claim limit for technician
        String username = SecurityUtil.getCurrentUsername()
            .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        User currentUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Check if user has a service center and daily limit configured
        if (currentUser.getServiceCenter() != null) {
            Integer dailyLimit = currentUser.getServiceCenter().getDailyClaimLimitPerTech();

            if (dailyLimit != null && dailyLimit > 0) {
                // Calculate start and end of today
                LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
                LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);

                // Count claims started by this user today
                long claimsStartedToday = workLogRepository.countClaimsStartedByUserToday(
                    currentUser.getUserId(),
                    startOfDay,
                    endOfDay
                );

                if (claimsStartedToday >= dailyLimit) {
                    throw new IllegalStateException(
                        String.format("Bạn đã đạt giới hạn xử lý claim trong ngày (%d/%d). Vui lòng thử lại vào ngày mai.",
                            claimsStartedToday, dailyLimit)
                    );
                }

                logger.info("Technician {} has started {}/{} claims today",
                    username, claimsStartedToday, dailyLimit);
            }
        }

        claim.setStatus(WarrantyClaimStatus.PROCESSING);
        if (note != null && !note.trim().isEmpty()) {
            claim.setDescription(claim.getDescription() + "\n[Tech Start]: " + note);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        // Create work log using already obtained currentUser
        try {
            WorkLog workLog = new WorkLog();
            workLog.setStartTime(LocalDateTime.now());
            workLog.setEndTime(null);
            workLog.setDescription(note != null && !note.trim().isEmpty() ? note : "Technician started processing claim");
            workLog.setWarrantyClaim(savedClaim);
            workLog.setUser(currentUser);

            workLogRepository.save(workLog);
            logger.info("Work log created for claim {} by user {} (ID: {})", claimId, username, currentUser.getUserId());
        } catch (Exception e) {
            logger.error("Failed to create work log for claim {}: {}", claimId, e.getMessage());
        }

        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Technician hoàn tất claim, chuyển status từ PROCESSING sang COMPLETED, cập nhật work log và tạo service history.
     *
     * @param claimId claim ID cần hoàn tất
     * @param completionNote ghi chú hoàn tất
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim không tồn tại
     * @throws IllegalStateException nếu claim không ở status PROCESSING
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        if (claim.getStatus() != WarrantyClaimStatus.PROCESSING) {
            throw new IllegalStateException("Claim must be in PROCESSING status to complete. Current status: " + claim.getStatus());
        }

        claim.setStatus(WarrantyClaimStatus.COMPLETED);
        claim.setDescription(claim.getDescription() + "\n[Tech Completion]: " + completionNote);
        claim.setResolutionDate(LocalDateTime.now());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        createWarrantyServiceHistory(savedClaim);

        try {
            SecurityUtil.getCurrentUsername().ifPresent(username -> {
                User currentUser = userRepository.findByUsername(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

                List<WorkLog> workLogs = savedClaim.getWorkLogs();

                if (workLogs != null && !workLogs.isEmpty()) {
                    Optional<WorkLog> activeWorkLogOpt = workLogs.stream()
                        .filter(wl -> wl.getEndTime() == null && wl.getUser().getUserId().equals(currentUser.getUserId()))
                        .findFirst();

                    if (activeWorkLogOpt.isPresent()) {
                        WorkLog activeWorkLog = activeWorkLogOpt.get();
                        activeWorkLog.setEndTime(LocalDateTime.now());
                        String updatedDescription = activeWorkLog.getDescription() + "\n[Completion]: " + completionNote;
                        activeWorkLog.setDescription(updatedDescription);
                        workLogRepository.save(activeWorkLog);

                        long duration = java.time.Duration.between(activeWorkLog.getStartTime(), activeWorkLog.getEndTime()).toMinutes();
                        logger.info("Work log completed for claim {} by user {} (ID: {}). Duration: {} minutes",
                            claimId, username, currentUser.getUserId(), duration);
                    } else {
                        logger.warn("No active work log found for claim {} and user {}", claimId, username);
                    }
                }
            });
        } catch (Exception e) {
            logger.error("Failed to complete work log for claim {}: {}", claimId, e.getMessage());
        }

        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    /**
     * Tạo service history record khi claim hoàn tất.
     *
     * @param claim warranty claim đã hoàn tất
     */
    private void createWarrantyServiceHistory(WarrantyClaim claim) {
        ServiceHistory serviceHistory = new ServiceHistory();
        serviceHistory.setServiceDate(LocalDate.now());
        serviceHistory.setServiceType("Warranty Claim");
        serviceHistory.setDescription("Warranty service for claim #" + claim.getWarrantyClaimId() + ": " + claim.getDescription());
        serviceHistory.setVehicle(claim.getVehicle());

        ServiceHistory savedServiceHistory = serviceHistoryRepository.save(serviceHistory);

        ServiceHistoryDetail detail = new ServiceHistoryDetail();

        ServiceHistoryDetailId detailId = new ServiceHistoryDetailId();
        detailId.setServiceHistoryId(savedServiceHistory.getServiceHistoryId());
        detailId.setPartId(claim.getInstalledPart().getPart().getPartId());

        detail.setId(detailId);
        detail.setServiceHistory(savedServiceHistory);
        detail.setPart(claim.getInstalledPart().getPart());
        detail.setQuantity(1);

        savedServiceHistory.getServiceHistoryDetails().add(detail);

        serviceHistoryRepository.save(savedServiceHistory);
    }

    /**
     * Lấy claims theo status với phân trang.
     *
     * @param status tên status (SUBMITTED, MANAGER_REVIEW, PROCESSING, COMPLETED, REJECTED)
     * @param pageable thông tin phân trang
     * @return PagedResponse chứa danh sách WarrantyClaimResponseDTO
     * @throws IllegalArgumentException nếu status không hợp lệ
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getClaimsByStatus(String status, Pageable pageable) {
        try {
            WarrantyClaimStatus claimStatus = WarrantyClaimStatus.valueOf(status.toUpperCase());
            Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatus(claimStatus, pageable);
            List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

            return new PagedResponse<>(
                responseDTOs,
                claimPage.getNumber(),
                claimPage.getSize(),
                claimPage.getTotalElements(),
                claimPage.getTotalPages(),
                claimPage.isFirst(),
                claimPage.isLast()
            );
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status, e);
        }
    }

    /**
     * Lấy claims đang chờ technician xử lý (MANAGER_REVIEW hoặc PROCESSING).
     *
     * @param pageable thông tin phân trang
     * @return PagedResponse chứa danh sách WarrantyClaimResponseDTO
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getTechPendingClaims(Pageable pageable) {
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatusIn(
            List.of(WarrantyClaimStatus.MANAGER_REVIEW, WarrantyClaimStatus.PROCESSING),
            pageable
        );
        List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            claimPage.getNumber(),
            claimPage.getSize(),
            claimPage.getTotalElements(),
            claimPage.getTotalPages(),
            claimPage.isFirst(),
            claimPage.isLast()
        );
    }

    /**
     * EVM Staff tự assign claim cho mình.
     *
     * @param claimId claim ID cần assign
     * @param username username của EVM Staff
     * @return WarrantyClaimResponseDTO chứa thông tin claim đã cập nhật
     * @throws ResourceNotFoundException nếu claim hoặc user không tồn tại
     */
    @Override
    @Transactional
    public WarrantyClaimResponseDTO assignClaimToMe(Long claimId, String username) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        claim.setAssignedTo(user);

        WarrantyClaim updatedClaim = warrantyClaimRepository.save(claim);

        return WarrantyClaimMapper.toResponseDTO(updatedClaim);
    }

    /**
     * Lấy danh sách claims được assign cho user hiện tại.
     *
     * @param username username của user
     * @param pageable thông tin phân trang
     * @return PagedResponse chứa danh sách WarrantyClaimResponseDTO
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getMyAssignedClaims(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByAssignedToUserId(user.getUserId(), pageable);
        List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            claimPage.getNumber(),
            claimPage.getSize(),
            claimPage.getTotalElements(),
            claimPage.getTotalPages(),
            claimPage.isFirst(),
            claimPage.isLast()
        );
    }

    /**
     * Customer xem tất cả warranty claims của mình với phân trang.
     *
     * @param username username của customer
     * @param pageable thông tin phân trang
     * @return PagedResponse chứa danh sách WarrantyClaimResponseDTO
     * @throws ResourceNotFoundException nếu user hoặc customer profile không tồn tại
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getMyWarrantyClaims(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(user.getCustomer())
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        Page<WarrantyClaim> claimPage = warrantyClaimRepository
            .findByVehicleCustomerCustomerId(customer.getCustomerId(), pageable);

        List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            claimPage.getNumber(),
            claimPage.getSize(),
            claimPage.getTotalElements(),
            claimPage.getTotalPages(),
            claimPage.isFirst(),
            claimPage.isLast()
        );
    }

    /**
     * Customer xem chi tiết warranty claim của mình với ownership validation.
     *
     * @param claimId claim ID
     * @param username username của customer
     * @return WarrantyClaimResponseDTO chứa thông tin claim
     * @throws ResourceNotFoundException nếu user, customer profile hoặc claim không tồn tại (hoặc không thuộc về customer)
     */
    @Override
    public WarrantyClaimResponseDTO getMyWarrantyClaimById(Long claimId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(user.getCustomer())
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        WarrantyClaim claim = warrantyClaimRepository
            .findByWarrantyClaimIdAndVehicleCustomerCustomerId(claimId, customer.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "WarrantyClaim", "id", claimId
            ));

        return WarrantyClaimMapper.toResponseDTO(claim);
    }
}
