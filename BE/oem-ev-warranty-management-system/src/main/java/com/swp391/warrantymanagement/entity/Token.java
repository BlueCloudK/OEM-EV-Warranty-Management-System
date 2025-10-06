package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity để lưu trữ refresh token
 * - Mỗi user có thể có nhiều token (multi-device login)
 * - Token có thời gian hết hạn để bảo mật
 * - Tự động khởi tạo createdAt khi tạo mới
 */
@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "tokens") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long tokenId;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "expiration_date", nullable = false)
    private LocalDateTime expirationDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "token_type", nullable = false, length = 20)
    private String tokenType; // "REFRESH" hoặc "RESET"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Tự động set createdAt khi tạo mới entity
     * Được gọi trước khi persist vào database
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Utility methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expirationDate);
    }
}
