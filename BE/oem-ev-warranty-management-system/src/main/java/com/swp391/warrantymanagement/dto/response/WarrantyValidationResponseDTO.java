package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.WarrantyStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO trả về kết quả kiểm tra tính hợp lệ của bảo hành.
 * <p>
 * <strong>Mục đích:</strong> Cung cấp thông tin đầy đủ cho frontend để hiển thị
 * trạng thái bảo hành và đưa ra lựa chọn cho customer (bảo hành miễn phí hoặc tính phí).
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarrantyValidationResponseDTO {

    /**
     * Trạng thái bảo hành (VALID, EXPIRED_DATE, EXPIRED_MILEAGE, v.v.)
     */
    private WarrantyStatus warrantyStatus;

    /**
     * Mô tả trạng thái bảo hành (bằng tiếng Việt)
     */
    private String statusDescription;

    /**
     * Có hợp lệ để bảo hành miễn phí hay không
     */
    private Boolean isValidForFreeWarranty;

    /**
     * Có thể bảo hành tính phí hay không (khi hết hạn)
     */
    private Boolean canProvidePaidWarranty;

    /**
     * Phí bảo hành ước tính (nếu chọn bảo hành tính phí)
     */
    private BigDecimal estimatedWarrantyFee;

    /**
     * Ghi chú về phí bảo hành
     */
    private String feeNote;

    // ========== THÔNG TIN CHI TIẾT VỀ BẢO HÀNH ==========

    /**
     * Ngày bắt đầu bảo hành của xe
     */
    private LocalDate warrantyStartDate;

    /**
     * Ngày hết hạn bảo hành của xe
     */
    private LocalDate warrantyEndDate;

    /**
     * Số ngày còn lại của bảo hành (âm nếu đã hết hạn)
     */
    private Long daysRemaining;

    /**
     * Số km hiện tại của xe
     */
    private Integer currentMileage;

    /**
     * Giới hạn km bảo hành (nếu có)
     */
    private Integer mileageLimit;

    /**
     * Số km còn lại trong bảo hành (âm nếu vượt giới hạn)
     */
    private Integer mileageRemaining;

    // ========== THÔNG TIN VỀ LINH KIỆN (nếu kiểm tra theo linh kiện) ==========

    /**
     * ID của linh kiện được kiểm tra
     */
    private Long installedPartId;

    /**
     * Tên linh kiện
     */
    private String partName;

    /**
     * Ngày hết hạn bảo hành của linh kiện
     */
    private LocalDate partWarrantyExpirationDate;

    /**
     * Số ngày còn lại của bảo hành linh kiện
     */
    private Long partDaysRemaining;

    // ========== THÔNG TIN VỀ XE ==========

    /**
     * ID của xe
     */
    private Long vehicleId;

    /**
     * VIN của xe
     */
    private String vehicleVin;

    /**
     * Tên/model xe
     */
    private String vehicleName;

    /**
     * Các lý do hết hạn bảo hành (nếu có)
     */
    private String expirationReasons;

    /**
     * Số ngày grace period được áp dụng cho part này
     * (180 ngày mặc định, hoặc custom value từ part)
     */
    private Integer gracePeriodDays;
}
