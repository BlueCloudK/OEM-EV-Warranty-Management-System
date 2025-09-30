package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "vehicle_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    @NotBlank(message = "Vehicle name is required")
    @Size(min = 2, max = 100, message = "Vehicle name must be between 2 and 100 characters")
    private String vehicleName;

    @Column(name = "vehicle_model", nullable = false, length = 100)
    @NotBlank(message = "Vehicle model is required")
    @Size(min = 2, max = 100, message = "Vehicle model must be between 2 and 100 characters")
    private String vehicleModel;

    @Column(name = "vehicle_year", nullable = false)
    @NotNull(message = "Vehicle year is required")
    private int vehicleYear;

    @Column(name = "vehicle_vin", nullable = false, length = 50, unique = true)
    @NotBlank(message = "VIN is required")
    @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters")
    @Pattern(regexp = "^[0-9]{2}(?:[A-Z]{2}|MĐ)[- ]?[0-9]{5}$", message = "VIN must follow the format: 2 digits, 2 uppercase letters or 'MĐ', optional hyphen or space, followed by 5 digits")
    private String vehicleVin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @NotNull(message = "Customer is required")
    private Customer customer;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Part> parts = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<ServiceHistory> serviceHistory = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
