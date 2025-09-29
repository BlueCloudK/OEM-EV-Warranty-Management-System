package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "users") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tự gen id tăng từ 1
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, length = 50, columnDefinition = "nvarchar(50)")
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    @Nationalized
    private String password;

    @Column(name = "address", nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    private String address;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Customer> customers = new ArrayList<>();
}
