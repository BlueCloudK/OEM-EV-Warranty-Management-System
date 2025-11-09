package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * PartRequestDTO - Used by EVM Staff/Admin to register new parts
 * Business Rule: Part is standalone component (NO vehicle association)
 * partId is auto-generated
 *
 * Includes warranty configuration fields for hierarchy warranty system
 */
@Data
public class PartRequestDTO {
    // ======= BASIC INFORMATION =======
    @NotBlank(message = "Part name is required")
    @Size(min = 2, max = 100, message = "Part name must be between 2 and 100 characters")
    private String partName;

    @NotBlank(message = "Part number is required")
    @Size(max = 50, message = "Part number cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9-_]+$", message = "Part number must contain only uppercase letters, numbers, hyphens and underscores")
    private String partNumber;

    @NotBlank(message = "Manufacturer is required")
    @Size(min = 2, max = 100, message = "Manufacturer must be between 2 and 100 characters")
    private String manufacturer;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Price cannot exceed 99,999,999.99")
    private BigDecimal price;

    // ======= WARRANTY CONFIGURATION =======
    /**
     * Linh kiện có bảo hành mở rộng riêng hay không.
     * true = Linh kiện QUAN TRỌNG (VD: Battery, Motor) → Kiểm tra part warranty
     * false = Linh kiện THƯỜNG (VD: Đèn, nội thất) → Kiểm tra vehicle warranty
     */
    private Boolean hasExtendedWarranty;

    /**
     * Thời hạn bảo hành mặc định (tháng).
     * VD: Battery - 96 tháng (8 năm), Motor - 48 tháng (4 năm)
     * Chỉ áp dụng khi hasExtendedWarranty = true
     */
    @Min(value = 1, message = "Warranty months must be at least 1")
    private Integer defaultWarrantyMonths;

    /**
     * Giới hạn km mặc định cho bảo hành.
     * VD: Battery - 192,000 km, Motor - 80,000 km
     * Chỉ áp dụng khi hasExtendedWarranty = true
     */
    @Min(value = 1, message = "Warranty mileage must be at least 1")
    private Integer defaultWarrantyMileage;

    /**
     * Grace period (ngày) sau khi hết hạn vẫn có thể bảo hành tính phí.
     * VD: 365 ngày cho Battery đắt tiền
     */
    @Min(value = 0, message = "Grace period cannot be negative")
    private Integer gracePeriodDays;

    /**
     * Phần trăm phí bảo hành tối thiểu (của chi phí sửa chữa).
     * VD: 0.20 = 20% (ngày đầu quá hạn)
     */
    @DecimalMin(value = "0.0", message = "Fee percentage min must be at least 0")
    @DecimalMax(value = "1.0", message = "Fee percentage min cannot exceed 1")
    private BigDecimal paidWarrantyFeePercentageMin;

    /**
     * Phần trăm phí bảo hành tối đa (của chi phí sửa chữa).
     * VD: 0.50 = 50% (ngày cuối grace period)
     */
    @DecimalMin(value = "0.0", message = "Fee percentage max must be at least 0")
    @DecimalMax(value = "1.0", message = "Fee percentage max cannot exceed 1")
    private BigDecimal paidWarrantyFeePercentageMax;
}
