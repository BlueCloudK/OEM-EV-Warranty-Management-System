package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Feedback;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.exception.UnauthorizedException;
import com.swp391.warrantymanagement.exception.ValidationException;
import com.swp391.warrantymanagement.mapper.FeedbackMapper;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.FeedbackRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FeedbackServiceImpl - Implementation of feedback business logic
 */
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO requestDTO, String customerId) {
        // Validate warranty claim exists
        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Warranty claim not found with ID: " + requestDTO.getWarrantyClaimId()));

        // Validate claim is COMPLETED
        if (warrantyClaim.getStatus() != WarrantyClaimStatus.COMPLETED) {
            throw new ValidationException(
                    "Cannot create feedback for claim that is not COMPLETED. Current status: " + warrantyClaim.getStatus());
        }

        // Validate customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with ID: " + customerId));

        // Validate customer owns the claim
        if (!warrantyClaim.getCustomer().getCustomerId().equals(customerId)) {
            throw new UnauthorizedException(
                    "You are not authorized to provide feedback for this claim");
        }

        // Validate no existing feedback for this claim
        if (feedbackRepository.findByWarrantyClaimWarrantyClaimId(requestDTO.getWarrantyClaimId()).isPresent()) {
            throw new ValidationException(
                    "Feedback already exists for this warranty claim");
        }

        // Create feedback
        Feedback feedback = FeedbackMapper.toEntity(requestDTO, warrantyClaim, customer);
        Feedback savedFeedback = feedbackRepository.save(feedback);

        return FeedbackMapper.toResponseDTO(savedFeedback);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDTO getFeedbackById(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));
        return FeedbackMapper.toResponseDTO(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDTO getFeedbackByClaimId(Long warrantyClaimId) {
        Feedback feedback = feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No feedback found for warranty claim ID: " + warrantyClaimId));
        return FeedbackMapper.toResponseDTO(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByCustomer(String customerId, Pageable pageable) {
        // Validate customer exists
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByCustomerCustomerId(customerId, pageable);
        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getAllFeedbacks(Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findAll(pageable);
        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByRating(Integer rating, Pageable pageable) {
        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByRating(rating, pageable);
        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByMinRating(Integer rating, Pageable pageable) {
        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByRatingGreaterThanEqual(rating, pageable);
        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isLast()
        );
    }

    @Override
    @Transactional
    public FeedbackResponseDTO updateFeedback(Long feedbackId, FeedbackRequestDTO requestDTO, String customerId) {
        // Find existing feedback
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));

        // Validate customer owns the feedback
        if (!feedback.getCustomer().getCustomerId().equals(customerId)) {
            throw new UnauthorizedException(
                    "You are not authorized to update this feedback");
        }

        // Update feedback
        FeedbackMapper.updateEntity(feedback, requestDTO);
        Feedback updatedFeedback = feedbackRepository.save(feedback);

        return FeedbackMapper.toResponseDTO(updatedFeedback);
    }

    @Override
    @Transactional
    public void deleteFeedback(Long feedbackId, String customerId) {
        // Find existing feedback
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));

        // Validate customer owns the feedback
        if (!feedback.getCustomer().getCustomerId().equals(customerId)) {
            throw new UnauthorizedException(
                    "You are not authorized to delete this feedback");
        }

        feedbackRepository.delete(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating() {
        return feedbackRepository.getAverageRating();
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRatingByServiceCenter(Long serviceCenterId) {
        return feedbackRepository.getAverageRatingByServiceCenter(serviceCenterId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByRating(Integer rating) {
        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }
        return feedbackRepository.countByRating(rating);
    }
}
