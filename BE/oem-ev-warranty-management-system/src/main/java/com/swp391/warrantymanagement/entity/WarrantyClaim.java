package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

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
    @NotNull(message = "Claim date is required")
    private Date claimDate;

    @Column(name = "status", nullable = false, length = 50)
    @NotBlank(message = "Status is required")
    @Size(min = 3, max = 50, message = "Status must be between 3 and 50 characters")
    @Pattern(regexp = "^(PENDING|APPROVED|REJECTED|IN_PROGRESS|COMPLETED)$",
            message = "Status must be one of: PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED")
    private String status;

    @Column(name = "description", length = 255, columnDefinition = "nvarchar(255)")
    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;

    @Column(name = "resolution_date")
    private Date resolutionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    @NotNull(message = "Part is required")
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @NotNull(message = "Vehicle is required")
    private Vehicle vehicle;
}
