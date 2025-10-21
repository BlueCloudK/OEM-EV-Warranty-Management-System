package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Feedback Entity - Customer feedback after warranty claim completion
 * Business Rule:
 * - Customer can only provide feedback for COMPLETED claims
 * - One feedback per warranty claim
 * - Rating from 1-5 stars
 */
@Entity
@Table(name = "feedbacks")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "comment", length = 1000, columnDefinition = "nvarchar(1000)")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "warranty_claim_id", nullable = false, unique = true)
    private WarrantyClaim warrantyClaim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
