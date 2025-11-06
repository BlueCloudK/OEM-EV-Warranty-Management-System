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
 * Repository để quản lý Feedback
 * - Đánh giá của customer sau khi hoàn thành claim
 * - Tìm theo claim, customer, rating
 * - Tính CSAT score (customer satisfaction)
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Tìm feedback theo claim (1-1 relationship)
    Optional<Feedback> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId);

    // Tìm tất cả feedback của customer
    List<Feedback> findByCustomerCustomerId(UUID customerId);
    Page<Feedback> findByCustomerCustomerId(UUID customerId, Pageable pageable);

    // Tìm theo rating cụ thể (1-5 sao)
    Page<Feedback> findByRating(Integer rating, Pageable pageable);

    // Tìm feedback có rating >= threshold (VD: >= 4 sao = satisfied)
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
