package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "service_centers") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class ServiceCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_center_id")
    private Long serviceCenterId;

    @Column(name = "name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    @Column(name = "address", nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    private String address;

    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    @Column(name = "opening_hours", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String openingHours;

    // Latitude: decimal(9, 6) - Ví dụ: 10.762622 (Việt Nam)
    @Column(name = "latitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal latitude;

    // Longitude: decimal(9, 6) - Ví dụ: 106.660172 (Việt Nam)
    @Column(name = "longitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "serviceCenter")
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "serviceCenter")
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
