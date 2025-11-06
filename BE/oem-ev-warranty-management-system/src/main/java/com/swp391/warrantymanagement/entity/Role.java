package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Entity đại diện cho một Vai trò (Role) trong hệ thống, làm nền tảng cho cơ chế
 * Phân quyền Dựa trên Vai trò (Role-Based Access Control - RBAC).
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *     <li>Đóng vai trò là "master data", được khởi tạo sẵn trong hệ thống thông qua {@link com.swp391.warrantymanagement.config.DataInitializer}.</li>
 *     <li>Tên vai trò ({@code roleName}) tuân theo chuẩn của Spring Security (ví dụ: "ROLE_ADMIN"),
 *     cho phép tích hợp liền mạch với các annotation bảo mật như {@code @PreAuthorize}.</li>
 *     <li>Mối quan hệ 1-N với {@link User} được thiết kế an toàn, không cho phép xóa một vai trò
 *     nếu nó vẫn đang được sử dụng bởi bất kỳ người dùng nào.</li>
 * </ul>
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@AllArgsConstructor // Lombok: tạo constructor với tất cả tham số
@NoArgsConstructor // Lombok: tạo constructor rỗng (required bởi JPA)
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh dựa trên ID
@ToString(exclude = "users") // Tránh lỗi đệ quy với User entity
public class Role {

    // ======= PRIMARY KEY =======
    /**
     * Khóa chính của vai trò.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code GenerationType.IDENTITY} để ủy thác việc tạo ID
     * tự tăng cho cơ sở dữ liệu, đây là chiến lược hiệu quả và phổ biến nhất.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long roleId;

    /**
     * Tên vai trò duy nhất trong hệ thống.
     * <p>
     * <strong>Thiết kế:</strong> Tên vai trò phải tuân theo định dạng "ROLE_XXX" (ví dụ: "ROLE_ADMIN")
     * để tương thích với cơ chế kiểm tra quyền mặc định của Spring Security
     * trong các biểu thức như {@code hasRole('ADMIN')}.
     */
    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;

    // ======= RELATIONSHIPS =======
    /**
     * Danh sách các người dùng {@link User} có vai trò này (Quan hệ 1-N).
     * <p>
     * <strong>Thiết kế an toàn:</strong>
     * <ul>
     *     <li>Sử dụng {@link Set} thay vì {@link java.util.List} để đảm bảo một người dùng không thể được thêm vào cùng một vai trò nhiều lần.</li>
     *     <li><b>Không</b> sử dụng bất kỳ loại {@code CascadeType} nào. Vì {@code Role} là "master data",
     *     việc thay đổi nó không nên tự động gây ra các thay đổi (đặc biệt là xóa) trên các {@code User} liên quan.
     *     Việc xóa một vai trò cần được xử lý bằng logic nghiệp vụ riêng để đảm bảo không có người dùng nào bị "mồ côi".</li>
     * </ul>
     */
    @OneToMany(mappedBy = "role")
    private Set<User> users = new HashSet<>();
}
