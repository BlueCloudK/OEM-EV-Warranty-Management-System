package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho phản hồi của một xe cụ thể trong một chiến dịch triệu hồi (Recall Campaign).
 * <p>
 * <strong>Mục đích:</strong>
 * <ul>
 *   <li>Khi Admin duyệt một RecallRequest (chiến dịch triệu hồi), hệ thống tự động tìm tất cả các xe
 *   bị ảnh hưởng và tạo một RecallResponse cho mỗi xe.</li>
 *   <li>Mỗi RecallResponse theo dõi trạng thái riêng của từng xe: khách hàng chấp nhận/từ chối,
 *   tiến độ sửa chữa, v.v.</li>
 *   <li>Khi khách hàng chấp nhận, hệ thống tự động tạo WarrantyClaim tương ứng.</li>
 * </ul>
 *
 * <strong>Relationship:</strong>
 * <pre>
 * RecallRequest (1 chiến dịch)
 *    ├── RecallResponse (xe A) → WarrantyClaim (xe A)
 *    ├── RecallResponse (xe B) → WarrantyClaim (xe B)
 *    └── RecallResponse (xe N) → WarrantyClaim (xe N)
 * </pre>
 */
@Entity
@Table(name = "recall_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"recallRequest", "vehicle", "warrantyClaim"})
public class RecallResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recall_response_id")
    @EqualsAndHashCode.Include
    private Long recallResponseId;

    /**
     * Chiến dịch triệu hồi mà response này thuộc về.
     * <p>
     * <strong>Mối quan hệ N-1:</strong> Nhiều RecallResponse thuộc về một RecallRequest.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recall_request_id", nullable = false)
    private RecallRequest recallRequest;

    /**
     * Xe cụ thể bị ảnh hưởng bởi đợt triệu hồi.
     * <p>
     * <strong>Mối quan hệ N-1:</strong> Một xe có thể có nhiều RecallResponse (từ các đợt triệu hồi khác nhau).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Trạng thái phản hồi của xe này (PENDING, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED).
     * <p>
     * <strong>Flow:</strong>
     * <pre>
     * PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
     *     └─→ DECLINED
     * </pre>
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallResponseStatus status;

    /**
     * Ghi chú từ khách hàng khi phản hồi (chấp nhận hoặc từ chối).
     * <p>
     * <strong>Column Definition:</strong> Sử dụng nvarchar(1000) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt).
     */
    @Column(length = 1000, columnDefinition = "nvarchar(1000)")
    private String customerNote;

    /**
     * Yêu cầu bảo hành (Warranty Claim) được tạo tự động khi khách hàng chấp nhận recall.
     * <p>
     * <strong>Mối quan hệ 1-1:</strong> Mỗi RecallResponse chỉ tạo ra một WarrantyClaim duy nhất.
     * <p>
     * <strong>Nullable:</strong> Chỉ có giá trị khi customer ACCEPTED. Null nếu DECLINED hoặc PENDING.
     */
    @OneToOne(mappedBy = "recallResponse", fetch = FetchType.LAZY)
    private WarrantyClaim warrantyClaim;

    /**
     * Thời điểm RecallResponse được tạo (= thời điểm Admin duyệt RecallRequest).
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Thời điểm khách hàng phản hồi (chấp nhận hoặc từ chối).
     */
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    /**
     * Thời điểm hoàn thành sửa chữa (khi status = COMPLETED).
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * JPA Lifecycle Callback - Tự động thiết lập createdAt khi entity được tạo.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
