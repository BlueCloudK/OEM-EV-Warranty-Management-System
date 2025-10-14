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
}

