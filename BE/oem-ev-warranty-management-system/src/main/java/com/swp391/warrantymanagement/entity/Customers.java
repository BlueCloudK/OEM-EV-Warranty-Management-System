package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customers {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "customer_id")
    private int customerId;

    @jakarta.persistence.Column(name = "name", nullable = false, length = 100)
    private String name;

    @jakarta.persistence.Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @jakarta.persistence.Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    @jakarta.persistence.Column(name = "address", nullable = false, length = 255)
    private String address;

    @jakarta.persistence.Column(name = "created_at", nullable = false)
    private Date CreatedAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicles> vehicles = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
}
