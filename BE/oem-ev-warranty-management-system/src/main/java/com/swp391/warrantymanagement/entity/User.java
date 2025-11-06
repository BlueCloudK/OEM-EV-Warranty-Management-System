package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Entity đại diện cho người dùng trong hệ thống bảo hành, hỗ trợ mô hình
 * phân quyền RBAC (Role-Based Access Control) với 5 vai trò chính.
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *     <li>Sử dụng {@code @PrePersist} để tự động gán {@code createdAt}, đảm bảo audit trail
 *     không bị thiếu ngay cả khi service layer quên set giá trị này.</li>
 *     <li>Quan hệ 1-1 với {@link Customer} cho phép tách biệt thông tin đặc thù của khách hàng
 *     (phone, vehicles) khỏi entity User chung, tránh null fields cho các role khác.</li>
 *     <li>Quan hệ N-1 với {@link ServiceCenter} cho phép Staff/Technician thuộc về một trung tâm cụ thể,
 *     trong khi CUSTOMER và EVM_STAFF có {@code serviceCenter = null} (không gắn với trung tâm nào).</li>
 *     <li>Sử dụng {@code columnDefinition = "nvarchar"} cho các trường có thể chứa tiếng Việt
 *     (username, address) để đảm bảo tương thích với SQL Server và tránh mất dữ liệu Unicode.</li>
 * </ul>
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Chỉ include ID trong equals/hashCode để tránh so sánh sâu các lazy relationships,
// phòng tránh trigger load từ database và vấn đề với JPA proxy
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Exclude các quan hệ khỏi toString để tránh vòng lặp đệ quy và lazy loading exception
@ToString(exclude = {"customer", "role", "serviceCenter", "workLogs", "tokens"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private Long userId;

    @Column(name = "username", nullable = false, length = 50, columnDefinition = "nvarchar(50)")
    private String username;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    /**
     * Password được hash bằng BCrypt ở service layer trước khi persist.
     * <p>
     * <strong>Lý do length = 255:</strong> BCrypt hash có độ dài ~60 ký tự, nhưng set 255
     * để dự phòng cho các thuật toán hash mạnh hơn trong tương lai (vd: Argon2, scrypt).
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "address", nullable = true, length = 255, columnDefinition = "nvarchar(255)")
    private String address;

    /**
     * Timestamp tạo tài khoản, được set tự động qua {@code @PrePersist}.
     * <p>
     * <strong>Tại sao dùng @PrePersist:</strong> Đảm bảo audit trail không bao giờ bị thiếu,
     * ngay cả khi developer quên set giá trị này ở service layer.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Quan hệ 1-1 với {@link Customer}, chỉ tồn tại khi user có role là CUSTOMER.
     * <p>
     * <strong>Tại sao tách riêng Customer entity:</strong> Thay vì thêm các trường
     * {@code phone}, {@code vehicles} trực tiếp vào User (gây null cho Staff/Admin),
     * ta tách ra entity riêng để tuân thủ nguyên tắc Single Responsibility.
     * <p>
     * <strong>Tại sao dùng cascade ALL + orphanRemoval:</strong> Customer không có ý nghĩa
     * độc lập ngoài User, nên vòng đời của Customer phụ thuộc hoàn toàn vào User (aggregate root pattern).
     */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Customer customer;

    /**
     * Role xác định quyền hạn của user (RBAC - Role-Based Access Control).
     * <p>
     * <strong>Tại sao nullable = false:</strong> Hệ thống yêu cầu mọi user phải có role
     * để kiểm soát quyền truy cập thông qua Spring Security {@code @PreAuthorize}.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    /**
     * Service center mà user thuộc về (chỉ áp dụng cho SC_STAFF và SC_TECHNICIAN).
     * <p>
     * <strong>Tại sao nullable = true:</strong> CUSTOMER và EVM_STAFF không gắn với
     * service center cụ thể nào, nên trường này được phép null.
     * <p>
     * <strong>Tại sao cần bidirectional mapping:</strong> Giúp query dễ dàng từ cả hai phía
     * (tìm users của một center, hoặc tìm center của một user).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = true)
    private ServiceCenter serviceCenter;

    /**
     * Danh sách work logs được tạo bởi user (chỉ SC_TECHNICIAN).
     * <p>
     * <strong>Tại sao dùng cascade ALL:</strong> WorkLog là dữ liệu audit trail gắn chặt
     * với user, khi xóa user thì xóa luôn lịch sử công việc để đảm bảo data consistency.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkLog> workLogs = new ArrayList<>();

    /**
     * Danh sách tokens (refresh token, reset password token) của user.
     * <p>
     * <strong>Tại sao dùng cascade ALL:</strong> Token không có ý nghĩa khi user bị xóa,
     * nên cần xóa luôn để tránh token orphan trong database.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Token> tokens = new ArrayList<>();
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
