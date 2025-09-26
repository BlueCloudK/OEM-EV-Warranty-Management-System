package com.swp391.warrantymanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Nationalized;

@Entity
@Table (name = "Customers")

public class Customer {

    @Id
    @Column (name = "customer_id")
    private String customerId;

    @Column (name = "name", nullable = false, length = 100)
    @Nationalized // Giúp khai báo trường này có thể lưu trữ Unicode
    private String name;

    @Column (name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column (name = "phone_number", nullable = false, length = 15, unique = true)
    private String phoneNumber;

    @Column (name = "address", nullable = false, length = 255)
    @Nationalized // Giúp khai báo trường này có thể lưu trữ Unicode
    private String address;


}
