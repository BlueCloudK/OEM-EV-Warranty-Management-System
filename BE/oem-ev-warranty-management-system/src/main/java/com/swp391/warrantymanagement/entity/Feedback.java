package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho Đánh giá (Feedback) của khách hàng sau khi một yêu cầu bảo hành được hoàn tất.
 * <p>
 * <strong>Mục đích & Thiết kế:</strong>
 * <ul>
 *     <li>Thu thập phản hồi từ khách hàng để đo lường mức độ hài lòng và cải thiện chất lượng dịch vụ.</li>
 *     <li><b>Quy tắc nghiệp vụ quan trọng:</b> Một đánh giá chỉ có thể được tạo cho một yêu cầu bảo hành
 *     đã ở trạng thái {@link com.swp391.warrantymanagement.enums.WarrantyClaimStatus#COMPLETED}.</li>
 *     <li>Thiết lập mối quan hệ 1-1 chặt chẽ với {@link WarrantyClaim} để đảm bảo mỗi yêu cầu bảo hành
 *     chỉ có một đánh giá duy nhất, tránh việc gửi đánh giá nhiều lần.</li>
 *     <li>Sử dụng {@link PrePersist} để tự động ghi lại thời gian tạo, đảm bảo tính toàn vẹn của dữ liệu.</li>
 * </ul>
 */
@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh dựa trên ID
@ToString(exclude = {"warrantyClaim", "customer"}) // Tránh lỗi đệ quy và LazyInitializationException
public class Feedback {

    // ======= PRIMARY KEY =======
    /**
     * Khóa chính của đánh giá.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code GenerationType.IDENTITY} để ủy thác việc tạo ID tự tăng cho cơ sở dữ liệu,
     * đây là chiến lược hiệu quả và phổ biến nhất cho các hệ CSDL như MySQL, PostgreSQL.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long feedbackId;

    /**
     * Điểm đánh giá của khách hàng, theo thang điểm từ 1 đến 5.
     * <p>
     * <strong>Thiết kế:</strong> Việc xác thực giá trị (phải nằm trong khoảng 1-5) được thực hiện ở tầng DTO
     * (sử dụng các annotation như {@code @Min(1)}, {@code @Max(5)}) để bắt lỗi sớm ngay từ khi nhận request,
     * thay vì chờ đến khi lưu vào database.
     */
    @Column(name = "rating", nullable = false)
    private Integer rating;

    /**
     * Nội dung bình luận chi tiết từ khách hàng (tùy chọn).
     * <p>
     * <strong>Thiết kế:</strong>
     * <ul>
     *     <li><code>nullable = true</code>: Cho phép khách hàng chỉ gửi đánh giá sao mà không cần viết bình luận,
     *     giúp giảm bớt các bước không cần thiết và tăng tỷ lệ phản hồi.</li>
     *     <li><code>columnDefinition = "nvarchar(1000)"</code>: Hỗ trợ đầy đủ các ký tự tiếng Việt có dấu.</li>
     * </ul>
     */
    @Column(name = "comment", length = 1000, columnDefinition = "nvarchar(1000)")
    private String comment;

    /**
     * Thời điểm khách hàng tạo đánh giá.
     * <p>
     * <strong>Thiết kế:</strong> Giá trị này được tự động thiết lập bởi phương thức {@link #onCreate()}
     * thông qua callback {@link PrePersist}, đảm bảo tính nhất quán và chính xác của dữ liệu
     * mà không cần can thiệp từ tầng Service.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // ======= RELATIONSHIPS =======

    /**
     * Mối quan hệ 1-1 với {@link WarrantyClaim}.
     * <p>
     * <strong>Thiết kế:</strong>
     * <ul>
     *     <li><code>unique = true</code> trên cột khóa ngoại là một ràng buộc cực kỳ quan trọng,
     *     đảm bảo rằng một yêu cầu bảo hành chỉ có thể có duy nhất một đánh giá.</li>
     *     <li>Điều này giúp ngăn chặn việc gửi đánh giá nhiều lần và đảm bảo tính toàn vẹn của dữ liệu.</li>
     * </ul>
     */
    @OneToOne
    @JoinColumn(name = "warranty_claim_id", nullable = false, unique = true)
    private WarrantyClaim warrantyClaim;

    /**
     * Mối quan hệ N-1 với {@link Customer}.
     * <p>
     * <strong>Thiết kế:</strong>
     * <ul>
     *     <li>Nhiều đánh giá có thể thuộc về một khách hàng.</li>
     *     <li>Sử dụng <code>FetchType.LAZY</code> là một best practice về hiệu năng. Nó chỉ thị cho Hibernate
     *     không tải thông tin của {@code Customer} cùng lúc với {@code Feedback}, trừ khi được truy cập một cách tường minh.
     *     Điều này giúp tránh các câu lệnh JOIN không cần thiết.</li>
     * </ul>
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /**
     * Callback của JPA, được tự động gọi ngay trước khi một entity mới được lưu vào cơ sở dữ liệu.
     * <p>
     * <strong>Thiết kế:</strong> Việc sử dụng {@link PrePersist} để thiết lập các giá trị mặc định như {@code createdAt}
     * là một cách làm tốt để tách biệt logic khởi tạo khỏi logic nghiệp vụ ở tầng Service,
     * giúp đảm bảo dữ liệu luôn nhất quán.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
