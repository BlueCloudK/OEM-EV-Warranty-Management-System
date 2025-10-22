package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * FeedbackRepository - Data access layer for Feedback entity
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Find feedback by warranty claim
    Optional<Feedback> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId);

    // Find all feedbacks by customer
    List<Feedback> findByCustomerCustomerId(UUID customerId);
    Page<Feedback> findByCustomerCustomerId(UUID customerId, Pageable pageable);

    // Find feedbacks by rating
    Page<Feedback> findByRating(Integer rating, Pageable pageable);

    // Find feedbacks with rating greater than or equal
    Page<Feedback> findByRatingGreaterThanEqual(Integer rating, Pageable pageable);

    // Find feedbacks with rating less than or equal
    Page<Feedback> findByRatingLessThanEqual(Integer rating, Pageable pageable);

    // Get average rating
    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();

    // Get average rating for specific service center (through warranty claim)
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.warrantyClaim.serviceCenter.serviceCenterId = :serviceCenterId")
    Double getAverageRatingByServiceCenter(@Param("serviceCenterId") Long serviceCenterId);

    // Count feedbacks by rating
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.rating = :rating")
    Long countByRating(@Param("rating") Integer rating);
}
