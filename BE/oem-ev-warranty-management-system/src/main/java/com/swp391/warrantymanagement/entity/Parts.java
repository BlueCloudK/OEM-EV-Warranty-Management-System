package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "parts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Parts {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "part_id")
    private int partId;

    @jakarta.persistence.Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @jakarta.persistence.Column(name = "part_number", nullable = false, length = 50, unique = true)
    private String partNumber;

    @jakarta.persistence.Column(name = "manufacturer", nullable = false, length = 100)
    private String manufacturer;

    @jakarta.persistence.Column(name = "price", nullable = false)
    private double price;

    @jakarta.persistence.Column(name = "installation_date", nullable = false)
    private Date installationDate;

    @jakarta.persistence.Column(name = "warranty_expiration_date", nullable = false)
    private Date warrantyExpirationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicles vehicle;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaims> warrantyClaims = new ArrayList<>();

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistory> serviceHistories = new ArrayList<>();
}
