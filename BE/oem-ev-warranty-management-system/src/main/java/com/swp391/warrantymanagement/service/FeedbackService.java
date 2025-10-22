package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * FeedbackService - Business logic for customer feedback on completed warranty claims
 */
public interface FeedbackService {
    /**
     * Customer creates feedback for a completed warranty claim
     * @param requestDTO Feedback data (rating, comment, warrantyClaimId)
     * @param customerId Customer UUID from authentication
     * @return Created feedback response
     */
    FeedbackResponseDTO createFeedback(FeedbackRequestDTO requestDTO, UUID customerId);

    /**
     * Get feedback by ID
     * @param feedbackId Feedback ID
     * @return Feedback details
     */
    FeedbackResponseDTO getFeedbackById(Long feedbackId);

    /**
     * Get feedback for a specific warranty claim
     * @param warrantyClaimId Warranty claim ID
     * @return Feedback for the claim (if exists)
     */
    FeedbackResponseDTO getFeedbackByClaimId(Long warrantyClaimId);

    /**
     * Get all feedbacks by a specific customer (paginated)
     * @param customerId Customer UUID
     * @param pageable Pagination parameters
     * @return Paged list of customer's feedbacks
     */
    PagedResponse<FeedbackResponseDTO> getFeedbacksByCustomer(UUID customerId, Pageable pageable);

    /**
     * Get all feedbacks (paginated) - For admin/staff review
     * @param pageable Pagination parameters
     * @return Paged list of all feedbacks
     */
    PagedResponse<FeedbackResponseDTO> getAllFeedbacks(Pageable pageable);

    /**
     * Get feedbacks by rating (paginated)
     * @param rating Rating value (1-5)
     * @param pageable Pagination parameters
     * @return Paged list of feedbacks with specified rating
     */
    PagedResponse<FeedbackResponseDTO> getFeedbacksByRating(Integer rating, Pageable pageable);

    /**
     * Get feedbacks with rating greater than or equal to specified value
     * @param rating Minimum rating (1-5)
     * @param pageable Pagination parameters
     * @return Paged list of feedbacks
     */
    PagedResponse<FeedbackResponseDTO> getFeedbacksByMinRating(Integer rating, Pageable pageable);

    /**
     * Update existing feedback (customer can edit their feedback)
     * @param feedbackId Feedback ID
     * @param requestDTO Updated feedback data
     * @param customerId Customer UUID from authentication
     * @return Updated feedback
     */
    FeedbackResponseDTO updateFeedback(Long feedbackId, FeedbackRequestDTO requestDTO, UUID customerId);

    /**
     * Delete feedback
     * @param feedbackId Feedback ID
     * @param customerId Customer UUID from authentication (for authorization)
     */
    void deleteFeedback(Long feedbackId, UUID customerId);

    /**
     * Get overall average rating across all feedbacks
     * @return Average rating (null if no feedbacks exist)
     */
    Double getAverageRating();

    /**
     * Get average rating for a specific service center
     * @param serviceCenterId Service center ID
     * @return Average rating for the service center
     */
    Double getAverageRatingByServiceCenter(Long serviceCenterId);

    /**
     * Get count of feedbacks by rating value
     * @param rating Rating value (1-5)
     * @return Count of feedbacks with that rating
     */
    Long countByRating(Integer rating);
}
