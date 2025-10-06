package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để quản lý Token
 * - Tìm token theo giá trị string
 * - Xóa tất cả token của một user (khi logout)
 * - Tự động xóa token hết hạn
 */
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    /**
     * Tìm token theo giá trị string
     * @param token giá trị token cần tìm
     * @return Optional<Token> - có thể null nếu không tìm thấy
     */
    Optional<Token> findByToken(String token);

    /**
     * Tìm token theo giá trị và loại token
     * @param token giá trị token
     * @param tokenType loại token (REFRESH hoặc RESET)
     * @return Optional<Token>
     */
    Optional<Token> findByTokenAndTokenType(String token, String tokenType);

    /**
     * Xóa tất cả token của một user theo loại
     * @param user user cần xóa token
     * @param tokenType loại token cần xóa
     */
    void deleteByUserAndTokenType(User user, String tokenType);

    /**
     * Xóa tất cả token của một user
     * Dùng khi user logout hoặc thay đổi password
     * @param user user cần xóa token
     */
    void deleteByUser(User user);

    /**
     * Tìm tất cả token của một user
     * @param user user cần tìm token
     * @return danh sách token của user
     */
    java.util.List<Token> findByUser(User user);
}
