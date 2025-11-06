package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity đại diện cho Khách hàng (Customer), chứa các thông tin kinh doanh tách biệt khỏi entity {@link User}.
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *     <li>Tuân thủ <strong>Nguyên tắc Đơn trách nhiệm</strong> bằng cách tách thông tin khách hàng (tên, điện thoại)
 *     khỏi thông tin xác thực (username, password) trong {@link User}.</li>
 *     <li>Sử dụng {@link UUID} làm khóa chính để tăng cường bảo mật và quyền riêng tư, tránh việc dò ID tuần tự.</li>
 *     <li>Thiết lập mối quan hệ 1-1 chặt chẽ với {@link User}, đảm bảo mỗi khách hàng tương ứng với một tài khoản.</li>
 * </ul>
 */
@Entity // JPA annotation: Đánh dấu class này là entity
@Table(name = "customers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh các đối tượng entity dựa trên ID duy nhất.
@ToString(exclude = {"vehicles", "feedbacks", "user"}) // Tránh lỗi đệ quy (circular dependency) và LazyInitializationException khi gọi toString().
public class Customer {

    // ======= PRIMARY KEY (UUID) =======
    /**
     * Khóa chính của khách hàng, sử dụng định dạng UUID (Universally Unique Identifier).
     * <p>
     * <strong>Lý do sử dụng UUID:</strong> Tăng cường bảo mật bằng cách làm cho ID khó đoán,
     * bảo vệ quyền riêng tư của người dùng và phù hợp với các hệ thống phân tán.
     * <p>
     * <code>updatable = false</code> đảm bảo ID không thể bị thay đổi sau khi đã được tạo.
     */
    @Id
    @Column(name = "customer_id", updatable = false, nullable = false, columnDefinition = "VarChar(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private UUID customerId;

    /**
     * Tên đầy đủ của khách hàng.
     * <p>
     * <code>columnDefinition = "nvarchar(100)"</code> được sử dụng để hỗ trợ đầy đủ các ký tự tiếng Việt có dấu.
     */
    @Column(name = "name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    /**
     * Số điện thoại của khách hàng.
     * <p>
     * <code>unique = true</code> là một ràng buộc quan trọng ở mức cơ sở dữ liệu,
     * đảm bảo rằng không có hai khách hàng nào có cùng một số điện thoại.
     */
    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    // ======= RELATIONSHIPS =======

    /**
     * Danh sách các xe {@link Vehicle} mà khách hàng này sở hữu (Quan hệ 1-N).
     * <p>
     * <strong>Thiết kế Cascade:</strong> Việc xóa một khách hàng không tự động xóa các xe của họ
     * (không dùng <code>CascadeType.REMOVE</code>) để bảo toàn lịch sử và cho phép chuyển quyền sở hữu.
     * Việc xóa xe cần được xử lý bằng logic nghiệp vụ riêng.
     */
    @OneToMany(mappedBy = "customer",
            cascade = {
            CascadeType.PERSIST, // Khi lưu customer mới, tự động lưu vehicle mới nếu chưa tồn tại
            CascadeType.MERGE    // Khi cập nhật customer, tự động cập nhật vehicle nếu có thay đổi
    })
    private List<Vehicle> vehicles = new ArrayList<>();

    /**
     * Danh sách các đánh giá {@link Feedback} mà khách hàng đã gửi (Quan hệ 1-N).
     * <p>
     * Tương tự như `vehicles`, việc xóa khách hàng không tự động xóa các đánh giá của họ
     * để phục vụ cho việc thống kê và phân tích trong tương lai.
     */
    @OneToMany(mappedBy = "customer",
            cascade = {
            CascadeType.PERSIST,
            CascadeType.MERGE
    })
    private List<Feedback> feedbacks = new ArrayList<>();

    /**
     * Mối quan hệ 1-1 với tài khoản người dùng {@link User}.
     * <p>
     * <strong>Thiết kế:</strong> Entity <code>Customer</code> là bên sở hữu mối quan hệ,
     * nó sẽ chứa cột khóa ngoại <code>user_id</code>.
     * <p>
     * <b>Hướng Cascade:</b> Việc xóa một <code>User</code> sẽ tự động xóa <code>Customer</code> tương ứng
     * (được cấu hình trong entity <code>User</code>), nhưng việc xóa <code>Customer</code> sẽ không ảnh hưởng đến <code>User</code>.
     */
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}
