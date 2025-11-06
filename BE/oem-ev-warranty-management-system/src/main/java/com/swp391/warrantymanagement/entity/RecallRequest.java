package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity đại diện cho một chiến dịch triệu hồi (Recall Campaign) từ nhà sản xuất (EVM) khi phát hiện lỗi hàng loạt trên một loại linh kiện.
 * <p>
 *  <strong>Mục đích:</strong>
 *  <ul>
 *   <li>Quản lý chiến dịch triệu hồi cho một loại Part bị lỗi (ví dụ: Pin Model X có nguy cơ cháy nổ).</li>
 *   <li>Khi Admin duyệt, hệ thống tự động tìm tất cả các xe bị ảnh hưởng và tạo RecallResponse cho từng xe.</li>
 *   <li>Mỗi RecallResponse sẽ tự động tạo WarrantyClaim khi khách hàng chấp nhận tham gia.</li>
 *  </ul>
 *
 *  <strong>Relationship:</strong>
 *  <pre>
 *  RecallRequest (1 chiến dịch cho Part bị lỗi)
 *     └── RecallResponse[] (danh sách xe bị ảnh hưởng)
 *            └── WarrantyClaim (từng xe)
 *  </pre>
 */
@Entity
@Table(name = "recall_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh dựa trên ID
@ToString(exclude = {"part", "createdBy", "approvedBy", "recallResponses"}) // Tránh lỗi đệ quy
public class RecallRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recall_request_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long recallRequestId;

    /**
     * Loại linh kiện (Part) bị lỗi và cần được triệu hồi.
     * <p>
     *  <strong>Mối quan hệ N-1:</strong> Nhiều chiến dịch triệu hồi có thể liên quan đến một loại linh kiện.
     *  <p>
     *  <strong>Ví dụ:</strong> "Pin Model X v1.2" bị lỗi → Tất cả xe lắp pin này đều bị ảnh hưởng.
     *  <p>
     *  Sử dụng FetchType.LAZY để tối ưu hiệu năng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    /**
     * Trạng thái hiện tại của yêu cầu triệu hồi (PENDING, APPROVED, REJECTED, COMPLETED).
     * <p>
     *  <strong>Enum:</strong> Sử dụng Enum để đảm bảo tính nhất quán và dễ dàng quản lý các trạng thái.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallRequestStatus status;

    /**
     * Lý do triệu hồi (ví dụ: lỗi pin, nguy cơ cháy nổ).
     * <p>
     *  <strong>Column Definition:</strong> Sử dụng nvarchar(1000) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt).
     */
    @Column(length = 1000, columnDefinition = "nvarchar(1000)")
    private String reason;

    /**
     * Ghi chú từ Admin (người duyệt yêu cầu triệu hồi).
     * <p>
     *  <strong>Column Definition:</strong> Sử dụng nvarchar(1000) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt).
     */
    @Column(length = 1000, columnDefinition = "nvarchar(1000)")
    private String adminNote;

    /**
     * Ghi chú từ Khách hàng (phản hồi về yêu cầu triệu hồi).
     * <p>
     *  <strong>Column Definition:</strong> Sử dụng nvarchar(1000) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt).
     */
    @Column(length = 1000, columnDefinition = "nvarchar(1000)")
    private String customerNote;

    /**
     * Nhân viên EVM (EVM_STAFF) tạo yêu cầu triệu hồi.
     * <p>
     *  <strong>Mối quan hệ N-1:</strong> Nhiều yêu cầu triệu hồi được tạo bởi một nhân viên.
     *  Sử dụng FetchType.LAZY để tối ưu hiệu năng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /**
     * Admin (người có quyền) duyệt yêu cầu triệu hồi.
     * <p>
     *  <strong>Mối quan hệ N-1:</strong> Một Admin có thể duyệt nhiều yêu cầu triệu hồi.
     *  Sử dụng FetchType.LAZY để tối ưu hiệu năng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    /**
     * Thời điểm yêu cầu được tạo.
     */
    private LocalDateTime createdAt;
    /**
     * Thời điểm yêu cầu được cập nhật.
     */
    private LocalDateTime updatedAt;

    /**
     * Danh sách các RecallResponse - mỗi xe bị ảnh hưởng có một response riêng.
     * <p>
     *  <strong>Mối quan hệ 1-N:</strong> Một chiến dịch triệu hồi có nhiều response (mỗi xe một response).
     *  <p>
     *  <strong>Flow:</strong> Khi Admin duyệt RecallRequest, hệ thống tự động tạo RecallResponse cho tất cả xe bị ảnh hưởng.
     */
    @OneToMany(mappedBy = "recallRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<RecallResponse> recallResponses = new java.util.ArrayList<>();

    /**
     * JPA Lifecycle Callback - Tự động thiết lập giá trị cho createdAt và updatedAt khi một đối tượng mới được tạo.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * JPA Lifecycle Callback - Tự động cập nhật giá trị cho updatedAt khi có bất kỳ thay đổi nào.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
