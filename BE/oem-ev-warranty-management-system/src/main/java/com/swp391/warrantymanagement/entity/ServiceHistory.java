package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
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
    @GeneratedValue(strategy = GenerationType.IDENTITY) //tự gen id tăng từ 1
    @Column(name = "service_history_id")
    private int serviceHistoryId;

    @Column(name = "warranty_id", nullable = false)
    private String serviceDate;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Parts part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicles vehicle;
}
