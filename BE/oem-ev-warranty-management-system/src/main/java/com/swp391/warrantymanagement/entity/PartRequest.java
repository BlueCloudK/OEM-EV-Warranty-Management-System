package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.PartRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho một Yêu cầu Linh kiện (Part Request) từ Kỹ thuật viên (Technician) đến Nhà sản xuất (EVM).
 * <p>
 * <strong>Mục đích & Thiết kế:</strong>
 * <ul>
 *     <li>Quản lý toàn bộ vòng đời của một yêu cầu cung ứng linh kiện, từ lúc tạo cho đến khi giao hàng thành công.</li>
 *     <li>Đóng vai trò là trung tâm của quy trình logistics, theo dõi trạng thái của yêu cầu thông qua một state machine:
 *     {@code PENDING -> APPROVED/REJECTED -> SHIPPED -> DELIVERED}.</li>
 *     <li>Sử dụng {@link com.swp391.warrantymanagement.enums.PartRequestStatus} với {@code EnumType.STRING} để lưu trữ trạng thái,
 *     đảm bảo tính dễ đọc và an toàn khi thay đổi thứ tự các enum trong tương lai.</li>
 *     <li>Sử dụng {@link FetchType#LAZY} cho tất cả các mối quan hệ {@code ManyToOne} để tối ưu hiệu năng,
 *     tránh tải các đối tượng không cần thiết khi truy vấn.</li>
 * </ul>
 */
@Entity
@Table(name = "part_requests")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh các đối tượng entity dựa trên ID duy nhất.
@ToString(exclude = {"warrantyClaim", "faultyPart", "requestedBy", "approvedBy", "serviceCenter"}) // Tránh lỗi đệ quy (circular dependency) và LazyInitializationException khi gọi toString().
public class PartRequest {

    /**
     * Khóa chính của yêu cầu linh kiện.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long requestId;

    /**
     * Thời điểm yêu cầu được tạo.
     */
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    /**
     * Mô tả chi tiết về vấn đề của linh kiện bị lỗi.
     */
    @Column(name = "issue_description", nullable = false, length = 1000, columnDefinition = "nvarchar(1000)")
    private String issueDescription;

    /**
     * Trạng thái hiện tại của yêu cầu.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code EnumType.STRING} là một best practice.
     * Nó lưu tên của enum (ví dụ: "PENDING") vào database thay vì vị trí thứ tự (0, 1, 2).
     * Điều này giúp cho việc thêm hoặc sắp xếp lại các trạng thái trong file Enum
     * không làm hỏng dữ liệu hiện có.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PartRequestStatus status = PartRequestStatus.PENDING;

    /**
     * Số lượng linh kiện cần yêu cầu.
     */
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    /**
     * Thời điểm yêu cầu được duyệt bởi EVM_STAFF.
     */
    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    /**
     * Thời điểm linh kiện được gửi đi từ kho.
     */
    @Column(name = "shipped_date")
    private LocalDateTime shippedDate;

    /**
     * Thời điểm trung tâm bảo hành xác nhận đã nhận được linh kiện.
     */
    @Column(name = "delivered_date")
    private LocalDateTime deliveredDate;

    /**
     * Lý do yêu cầu bị từ chối (nếu có).
     * <p>
     * <strong>Thiết kế:</strong> Trường này là bắt buộc khi từ chối một yêu cầu,
     * giúp Kỹ thuật viên hiểu rõ tại sao yêu cầu của họ không được chấp thuận.
     */
    @Column(name = "rejection_reason", length = 500, columnDefinition = "nvarchar(500)")
    private String rejectionReason;

    /**
     * Mã vận đơn để theo dõi quá trình vận chuyển.
     */
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    /**
     * Các ghi chú chung từ người duyệt (EVM_STAFF).
     */
    @Column(name = "notes", length = 1000, columnDefinition = "nvarchar(1000)")
    private String notes;

    /**
     * Mối quan hệ N-1 tới {@link WarrantyClaim}.
     * Cho biết yêu cầu linh kiện này thuộc về yêu cầu bảo hành nào.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warranty_claim_id", nullable = false)
    private WarrantyClaim warrantyClaim;

    /**
     * Mối quan hệ N-1 tới {@link Part}.
     * Cho biết linh kiện nào bị lỗi và cần được thay thế.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faulty_part_id", nullable = false)
    private Part faultyPart;

    /**
     * Mối quan hệ N-1 tới {@link User}.
     * Cho biết Kỹ thuật viên nào đã tạo yêu cầu này.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    /**
     * Mối quan hệ N-1 tới {@link User}.
     * Cho biết nhân viên EVM_STAFF nào đã duyệt hoặc từ chối yêu cầu.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    /**
     * Mối quan hệ N-1 tới {@link ServiceCenter}.
     * Cho biết trung tâm bảo hành nào cần nhận linh kiện.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    private ServiceCenter serviceCenter;
}
