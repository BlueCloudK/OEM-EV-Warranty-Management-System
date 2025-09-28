package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity // map/ ánh xạ class này với bảng trong database
@Table (name = "roles") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Role {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY) // tự gen id tăng từ 1
    @Column(name = "role_id")
    private int roleId;

    @Column(name = "role_name", nullable = false, length = 50)
    @Nationalized // hỗ trợ unicode
    private String roleName;

    @OneToMany(mappedBy = "role")
    private List<Users> users = new ArrayList<>();
}
