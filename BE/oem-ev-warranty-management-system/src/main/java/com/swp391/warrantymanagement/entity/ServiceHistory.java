package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity //map/ánh xạ class này với bảng trong database
@Table(name = "service_history") //đặt tên bảng trong database
@Data //tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor //tự động tạo constructor với tất cả các tham số
@NoArgsConstructor //tự động tạo constructor không tham số
public class ServiceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_history_id")
    private Long serviceHistoryId;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    // Thêm field serviceType để sửa lỗi repository
    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    private String description;

    @OneToMany(mappedBy = "serviceHistory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistoryDetail> serviceHistoryDetails = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}
