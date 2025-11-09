package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.WarrantyValidationResponseDTO;
import com.swp391.warrantymanagement.service.WarrantyValidationService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Controller xử lý các API liên quan đến kiểm tra và xác thực bảo hành.
 * <p>
 * <strong>Chức năng chính:</strong>
 * <ul>
 *     <li>Kiểm tra tính hợp lệ của bảo hành xe</li>
 *     <li>Kiểm tra tính hợp lệ của bảo hành linh kiện</li>
 *     <li>Tính toán phí bảo hành cho trường hợp quá hạn</li>
 *     <li>Cung cấp thông tin chi tiết về trạng thái bảo hành</li>
 * </ul>
 * <p>
 * <strong>Quyền truy cập:</strong>
 * <ul>
 *     <li>CUSTOMER: Kiểm tra bảo hành xe của mình</li>
 *     <li>SC_STAFF: Kiểm tra bảo hành cho bất kỳ xe nào</li>
 *     <li>ADMIN: Toàn quyền truy cập</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/warranty-validation")
@CrossOrigin
@RequiredArgsConstructor
public class WarrantyValidationController {
    private static final Logger logger = LoggerFactory.getLogger(WarrantyValidationController.class);

    private final WarrantyValidationService warrantyValidationService;

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một xe.
     * <p>
     * <strong>Use case:</strong> Customer hoặc Staff muốn biết xe còn bảo hành hay không
     * trước khi tạo warranty claim.
     *
     * @param vehicleId ID của xe cần kiểm tra
     * @return WarrantyValidationResponseDTO chứa thông tin chi tiết về bảo hành
     */
    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SC_STAFF') or hasRole('ADMIN')")
    public ResponseEntity<WarrantyValidationResponseDTO> validateVehicleWarranty(
            @PathVariable @NotNull @Positive Long vehicleId) {
        logger.info("Validate vehicle warranty request: vehicleId={}", vehicleId);

        WarrantyValidationResponseDTO response = warrantyValidationService.validateVehicleWarranty(vehicleId);

        logger.info("Validate vehicle warranty success: vehicleId={}, status={}",
                vehicleId, response.getWarrantyStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một xe theo VIN.
     * <p>
     * <strong>Use case:</strong> Tra cứu nhanh bằng VIN thay vì phải biết vehicleId.
     *
     * @param vin VIN của xe (Vehicle Identification Number)
     * @return WarrantyValidationResponseDTO chứa thông tin bảo hành
     */
    @GetMapping("/vehicle/vin/{vin}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SC_STAFF') or hasRole('ADMIN')")
    public ResponseEntity<WarrantyValidationResponseDTO> validateVehicleWarrantyByVin(
            @PathVariable @NotNull String vin) {
        logger.info("Validate vehicle warranty by VIN request: vin={}", vin);

        WarrantyValidationResponseDTO response = warrantyValidationService.validateVehicleWarrantyByVin(vin);

        logger.info("Validate vehicle warranty by VIN success: vin={}, status={}",
                vin, response.getWarrantyStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một linh kiện cụ thể.
     * <p>
     * <strong>Use case:</strong> Kiểm tra bảo hành của một linh kiện đã lắp đặt
     * (ví dụ: battery, motor) trước khi tạo claim.
     *
     * @param installedPartId ID của linh kiện đã lắp đặt
     * @return WarrantyValidationResponseDTO chứa thông tin bảo hành linh kiện
     */
    @GetMapping("/installed-part/{installedPartId}")
    @PreAuthorize("hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<WarrantyValidationResponseDTO> validateInstalledPartWarranty(
            @PathVariable @NotNull @Positive Long installedPartId) {
        logger.info("Validate installed part warranty request: installedPartId={}", installedPartId);

        WarrantyValidationResponseDTO response = warrantyValidationService.validateInstalledPartWarranty(installedPartId);

        logger.info("Validate installed part warranty success: installedPartId={}, status={}",
                installedPartId, response.getWarrantyStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * Tính toán phí bảo hành cho xe đã hết hạn.
     * <p>
     * <strong>Business logic:</strong>
     * <ul>
     *     <li>Nếu xe còn trong grace period (180 ngày) → Cho phép bảo hành tính phí</li>
     *     <li>Phí được tính dựa trên: thời gian quá hạn, chi phí sửa chữa ước tính</li>
     *     <li>Nếu quá lâu không còn grace period → Từ chối</li>
     * </ul>
     *
     * @param vehicleId ID của xe
     * @param estimatedRepairCost Chi phí sửa chữa ước tính (VNĐ)
     * @return WarrantyValidationResponseDTO với thông tin phí bảo hành
     */
    @GetMapping("/vehicle/{vehicleId}/calculate-fee")
    @PreAuthorize("hasRole('SC_STAFF') or hasRole('ADMIN')")
    public ResponseEntity<WarrantyValidationResponseDTO> calculatePaidWarrantyFee(
            @PathVariable @NotNull @Positive Long vehicleId,
            @RequestParam @NotNull @Positive BigDecimal estimatedRepairCost) {
        logger.info("Calculate paid warranty fee request: vehicleId={}, estimatedRepairCost={}",
                vehicleId, estimatedRepairCost);

        WarrantyValidationResponseDTO response = warrantyValidationService.calculatePaidWarrantyFee(
                vehicleId, estimatedRepairCost);

        logger.info("Calculate paid warranty fee success: vehicleId={}, fee={}",
                vehicleId, response.getEstimatedWarrantyFee());

        return ResponseEntity.ok(response);
    }

    /**
     * Tính toán phí bảo hành cho linh kiện đã hết hạn.
     *
     * @param installedPartId ID của linh kiện
     * @param estimatedRepairCost Chi phí sửa chữa ước tính (VNĐ)
     * @return WarrantyValidationResponseDTO với thông tin phí bảo hành linh kiện
     */
    @GetMapping("/installed-part/{installedPartId}/calculate-fee")
    @PreAuthorize("hasRole('SC_STAFF') or hasRole('ADMIN')")
    public ResponseEntity<WarrantyValidationResponseDTO> calculatePaidWarrantyFeeForPart(
            @PathVariable @NotNull @Positive Long installedPartId,
            @RequestParam @NotNull @Positive BigDecimal estimatedRepairCost) {
        logger.info("Calculate paid warranty fee for part request: installedPartId={}, estimatedRepairCost={}",
                installedPartId, estimatedRepairCost);

        WarrantyValidationResponseDTO response = warrantyValidationService.calculatePaidWarrantyFeeForPart(
                installedPartId, estimatedRepairCost);

        logger.info("Calculate paid warranty fee for part success: installedPartId={}, fee={}",
                installedPartId, response.getEstimatedWarrantyFee());

        return ResponseEntity.ok(response);
    }
}
