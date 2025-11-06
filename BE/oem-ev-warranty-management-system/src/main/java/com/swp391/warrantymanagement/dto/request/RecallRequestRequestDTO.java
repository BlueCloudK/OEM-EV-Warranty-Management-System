package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO để tạo một chiến dịch triệu hồi (Recall Campaign) mới.
 * <p>
 * <strong>Thay đổi:</strong> Thay vì nhận installedPartId (linh kiện cụ thể trên 1 xe),
 * bây giờ nhận partId (loại linh kiện bị lỗi).
 * <p>
 * <strong>Flow:</strong>
 * <pre>
 * 1. EVM_STAFF tạo RecallRequest với partId (ví dụ: "Pin Model X v1.2")
 * 2. Admin duyệt → Hệ thống tự động tìm tất cả xe lắp Part này
 * 3. Tạo RecallResponse cho từng xe bị ảnh hưởng
 * </pre>
 */
@Data
public class RecallRequestRequestDTO {
    @NotNull(message = "Part ID is required")
    private Long partId; // Loại linh kiện bị lỗi (không phải installed part cụ thể)

    @NotBlank(message = "Recall reason is required")
    @Size(min = 10, max = 1000, message = "Recall reason must be between 10 and 1000 characters")
    private String reason;
}

