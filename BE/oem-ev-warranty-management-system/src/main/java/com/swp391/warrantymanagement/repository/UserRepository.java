package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để quản lý User
 * - Tìm user theo username và email
 * - Sử dụng Optional để tránh null pointer exception
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo username
     * @param username tên đăng nhập
     * @return User object hoặc null nếu không tìm thấy
     */
    User findByUsername(String username);

    /**
     * Tìm user theo email
     * @param email địa chỉ email
     * @return Optional<User> - an toàn hơn với null
     */
    Optional<User> findByEmail(String email);

    /**
     * Kiểm tra username đã tồn tại chưa
     * @param username tên đăng nhập cần kiểm tra
     * @return true nếu đã tồn tại
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra email đã tồn tại chưa
     * @param email email cần kiểm tra
     * @return true nếu đã tồn tại
     */
    boolean existsByEmail(String email);
}
