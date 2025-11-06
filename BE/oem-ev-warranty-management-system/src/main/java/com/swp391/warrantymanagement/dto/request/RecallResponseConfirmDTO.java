package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO để khách hàng xác nhận (chấp nhận hoặc từ chối) một RecallResponse.
 * <p>
 * <strong>Use case:</strong>
 * <pre>
 * 1. Customer nhận thông báo về đợt triệu hồi ảnh hưởng đến xe của mình
 * 2. Customer gọi API với DTO này để chấp nhận/từ chối
 * 3. Nếu chấp nhận → Hệ thống tự động tạo WarrantyClaim
 * </pre>
 */
@Data
public class RecallResponseConfirmDTO {
    /**
     * Khách hàng chấp nhận (true) hoặc từ chối (false) tham gia recall.
     */
    @NotNull(message = "Accepted field is required")
    private Boolean accepted;

    /**
     * Ghi chú từ khách hàng (tùy chọn).
     * <p>
     * Ví dụ:
     * - Nếu chấp nhận: "Tôi sẽ đưa xe đến trung tâm vào tuần sau"
     * - Nếu từ chối: "Tôi đã bán xe này rồi"
     */
    @Size(max = 1000, message = "Customer note must not exceed 1000 characters")
    private String customerNote;
}
