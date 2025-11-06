package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity đại diện cho một yêu cầu triệu hồi (Recall Request) từ nhà sản xuất (EVM) khi phát hiện lỗi hàng loạt trên các linh kiện.
 * <p>
 *  <strong>Mục đích:</strong>
 *  <ul>
 *   <li>Quản lý quy trình triệu hồi, bắt đầu từ việc phát hiện lỗi hàng loạt cho đến khi khách hàng đưa xe đến trung tâm bảo hành.</li>
 *   <li>Tự động tạo các yêu cầu bảo hành (Warranty Claim) cho các xe bị ảnh hưởng bởi đợt triệu hồi này.</li>
 *  </ul>
 */
@Entity
@Table(name = "recall_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh dựa trên ID
@ToString(exclude = {"installedPart", "createdBy", "approvedBy", "warrantyClaim"}) // Tránh lỗi đệ quy
public class RecallRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recall_request_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long recallRequestId;

    /**
     * Linh kiện (Part) bị lỗi và cần được triệu hồi.
     * <p>
     *  <strong>Mối quan hệ N-1:</strong> Nhiều yêu cầu triệu hồi có thể liên quan đến một linh kiện duy nhất.
     *  Sử dụng FetchType.LAZY để tối ưu hiệu năng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installed_part_id", nullable = false)
    private InstalledPart installedPart;

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
     * Yêu cầu bảo hành (Warranty Claim) được tạo tự động từ yêu cầu triệu hồi này.
     * <p>
     *  <strong>Mối quan hệ 1-1:</strong> Mỗi yêu cầu triệu hồi tạo ra một yêu cầu bảo hành duy nhất.
     *  Sử dụng FetchType.LAZY để tối ưu hiệu năng.
     */
    @OneToOne(mappedBy = "recallRequest", fetch = FetchType.LAZY)
    private WarrantyClaim warrantyClaim;

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
