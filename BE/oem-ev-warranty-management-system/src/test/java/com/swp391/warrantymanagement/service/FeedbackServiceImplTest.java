package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Feedback;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.FeedbackRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.service.impl.FeedbackServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FeedbackService Unit Tests")
class FeedbackServiceImplTest {

    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private WarrantyClaimRepository warrantyClaimRepository;
    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    private FeedbackRequestDTO requestDTO;
    private WarrantyClaim warrantyClaim;
    private Customer customer;
    private UUID customerId;
    private Long warrantyClaimId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        warrantyClaimId = 1L;

        customer = new Customer();
        customer.setCustomerId(customerId);

        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);

        warrantyClaim = new WarrantyClaim();
        warrantyClaim.setWarrantyClaimId(warrantyClaimId);
        warrantyClaim.setStatus(WarrantyClaimStatus.COMPLETED);
        warrantyClaim.setVehicle(vehicle);

        requestDTO = new FeedbackRequestDTO();
        requestDTO.setWarrantyClaimId(warrantyClaimId);
        requestDTO.setRating(5);
        requestDTO.setComment("Excellent service!");
    }

    @Nested
    @DisplayName("Create Feedback")
    class CreateFeedback {

        @Test
        @DisplayName("Should create feedback successfully")
        void createFeedback_Success() {
            // Arrange
            when(warrantyClaimRepository.findById(warrantyClaimId)).thenReturn(Optional.of(warrantyClaim));
            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
            when(feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)).thenReturn(Optional.empty());
            when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            FeedbackResponseDTO result = feedbackService.createFeedback(requestDTO, customerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRating()).isEqualTo(5);
            assertThat(result.getComment()).isEqualTo("Excellent service!");
            verify(feedbackRepository).save(any(Feedback.class));
        }

        @Test
        @DisplayName("Should throw exception if claim is not completed")
        void createFeedback_ClaimNotCompleted_ThrowsException() {
            // Arrange
            warrantyClaim.setStatus(WarrantyClaimStatus.SUBMITTED); // Corrected to a valid, non-completed status
            when(warrantyClaimRepository.findById(warrantyClaimId)).thenReturn(Optional.of(warrantyClaim));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> feedbackService.createFeedback(requestDTO, customerId));
            assertThat(exception.getMessage()).contains("Cannot create feedback for claim that is not COMPLETED");
        }

        @Test
        @DisplayName("Should throw exception if customer does not own the claim")
        void createFeedback_CustomerNotOwner_ThrowsException() {
            // Arrange
            UUID otherCustomerId = UUID.randomUUID();
            when(warrantyClaimRepository.findById(warrantyClaimId)).thenReturn(Optional.of(warrantyClaim));
            when(customerRepository.findById(otherCustomerId)).thenReturn(Optional.of(new Customer()));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> feedbackService.createFeedback(requestDTO, otherCustomerId));
            assertThat(exception.getMessage()).contains("You are not authorized to provide feedback for this claim");
        }

        @Test
        @DisplayName("Should throw exception if feedback for claim already exists")
        void createFeedback_FeedbackExists_ThrowsException() {
            // Arrange
            when(warrantyClaimRepository.findById(warrantyClaimId)).thenReturn(Optional.of(warrantyClaim));
            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
            when(feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)).thenReturn(Optional.of(new Feedback()));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> feedbackService.createFeedback(requestDTO, customerId));
            assertThat(exception.getMessage()).contains("Feedback already exists for this warranty claim");
        }

        @Test
        @DisplayName("Should throw exception if warranty claim not found")
        void createFeedback_ClaimNotFound_ThrowsException() {
            // Arrange
            when(warrantyClaimRepository.findById(warrantyClaimId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> feedbackService.createFeedback(requestDTO, customerId));
        }
    }

    @Nested
    @DisplayName("Get Feedback By ID")
    class GetFeedbackById {

        @Test
        @DisplayName("Should return feedback when found")
        void getFeedbackById_Found_ReturnsFeedback() {
            // Arrange
            Long feedbackId = 1L;
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(feedbackId);
            feedback.setRating(5);
            feedback.setComment("Great service!");
            feedback.setCustomer(customer);
            feedback.setWarrantyClaim(warrantyClaim);

            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.of(feedback));

            // Act
            FeedbackResponseDTO result = feedbackService.getFeedbackById(feedbackId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRating()).isEqualTo(5);
            verify(feedbackRepository).findById(feedbackId);
        }

        @Test
        @DisplayName("Should throw exception when feedback not found")
        void getFeedbackById_NotFound_ThrowsException() {
            // Arrange
            Long feedbackId = 999L;
            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> feedbackService.getFeedbackById(feedbackId));
        }
    }

    @Nested
    @DisplayName("Get Feedback By Claim ID")
    class GetFeedbackByClaimId {

        @Test
        @DisplayName("Should return feedback when found for claim")
        void getFeedbackByClaimId_Found_ReturnsFeedback() {
            // Arrange
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(1L);
            feedback.setRating(4);
            feedback.setCustomer(customer);
            feedback.setWarrantyClaim(warrantyClaim);

            when(feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)).thenReturn(Optional.of(feedback));

            // Act
            FeedbackResponseDTO result = feedbackService.getFeedbackByClaimId(warrantyClaimId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRating()).isEqualTo(4);
            verify(feedbackRepository).findByWarrantyClaimWarrantyClaimId(warrantyClaimId);
        }

        @Test
        @DisplayName("Should throw exception when no feedback found for claim")
        void getFeedbackByClaimId_NotFound_ThrowsException() {
            // Arrange
            when(feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> feedbackService.getFeedbackByClaimId(warrantyClaimId));
        }
    }

    @Nested
    @DisplayName("Get Feedbacks By Customer")
    class GetFeedbacksByCustomer {

        @Test
        @DisplayName("Should return paginated feedbacks for customer")
        void getFeedbacksByCustomer_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Feedback> feedbacks = new ArrayList<>();
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(1L);
            feedback.setRating(5);
            feedback.setCustomer(customer);
            feedback.setWarrantyClaim(warrantyClaim);
            feedbacks.add(feedback);

            Page<Feedback> feedbackPage = new PageImpl<>(feedbacks, pageable, 1);

            when(customerRepository.existsById(customerId)).thenReturn(true);
            when(feedbackRepository.findByCustomerCustomerId(customerId, pageable)).thenReturn(feedbackPage);

            // Act
            PagedResponse<FeedbackResponseDTO> result = feedbackService.getFeedbacksByCustomer(customerId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(feedbackRepository).findByCustomerCustomerId(customerId, pageable);
        }

        @Test
        @DisplayName("Should throw exception when customer not found")
        void getFeedbacksByCustomer_CustomerNotFound_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            when(customerRepository.existsById(customerId)).thenReturn(false);

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> feedbackService.getFeedbacksByCustomer(customerId, pageable));
            verify(feedbackRepository, never()).findByCustomerCustomerId(any(), any());
        }
    }

    @Nested
    @DisplayName("Get All Feedbacks")
    class GetAllFeedbacks {

        @Test
        @DisplayName("Should return all feedbacks paginated")
        void getAllFeedbacks_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Feedback> feedbacks = new ArrayList<>();
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(1L);
            feedback.setRating(4);
            feedback.setCustomer(customer);
            feedback.setWarrantyClaim(warrantyClaim);
            feedbacks.add(feedback);

            Page<Feedback> feedbackPage = new PageImpl<>(feedbacks, pageable, 1);
            when(feedbackRepository.findAll(pageable)).thenReturn(feedbackPage);

            // Act
            PagedResponse<FeedbackResponseDTO> result = feedbackService.getAllFeedbacks(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(feedbackRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return empty page when no feedbacks")
        void getAllFeedbacks_EmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Feedback> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(feedbackRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<FeedbackResponseDTO> result = feedbackService.getAllFeedbacks(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Feedbacks By Rating")
    class GetFeedbacksByRating {

        @Test
        @DisplayName("Should return feedbacks with exact rating")
        void getFeedbacksByRating_Success() {
            // Arrange
            Integer rating = 5;
            Pageable pageable = PageRequest.of(0, 10);
            List<Feedback> feedbacks = new ArrayList<>();
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(1L);
            feedback.setRating(5);
            feedback.setCustomer(customer);
            feedback.setWarrantyClaim(warrantyClaim);
            feedbacks.add(feedback);

            Page<Feedback> feedbackPage = new PageImpl<>(feedbacks, pageable, 1);
            when(feedbackRepository.findByRating(rating, pageable)).thenReturn(feedbackPage);

            // Act
            PagedResponse<FeedbackResponseDTO> result = feedbackService.getFeedbacksByRating(rating, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(feedbackRepository).findByRating(rating, pageable);
        }

        @Test
        @DisplayName("Should throw exception for invalid rating below 1")
        void getFeedbacksByRating_InvalidRatingLow_ThrowsException() {
            // Arrange
            Integer invalidRating = 0;
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> feedbackService.getFeedbacksByRating(invalidRating, pageable));
            assertThat(exception.getMessage()).contains("Rating must be between 1 and 5");
        }

        @Test
        @DisplayName("Should throw exception for invalid rating above 5")
        void getFeedbacksByRating_InvalidRatingHigh_ThrowsException() {
            // Arrange
            Integer invalidRating = 6;
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> feedbackService.getFeedbacksByRating(invalidRating, pageable));
            assertThat(exception.getMessage()).contains("Rating must be between 1 and 5");
        }
    }

    @Nested
    @DisplayName("Get Feedbacks By Min Rating")
    class GetFeedbacksByMinRating {

        @Test
        @DisplayName("Should return feedbacks with rating >= minimum")
        void getFeedbacksByMinRating_Success() {
            // Arrange
            Integer minRating = 4;
            Pageable pageable = PageRequest.of(0, 10);
            List<Feedback> feedbacks = new ArrayList<>();
            Feedback feedback1 = new Feedback();
            feedback1.setFeedbackId(1L);
            feedback1.setRating(4);
            feedback1.setCustomer(customer);
            feedback1.setWarrantyClaim(warrantyClaim);
            feedbacks.add(feedback1);

            Page<Feedback> feedbackPage = new PageImpl<>(feedbacks, pageable, 1);
            when(feedbackRepository.findByRatingGreaterThanEqual(minRating, pageable)).thenReturn(feedbackPage);

            // Act
            PagedResponse<FeedbackResponseDTO> result = feedbackService.getFeedbacksByMinRating(minRating, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(feedbackRepository).findByRatingGreaterThanEqual(minRating, pageable);
        }

        @Test
        @DisplayName("Should throw exception for invalid minimum rating")
        void getFeedbacksByMinRating_InvalidRating_ThrowsException() {
            // Arrange
            Integer invalidRating = 7;
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> feedbackService.getFeedbacksByMinRating(invalidRating, pageable));
            assertThat(exception.getMessage()).contains("Rating must be between 1 and 5");
        }
    }

    @Nested
    @DisplayName("Update Feedback")
    class UpdateFeedback {

        @Test
        @DisplayName("Should update feedback successfully")
        void updateFeedback_Success() {
            // Arrange
            Long feedbackId = 1L;
            FeedbackRequestDTO updateDTO = new FeedbackRequestDTO();
            updateDTO.setRating(4);
            updateDTO.setComment("Updated comment");

            Feedback existingFeedback = new Feedback();
            existingFeedback.setFeedbackId(feedbackId);
            existingFeedback.setRating(5);
            existingFeedback.setComment("Old comment");
            existingFeedback.setCustomer(customer);
            existingFeedback.setWarrantyClaim(warrantyClaim);

            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.of(existingFeedback));
            when(feedbackRepository.save(any(Feedback.class))).thenReturn(existingFeedback);

            // Act
            FeedbackResponseDTO result = feedbackService.updateFeedback(feedbackId, updateDTO, customerId);

            // Assert
            assertThat(result).isNotNull();
            verify(feedbackRepository).save(any(Feedback.class));
        }

        @Test
        @DisplayName("Should throw exception when feedback not found")
        void updateFeedback_NotFound_ThrowsException() {
            // Arrange
            Long feedbackId = 999L;
            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> feedbackService.updateFeedback(feedbackId, requestDTO, customerId));
        }

        @Test
        @DisplayName("Should throw exception when customer not authorized")
        void updateFeedback_NotAuthorized_ThrowsException() {
            // Arrange
            Long feedbackId = 1L;
            UUID otherCustomerId = UUID.randomUUID();

            Feedback existingFeedback = new Feedback();
            existingFeedback.setFeedbackId(feedbackId);
            existingFeedback.setCustomer(customer);

            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.of(existingFeedback));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> feedbackService.updateFeedback(feedbackId, requestDTO, otherCustomerId));
            assertThat(exception.getMessage()).contains("You are not authorized to update this feedback");
        }
    }

    @Nested
    @DisplayName("Delete Feedback")
    class DeleteFeedback {

        @Test
        @DisplayName("Should delete feedback successfully")
        void deleteFeedback_Success() {
            // Arrange
            Long feedbackId = 1L;
            Feedback feedback = new Feedback();
            feedback.setFeedbackId(feedbackId);
            feedback.setCustomer(customer);

            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.of(feedback));
            doNothing().when(feedbackRepository).delete(feedback);

            // Act
            feedbackService.deleteFeedback(feedbackId, customerId);

            // Assert
            verify(feedbackRepository).delete(feedback);
        }

        @Test
        @DisplayName("Should throw exception when feedback not found")
        void deleteFeedback_NotFound_ThrowsException() {
            // Arrange
            Long feedbackId = 999L;
            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> feedbackService.deleteFeedback(feedbackId, customerId));
            verify(feedbackRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should throw exception when customer not authorized")
        void deleteFeedback_NotAuthorized_ThrowsException() {
            // Arrange
            Long feedbackId = 1L;
            UUID otherCustomerId = UUID.randomUUID();

            Feedback feedback = new Feedback();
            feedback.setFeedbackId(feedbackId);
            feedback.setCustomer(customer);

            when(feedbackRepository.findById(feedbackId)).thenReturn(Optional.of(feedback));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> feedbackService.deleteFeedback(feedbackId, otherCustomerId));
            assertThat(exception.getMessage()).contains("You are not authorized to delete this feedback");
            verify(feedbackRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("Get Average Rating")
    class GetAverageRating {

        @Test
        @DisplayName("Should return average rating")
        void getAverageRating_Success() {
            // Arrange
            Double expectedAverage = 4.5;
            when(feedbackRepository.getAverageRating()).thenReturn(expectedAverage);

            // Act
            Double result = feedbackService.getAverageRating();

            // Assert
            assertThat(result).isEqualTo(expectedAverage);
            verify(feedbackRepository).getAverageRating();
        }

        @Test
        @DisplayName("Should return null when no feedbacks")
        void getAverageRating_NoFeedbacks_ReturnsNull() {
            // Arrange
            when(feedbackRepository.getAverageRating()).thenReturn(null);

            // Act
            Double result = feedbackService.getAverageRating();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("Get Average Rating By Service Center")
    class GetAverageRatingByServiceCenter {

        @Test
        @DisplayName("Should return average rating for service center")
        void getAverageRatingByServiceCenter_Success() {
            // Arrange
            Long serviceCenterId = 1L;
            Double expectedAverage = 4.2;
            when(feedbackRepository.getAverageRatingByServiceCenter(serviceCenterId)).thenReturn(expectedAverage);

            // Act
            Double result = feedbackService.getAverageRatingByServiceCenter(serviceCenterId);

            // Assert
            assertThat(result).isEqualTo(expectedAverage);
            verify(feedbackRepository).getAverageRatingByServiceCenter(serviceCenterId);
        }

        @Test
        @DisplayName("Should return null when no feedbacks for service center")
        void getAverageRatingByServiceCenter_NoFeedbacks_ReturnsNull() {
            // Arrange
            Long serviceCenterId = 999L;
            when(feedbackRepository.getAverageRatingByServiceCenter(serviceCenterId)).thenReturn(null);

            // Act
            Double result = feedbackService.getAverageRatingByServiceCenter(serviceCenterId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("Count By Rating")
    class CountByRating {

        @Test
        @DisplayName("Should return count for valid rating")
        void countByRating_Success() {
            // Arrange
            Integer rating = 5;
            Long expectedCount = 10L;
            when(feedbackRepository.countByRating(rating)).thenReturn(expectedCount);

            // Act
            Long result = feedbackService.countByRating(rating);

            // Assert
            assertThat(result).isEqualTo(expectedCount);
            verify(feedbackRepository).countByRating(rating);
        }

        @Test
        @DisplayName("Should throw exception for invalid rating")
        void countByRating_InvalidRating_ThrowsException() {
            // Arrange
            Integer invalidRating = 10;

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> feedbackService.countByRating(invalidRating));
            assertThat(exception.getMessage()).contains("Rating must be between 1 and 5");
        }
    }
}
