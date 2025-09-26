package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "cars")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "car_id")
    private int carId;
    @Column(name = "car_name", nullable = false, length = 100)
    private String carName;
    @Column(name = "car_model", nullable = false, length = 100)
    private String carModel;
    @Column(name = "car_year", nullable = false)
    private int carYear;
    @Column(name = "car_vin", nullable = false, length = 50, unique = true)
    private String carVin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
