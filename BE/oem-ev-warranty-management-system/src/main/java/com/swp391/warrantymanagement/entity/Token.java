package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity //map/ánh xạ class này với bảng trong database
@Table(name = "tokens") //đặt tên bảng trong database
@Data //tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor //tự động tạo constructor với tất cả các tham số
@NoArgsConstructor //tự động tạo constructor không tham số
public class Token {
    @Id
    @Column(name = "token_id", length = 100)
    private String id;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_type", nullable = false, length = 20)
    private String tokenType; // ACCESS, REFRESH, ...

    @Column(name = "expired", nullable = false) // expired: hết hạn
    private boolean expired = false;

    @Column(name = "revoked", nullable = false) // revoked: thu hồi
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "expires_at")
    private java.time.LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
