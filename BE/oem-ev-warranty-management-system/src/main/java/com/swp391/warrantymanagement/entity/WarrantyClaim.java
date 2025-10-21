package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "warranty_claims") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class WarrantyClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warranty_claim_id")
    private Long warrantyClaimId;

    @Column(name = "claim_date", nullable = false)
    private LocalDateTime claimDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WarrantyClaimStatus status = WarrantyClaimStatus.SUBMITTED;

    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;

    @Column(name = "description", length = 255, columnDefinition = "nvarchar(255)")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installed_part_id", nullable = false)
    private InstalledPart installedPart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @OneToMany(mappedBy = "warrantyClaim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkLog> workLogs = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    private ServiceCenter serviceCenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;  // EVM Staff được assign claim này
}
