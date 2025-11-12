package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để quản lý User
 * - Tìm user theo username và email
 * - Sử dụng Optional để tránh null pointer exception
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo username
    Optional<User> findByUsername(String username);

    // Tìm user theo email
    Optional<User> findByEmail(String email);

    // Kiểm tra username đã tồn tại chưa
    boolean existsByUsername(String username);

    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);

    // Lấy role name của user theo username (để tránh lazy loading)
    @Query("SELECT r.roleName FROM User u JOIN u.role r WHERE u.username = :username")
    Optional<String> findRoleNameByUsername(@Param("username") String username);

    // ============= User Management Methods =============
    // Tìm users theo role (phân trang)
    Page<User> findByRole(Role role, Pageable pageable);

    // Tìm users theo username có chứa từ khóa tìm kiếm (không phân biệt hoa thường)
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    // Đếm số lượng users theo role
    long countByRole(Role role);

    /**
     * Kiểm tra xem có User nào đang được gán một Role cụ thể hay không.
     * Rất hữu ích để ngăn chặn việc xóa Role đang được sử dụng.
     * @param role Role cần kiểm tra.
     * @return true nếu có ít nhất một User đang sử dụng Role này.
     */
    boolean existsByRole(Role role);

    /**
     * Tìm kiếm người dùng theo username và lọc theo role.
     * @param username Từ khóa tìm kiếm trong username.
     * @param role Đối tượng Role để lọc.
     * @param pageable Thông tin phân trang.
     * @return Một trang các User thỏa mãn điều kiện.
     */
    Page<User> findByUsernameContainingIgnoreCaseAndRole(String username, Role role, Pageable pageable);

    /**
     * Tìm kiếm chung người dùng theo username hoặc email (case-insensitive).
     * Tìm kiếm trong cả username và email để hỗ trợ tìm kiếm linh hoạt hơn.
     * Sử dụng COALESCE để xử lý null values an toàn.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param pageable Thông tin phân trang.
     * @return Một trang các User thỏa mãn điều kiện.
     */
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsersGeneral(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Tìm kiếm chung người dùng theo username hoặc email, và lọc theo role.
     * Sử dụng COALESCE để xử lý null values an toàn.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param role Đối tượng Role để lọc.
     * @param pageable Thông tin phân trang.
     * @return Một trang các User thỏa mãn điều kiện.
     */
    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND u.role = :role")
    Page<User> searchUsersGeneralWithRole(@Param("searchTerm") String searchTerm,
                                           @Param("role") Role role,
                                           Pageable pageable);
}
