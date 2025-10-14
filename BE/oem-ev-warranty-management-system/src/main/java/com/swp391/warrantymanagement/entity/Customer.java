package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
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

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    @Column(name = "address", nullable = false)
    private String address;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicle> vehicles = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY) // fetch là lấy dữ liệu liên quan khi cần thiết, với LAZY thì chỉ lấy khi truy cập
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
