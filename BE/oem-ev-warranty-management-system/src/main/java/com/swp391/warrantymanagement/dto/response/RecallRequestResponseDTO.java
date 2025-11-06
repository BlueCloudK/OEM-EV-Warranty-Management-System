package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO để trả về thông tin chiến dịch triệu hồi (Recall Campaign).
 * <p>
 * <strong>Thay đổi:</strong> RecallRequest giờ đại diện cho một campaign (nhiều xe),
 * không còn chứa thông tin vehicle/customer cụ thể.
 */
@Data
public class RecallRequestResponseDTO {
    private Long recallRequestId;

    // ===== PART INFO (loại linh kiện bị lỗi) =====
    private Long partId;
    private String partName;
    private String partNumber;
    private String manufacturer;

    // ===== CAMPAIGN INFO =====
    private RecallRequestStatus status;
    private String reason;
    private String adminNote;
    private String customerNote; // Deprecated, sẽ xóa trong tương lai

    // ===== AUDIT INFO =====
    private String createdByUsername;
    private String approvedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ===== DEPRECATED FIELDS (sẽ xóa trong tương lai) =====
    @Deprecated
    private Long installedPartId; // Không còn dùng
    @Deprecated
    private Long vehicleId; // Không còn dùng - xem RecallResponse thay thế
    @Deprecated
    private String vehicleName; // Không còn dùng - xem RecallResponse thay thế
    @Deprecated
    private String customerId; // Không còn dùng - xem RecallResponse thay thế
    @Deprecated
    private String customerName; // Không còn dùng - xem RecallResponse thay thế
}
