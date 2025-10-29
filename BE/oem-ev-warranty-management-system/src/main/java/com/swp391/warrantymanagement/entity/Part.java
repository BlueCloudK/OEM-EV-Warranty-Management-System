package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Part Entity - Represents a vehicle part/component registered by EVM Staff
 * Business Rule:
 * - Part is standalone component information (NO vehicle relationship)
 * - EVM Staff registers parts
 * - Dealer Staff links Part to Vehicle via InstalledPart for warranty tracking
 */
@Entity
@Table(name = "parts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Long partId;

    @Column(name = "part_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String partName;

    @Column(name = "part_number", nullable = false, length = 50, unique = true)
    private String partNumber;

    @Column(name = "manufacturer", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String manufacturer;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @OneToMany(mappedBy = "part")
    private List<InstalledPart> installedParts = new ArrayList<>();

    @OneToMany(mappedBy = "part")
    private List<ServiceHistoryDetail> serviceHistoryDetails = new ArrayList<>();
}
