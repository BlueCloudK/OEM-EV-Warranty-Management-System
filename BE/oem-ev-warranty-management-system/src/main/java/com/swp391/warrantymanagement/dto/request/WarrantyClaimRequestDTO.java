package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/** Request DTO: Dữ liệu đầu vào từ FE cho tạo WarrantyClaim */
@Data
public class WarrantyClaimRequestDTO {
    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;

    @NotNull(message = "Installed part ID is required")
    @Positive(message = "Installed part ID must be a positive number")
    private Long installedPartId;

    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    /**
     * Có phải là bảo hành tính phí không (khi hết hạn bảo hành)
     * Mặc định = false (bảo hành miễn phí)
     */
    private Boolean isPaidWarranty = false;

    /**
     * Chi phí sửa chữa ước tính - dùng để tính phí bảo hành
     * Chỉ cần khi isPaidWarranty = true
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "Estimated repair cost must be greater than 0")
    private BigDecimal estimatedRepairCost;

    /**
     * Phí bảo hành (có thể được tính tự động hoặc nhập thủ công)
     * Chỉ áp dụng khi isPaidWarranty = true
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "Warranty fee must be greater than 0")
    private BigDecimal warrantyFee;

    /**
     * Ghi chú về việc tính phí (lý do, cách tính, v.v.)
     */
    @Size(max = 500, message = "Paid warranty note must not exceed 500 characters")
    private String paidWarrantyNote;
}
