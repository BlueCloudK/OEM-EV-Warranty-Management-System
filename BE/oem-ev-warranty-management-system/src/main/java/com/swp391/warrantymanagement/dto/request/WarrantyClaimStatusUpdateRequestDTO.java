package com.swp391.warrantymanagement.dto.request;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Request DTO: Dữ liệu đầu vào từ FE cho cập nhật status WarrantyClaim */
@Data
public class WarrantyClaimStatusUpdateRequestDTO {
    @NotNull(message = "Status is required")
    private WarrantyClaimStatus status;

    @Size(max = 500, message = "Comments cannot exceed 500 characters")
    private String comments; // lý do reject hoặc ghi chú thêm

    @NotBlank(message = "Updated by is required")
    @Size(min = 2, max = 100, message = "Updated by field must be between 2 and 100 characters")
    private String updatedBy; // staff đã cập nhật
}
