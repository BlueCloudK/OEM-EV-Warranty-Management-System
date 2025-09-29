package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "vehicles") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tự gen id tăng từ 1
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "verhicle_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String verhicleName;

    @Column(name = "verhicle_Model", nullable = false, length = 100)
    private String verhicleModel;

    @Column(name = "verhicle_year", nullable = false)
    private int verhicleYear;

    @Column(name = "car_vin", nullable = false, length = 50, unique = true)
    private String vehicleVin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Part> parts = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<ServiceHistory> serviceHistory = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
