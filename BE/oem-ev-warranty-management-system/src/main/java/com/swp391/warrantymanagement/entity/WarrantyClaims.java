package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Cleanup;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "warranty_claims")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WarrantyClaims {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warranty_claim_id")
    private Long warrantyClaimId;

    @Column(name = "claim_date", nullable = false)
    private Date claimDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "description", nullable = false, length = 255)
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

