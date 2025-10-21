package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * FeedbackController - REST API endpoints for customer feedback management
 */
@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Customer creates feedback for a completed warranty claim
     * POST /api/feedbacks?customerId={customerId}
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> createFeedback(
            @Valid @RequestBody FeedbackRequestDTO requestDTO,
            @RequestParam String customerId) {
        FeedbackResponseDTO response = feedbackService.createFeedback(requestDTO, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get feedback by ID
     * GET /api/feedbacks/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        FeedbackResponseDTO response = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get feedback for a specific warranty claim
     * GET /api/feedbacks/by-claim/{claimId}
     */
    @GetMapping("/by-claim/{claimId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackByClaimId(@PathVariable Long claimId) {
        FeedbackResponseDTO response = feedbackService.getFeedbackByClaimId(claimId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all feedbacks by a specific customer (paginated)
     * GET /api/feedbacks/by-customer/{customerId}?page=0&size=10
     */
    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByCustomer(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByCustomer(customerId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all feedbacks (paginated) - For admin/staff review
     * GET /api/feedbacks?page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getAllFeedbacks(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get feedbacks by specific rating (paginated)
     * GET /api/feedbacks/by-rating/{rating}?page=0&size=10
     */
    @GetMapping("/by-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByRating(
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByRating(rating, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get feedbacks with rating >= specified value (paginated)
     * GET /api/feedbacks/min-rating/{rating}?page=0&size=10
     */
    @GetMapping("/min-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByMinRating(
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByMinRating(rating, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Update existing feedback (customer can edit their own feedback)
     * PUT /api/feedbacks/{id}?customerId={customerId}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequestDTO requestDTO,
            @RequestParam String customerId) {
        FeedbackResponseDTO response = feedbackService.updateFeedback(id, requestDTO, customerId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete feedback
     * DELETE /api/feedbacks/{id}?customerId={customerId}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFeedback(
            @PathVariable Long id,
            @RequestParam String customerId) {
        feedbackService.deleteFeedback(id, customerId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Feedback deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get overall average rating across all feedbacks
     * GET /api/feedbacks/statistics/average-rating
     */
    @GetMapping("/statistics/average-rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<Map<String, Object>> getAverageRating() {
        Double averageRating = feedbackService.getAverageRating();
        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        return ResponseEntity.ok(response);
    }

    /**
     * Get average rating for a specific service center
     * GET /api/feedbacks/statistics/service-center/{serviceCenterId}/average-rating
     */
    @GetMapping("/statistics/service-center/{serviceCenterId}/average-rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<Map<String, Object>> getAverageRatingByServiceCenter(@PathVariable Long serviceCenterId) {
        Double averageRating = feedbackService.getAverageRatingByServiceCenter(serviceCenterId);
        Map<String, Object> response = new HashMap<>();
        response.put("serviceCenterId", serviceCenterId);
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of feedbacks by rating value
     * GET /api/feedbacks/statistics/count-by-rating/{rating}
     */
    @GetMapping("/statistics/count-by-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<Map<String, Object>> countByRating(@PathVariable Integer rating) {
        Long count = feedbackService.countByRating(rating);
        Map<String, Object> response = new HashMap<>();
        response.put("rating", rating);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get feedback statistics summary (all ratings count + average)
     * GET /api/feedbacks/statistics/summary
     */
    @GetMapping("/statistics/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<Map<String, Object>> getFeedbackStatistics() {
        Map<String, Object> response = new HashMap<>();

        // Average rating
        Double averageRating = feedbackService.getAverageRating();
        response.put("averageRating", averageRating != null ? averageRating : 0.0);

        // Count by each rating (1-5)
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, feedbackService.countByRating(i));
        }
        response.put("ratingCounts", ratingCounts);

        return ResponseEntity.ok(response);
    }
}
