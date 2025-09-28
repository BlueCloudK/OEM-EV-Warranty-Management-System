package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import lombok.AllArgsConstructor;
import lombok.Cleanup;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "warranty_claims") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class WarrantyClaims {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tự gen id tăng từ 1
    @Column(name = "warranty_claim_id")
    private int warrantyClaimId;

    @Column(name = "claim_date", nullable = false)
    private Date claimDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "description", length = 255, columnDefinition = "nvarchar(255)")
    private String description;

    @Column(name = "resolution_date")
    private Date resolutionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Parts part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicles vehicle;
}
