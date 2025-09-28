package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Users {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "user_id")
    private int userId;

    @jakarta.persistence.Column(name = "username", nullable = false, length = 50)
    private String username;

    @jakarta.persistence.Column(name = "password", nullable = false, length = 255)
    @Nationalized
    private String password;

    @jakarta.persistence.Column(name = "address", nullable = false, length = 255)
    private String address;

    @jakarta.persistence.Column(name = "created_at", nullable = false)
    private Date CreatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Customers> customers = new ArrayList<>();
}
