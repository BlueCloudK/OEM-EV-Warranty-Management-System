package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

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
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscore")
    private String username;

    // Thêm field email vào User entity
    @Column(name = "email", nullable = false, length = 100, unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    @Nationalized
    private String password;

    @Column(name = "address", nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 255, message = "Address must be between 10 and 255 characters")
    private String address;

    @Column(name = "created_at", nullable = false)
    @NotNull(message = "Created date is required")
    private Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @NotNull(message = "Role is required")
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Customer> customers = new ArrayList<>();

}
