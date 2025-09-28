package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Vehicles {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "vehicle_id")
    private int vehicleId;

    @jakarta.persistence.Column(name = "verhicle_name", nullable = false, length = 100)
    private String verhicleName;

    @jakarta.persistence.Column(name = "verhicle_Model", nullable = false, length = 100)
    private String verhicleModel;

    @jakarta.persistence.Column(name = "verhicle_year", nullable = false)
    private int verhicleYear;

    @jakarta.persistence.Column(name = "car_vin", nullable = false, length = 50, unique = true)
    private String vehicleVin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customers customer;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Parts> parts = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<ServiceHistory> serviceHistory = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<WarrantyClaims> warrantyClaims = new ArrayList<>();
}
