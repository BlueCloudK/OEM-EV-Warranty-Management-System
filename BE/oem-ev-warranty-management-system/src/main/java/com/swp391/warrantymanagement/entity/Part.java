package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "parts") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tự gen id tăng từ 1
    @Column(name = "part_id")
    private Long partId;

    @Column(name = "part_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String partName;

    @Column(name = "part_number", nullable = false, length = 50, unique = true)
    private String partNumber;

    @Column(name = "manufacturer", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String manufacturer;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "installation_date", nullable = false)
    private Date installationDate;

    @Column(name = "warranty_expiration_date", nullable = false)
    private Date warrantyExpirationDate;

    @ManyToOne(fetch = FetchType.LAZY) // fetch là lấy dữ liệu liên quan khi cần thiết, với LAZY thì chỉ lấy khi truy cập
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistory> serviceHistories = new ArrayList<>();
}
