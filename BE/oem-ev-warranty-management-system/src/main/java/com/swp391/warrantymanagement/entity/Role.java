package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
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

    private String roleName;

    @OneToMany(mappedBy = "role") //, cascade = CascadeType.ALL, orphanRemoval = true) // cascade là khi xóa role thì xóa luôn user liên quan, orphanRemoval là khi user không còn liên kết với role thì cũng bị xóa
    private Set<User> users = new HashSet<>();
}
