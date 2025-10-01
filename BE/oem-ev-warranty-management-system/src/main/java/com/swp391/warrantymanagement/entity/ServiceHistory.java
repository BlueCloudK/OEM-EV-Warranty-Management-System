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
    @NotBlank(message = "Service date is required")
    private String serviceDate;

    // Thêm field serviceType để sửa lỗi repository
    @Column(name = "service_type", nullable = false, length = 100)
    @NotBlank(message = "Service type is required")
    @Size(max = 100, message = "Service type must be at most 100 characters")
    private String serviceType;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    @NotNull(message = "Part is required")
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @NotNull(message = "Vehicle is required")
    private Vehicle vehicle;
}
