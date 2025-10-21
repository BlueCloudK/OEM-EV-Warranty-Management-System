package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "customers") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Customer {
    @Id
    @Column(name = "customer_id", updatable = false, nullable = false, columnDefinition = "VarChar(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR) // Sử dụng SqlTypes.VARCHAR để map UUID sang VARCHAR
    private UUID customerId;

    @Column(name = "name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    @OneToMany(mappedBy = "customer",
            cascade = {
            CascadeType.PERSIST, // Khi lưu entity cha, tự động lưu entity con nếu chưa tồn tại
            CascadeType.MERGE    // Khi cập nhật entity cha, tự động cập nhật entity con nếu có thay đổi
    })
    private List<Vehicle> vehicles = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}
