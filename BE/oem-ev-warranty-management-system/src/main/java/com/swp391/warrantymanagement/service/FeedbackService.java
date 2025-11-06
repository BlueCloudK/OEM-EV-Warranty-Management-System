package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service xử lý business logic cho Feedback
 * - Customer đánh giá sau khi claim hoàn thành
 * - Rating 1-5 sao + comment
 * - Tính CSAT score, average rating
 */
public interface FeedbackService {
    /**
     * Customer tạo feedback cho claim đã hoàn thành.
     * <p>
     * <strong>Security:</strong> Username được lấy từ JWT token đã được xác thực,
     * đảm bảo user chỉ có thể tạo feedback cho chính mình.
     *
     * @param requestDTO Dữ liệu feedback từ client.
     * @param username Username của người tạo feedback (từ JWT token).
     * @return Feedback đã được tạo.
     */
    FeedbackResponseDTO createFeedback(FeedbackRequestDTO requestDTO, String username);

    // Lấy feedback theo ID
    FeedbackResponseDTO getFeedbackById(Long feedbackId);

    /** Lấy feedback của claim cụ thể (1-1 relationship)
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
     * <p>
     * <strong>Security:</strong> Service layer sẽ verify ownership dựa trên username
     * để đảm bảo user chỉ có thể update feedback của chính mình.
     *
     * @param feedbackId Feedback ID
     * @param requestDTO Updated feedback data
     * @param username Username của người update (từ JWT token).
     * @return Updated feedback
     */
    FeedbackResponseDTO updateFeedback(Long feedbackId, FeedbackRequestDTO requestDTO, String username);

    /**
     * Delete feedback
     * <p>
     * <strong>Security:</strong> Service layer sẽ verify ownership dựa trên username.
     * CUSTOMER chỉ có thể xóa feedback của chính mình. ADMIN có thể xóa bất kỳ feedback nào.
     *
     * @param feedbackId Feedback ID
     * @param username Username của người xóa (từ JWT token).
     */
    void deleteFeedback(Long feedbackId, String username);

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
