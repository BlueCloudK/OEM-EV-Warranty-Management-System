package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String serviceDate;

    // Thêm field serviceType để sửa lỗi repository
    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}
