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

    // Tìm token theo giá trị string
    Optional<Token> findByToken(String token);

    // Tìm token theo giá trị string và loại token
    Optional<Token> findByTokenAndTokenType(String token, String tokenType);

    // Xóa token theo user và loại token
    void deleteByUserAndTokenType(User user, String tokenType);

    // Xóa tất cả token của một user (khi logout)
    void deleteByUser(User user);

    // Tự động xóa token hết hạn
    java.util.List<Token> findByUser(User user);
}
