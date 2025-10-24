package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.*;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "users") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, length = 50, columnDefinition = "nvarchar(50)")
    private String username;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "address", nullable = true, length = 255, columnDefinition = "nvarchar(255)")
    private String address;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // Bên ERD chỉ cần 1 bên giữ FK còn Code thì nên để cả 2 bên để dễ mapping code
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = true) // Customer không thuộc service center, chỉ STAFF mới có
    private ServiceCenter serviceCenter;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkLog> workLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
