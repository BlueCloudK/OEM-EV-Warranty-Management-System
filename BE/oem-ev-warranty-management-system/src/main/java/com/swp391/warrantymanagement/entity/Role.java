package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table (name = "roles")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Role {

    @Id
    @GeneratedValue (strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "role_id")
    private int roleId;

    @jakarta.persistence.Column(name = "role_name", nullable = false, length = 50)
    @Nationalized // hỗ trợ unicode
    private String roleName;

    @OneToMany(mappedBy = "role")
    private List<Users> users = new ArrayList<>();
}

