package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity // map/ ánh xạ class này với bảng trong database
@Table (name = "roles") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "role_name", nullable = false, length = 50)
    @NotBlank(message = "Role name is required")
    @Size(min = 3, max = 50, message = "Role name must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z_]+$", message = "Role name must contain only uppercase letters and underscores")
    @Nationalized // hỗ trợ unicode
    private String roleName;

    @OneToMany(mappedBy = "role") //, cascade = CascadeType.ALL, orphanRemoval = true) // cascade là khi xóa role thì xóa luôn user liên quan, orphanRemoval là khi user không còn liên kết với role thì cũng bị xóa
    private Set<User> users = new HashSet<>();
}
