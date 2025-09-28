package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_history")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceHistory {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @jakarta.persistence.Column(name = "service_history_id")
    private int serviceHistoryId;

    @jakarta.persistence.Column(name = "warranty_id", nullable = false)
    private String serviceDate;

    @jakarta.persistence.Column(name = "description", nullable = false, length = 1000)
    private String description;

    @jakarta.persistence.ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Parts part;

    @jakarta.persistence.ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicles vehicle;
}
