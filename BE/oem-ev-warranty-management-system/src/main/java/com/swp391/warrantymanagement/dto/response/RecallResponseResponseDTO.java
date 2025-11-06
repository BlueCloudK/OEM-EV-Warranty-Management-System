package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO để trả về thông tin chi tiết của một RecallResponse.
 * <p>
 * <strong>Use case:</strong>
 * <ul>
 *   <li>Customer xem danh sách các recall responses của xe mình</li>
 *   <li>Admin xem danh sách tất cả responses của một chiến dịch recall</li>
 *   <li>Dashboard hiển thị thống kê: "50/100 xe đã chấp nhận recall"</li>
 * </ul>
 */
@Data
public class RecallResponseResponseDTO {
    private Long recallResponseId;

    // ===== RECALL CAMPAIGN INFO =====
    private Long recallRequestId;
    private String recallReason; // Lý do triệu hồi từ RecallRequest

    // ===== VEHICLE INFO =====
    private Long vehicleId;
    private String vehicleVin; // VIN của xe
    private String vehicleModel; // Model của xe (để hiển thị cho user)

    // ===== PART INFO =====
    private Long partId;
    private String partName; // Tên linh kiện bị lỗi
    private String partNumber; // Part number

    // ===== RESPONSE STATUS =====
    private RecallResponseStatus status;
    private String statusVietnamese; // Tên tiếng Việt của status

    // ===== CUSTOMER RESPONSE =====
    private String customerNote; // Ghi chú từ khách hàng

    // ===== WARRANTY CLAIM (nếu có) =====
    private Long warrantyClaimId; // Null nếu customer chưa accept hoặc declined
    private String warrantyClaimStatus; // Trạng thái của claim (nếu có)

    // ===== TIMESTAMPS =====
    private LocalDateTime createdAt; // Thời điểm tạo response (= khi Admin duyệt campaign)
    private LocalDateTime respondedAt; // Thời điểm customer phản hồi
    private LocalDateTime completedAt; // Thời điểm hoàn thành sửa chữa
}
