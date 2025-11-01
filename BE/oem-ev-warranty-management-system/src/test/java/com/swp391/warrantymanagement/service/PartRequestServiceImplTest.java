package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.service.impl.PartRequestServiceImpl;
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
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartRequestService Unit Tests")
class PartRequestServiceImplTest {

    @Mock
    private PartRequestRepository partRequestRepository;
    @Mock
    private WarrantyClaimRepository warrantyClaimRepository;
    @Mock
    private PartRepository partRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceCenterRepository serviceCenterRepository;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private PartRequestServiceImpl partRequestService;

    private User technician;
    private WarrantyClaim warrantyClaim;
    private Part faultyPart;
    private ServiceCenter serviceCenter;
    private PartRequestRequestDTO requestDTO;
    private String authHeader = "Bearer valid-token";

    @BeforeEach
    void setUp() {
        technician = new User();
        technician.setUserId(1L);
        technician.setUsername("tech");

        warrantyClaim = new WarrantyClaim();
        warrantyClaim.setWarrantyClaimId(1L);

        faultyPart = new Part();
        faultyPart.setPartId(1L);

        serviceCenter = new ServiceCenter();
        serviceCenter.setServiceCenterId(1L);

        requestDTO = new PartRequestRequestDTO();
        requestDTO.setWarrantyClaimId(1L);
        requestDTO.setFaultyPartId(1L);
        requestDTO.setServiceCenterId(1L);
        requestDTO.setQuantity(1);
    }

    @Nested
    @DisplayName("Create Part Request")
    class CreatePartRequest {

        @Test
        @DisplayName("Should create part request successfully")
        void createPartRequest_Success() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(warrantyClaim));
            when(partRepository.findById(1L)).thenReturn(Optional.of(faultyPart));
            when(serviceCenterRepository.findById(1L)).thenReturn(Optional.of(serviceCenter));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.createPartRequest(requestDTO, authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.PENDING);
            assertThat(result.getRequestedByUsername()).isEqualTo("tech");
            verify(partRequestRepository).save(any(PartRequest.class));
        }

        @Test
        @DisplayName("Should throw exception when warranty claim not found")
        void createPartRequest_ClaimNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> partRequestService.createPartRequest(requestDTO, authHeader));
        }
    }

    @Nested
    @DisplayName("Approve Part Request")
    class ApprovePartRequest {

        private PartRequest pendingRequest;
        private User evmStaff;

        @BeforeEach
        void setUp() {
            pendingRequest = new PartRequest();
            pendingRequest.setRequestId(1L);
            pendingRequest.setStatus(PartRequestStatus.PENDING);

            evmStaff = new User();
            evmStaff.setUserId(2L);
            evmStaff.setUsername("staff");
        }

        @Test
        @DisplayName("Should approve a PENDING request successfully")
        void approvePartRequest_Success() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("staff");
            when(userRepository.findByUsername("staff")).thenReturn(Optional.of(evmStaff));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.approvePartRequest(1L, "Approved", authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.APPROVED);
            assertThat(result.getApprovedByUsername()).isEqualTo("staff");
            assertThat(result.getNotes()).isEqualTo("Approved");
        }

        @Test
        @DisplayName("Should throw exception when trying to approve a non-PENDING request")
        void approvePartRequest_NotPending_ThrowsException() {
            // Arrange
            pendingRequest.setStatus(PartRequestStatus.APPROVED);
            when(jwtService.extractUsername("valid-token")).thenReturn("staff");
            when(userRepository.findByUsername("staff")).thenReturn(Optional.of(evmStaff));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> partRequestService.approvePartRequest(1L, "Approved", authHeader));
            assertThat(exception.getMessage()).isEqualTo("Can only approve PENDING requests");
        }
    }

    @Nested
    @DisplayName("Get Part Request By ID")
    class GetPartRequestById {

        @Test
        @DisplayName("Should return part request when found")
        void getPartRequestById_Found_ReturnsPartRequest() {
            // Arrange
            PartRequest partRequest = new PartRequest();
            partRequest.setRequestId(1L);
            partRequest.setStatus(PartRequestStatus.PENDING);
            partRequest.setRequestedBy(technician);

            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(partRequest));

            // Act
            PartRequestResponseDTO result = partRequestService.getPartRequestById(1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRequestId()).isEqualTo(1L);
            verify(partRequestRepository).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when part request not found")
        void getPartRequestById_NotFound_ThrowsException() {
            // Arrange
            when(partRequestRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> partRequestService.getPartRequestById(999L));
        }
    }

    @Nested
    @DisplayName("Get All Part Requests")
    class GetAllPartRequests {

        @Test
        @DisplayName("Should return paginated part requests")
        void getAllPartRequests_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setStatus(PartRequestStatus.PENDING);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getAllPartRequests(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Get Part Requests By Status")
    class GetPartRequestsByStatus {

        @Test
        @DisplayName("Should return part requests with specific status")
        void getPartRequestsByStatus_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setStatus(PartRequestStatus.APPROVED);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findByStatus(PartRequestStatus.APPROVED, pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getPartRequestsByStatus(PartRequestStatus.APPROVED, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(partRequestRepository).findByStatus(PartRequestStatus.APPROVED, pageable);
        }
    }

    @Nested
    @DisplayName("Reject Part Request")
    class RejectPartRequest {

        @Test
        @DisplayName("Should reject PENDING request successfully")
        void rejectPartRequest_Success() {
            // Arrange
            PartRequest pendingRequest = new PartRequest();
            pendingRequest.setRequestId(1L);
            pendingRequest.setStatus(PartRequestStatus.PENDING);

            User evmStaff = new User();
            evmStaff.setUserId(2L);
            evmStaff.setUsername("staff");

            when(jwtService.extractUsername("valid-token")).thenReturn("staff");
            when(userRepository.findByUsername("staff")).thenReturn(Optional.of(evmStaff));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.rejectPartRequest(1L, "Insufficient documentation", authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.REJECTED);
            assertThat(result.getRejectionReason()).isEqualTo("Insufficient documentation");
        }

        @Test
        @DisplayName("Should throw exception when rejecting non-PENDING request")
        void rejectPartRequest_NotPending_ThrowsException() {
            // Arrange
            PartRequest approvedRequest = new PartRequest();
            approvedRequest.setRequestId(1L);
            approvedRequest.setStatus(PartRequestStatus.APPROVED);

            User evmStaff = new User();
            evmStaff.setUsername("staff");

            when(jwtService.extractUsername("valid-token")).thenReturn("staff");
            when(userRepository.findByUsername("staff")).thenReturn(Optional.of(evmStaff));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(approvedRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> partRequestService.rejectPartRequest(1L, "Reason", authHeader));
            assertThat(exception.getMessage()).isEqualTo("Can only reject PENDING requests");
        }
    }

    @Nested
    @DisplayName("Mark As Shipped")
    class MarkAsShipped {

        @Test
        @DisplayName("Should mark APPROVED request as shipped")
        void markAsShipped_Success() {
            // Arrange
            PartRequest approvedRequest = new PartRequest();
            approvedRequest.setRequestId(1L);
            approvedRequest.setStatus(PartRequestStatus.APPROVED);

            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(approvedRequest));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.markAsShipped(1L, "TRACK123", authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.SHIPPED);
            assertThat(result.getTrackingNumber()).isEqualTo("TRACK123");
        }

        @Test
        @DisplayName("Should throw exception when marking non-APPROVED request as shipped")
        void markAsShipped_NotApproved_ThrowsException() {
            // Arrange
            PartRequest pendingRequest = new PartRequest();
            pendingRequest.setRequestId(1L);
            pendingRequest.setStatus(PartRequestStatus.PENDING);

            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> partRequestService.markAsShipped(1L, "TRACK123", authHeader));
            assertThat(exception.getMessage()).isEqualTo("Can only ship APPROVED requests");
        }
    }

    @Nested
    @DisplayName("Mark As Delivered")
    class MarkAsDelivered {

        @Test
        @DisplayName("Should mark SHIPPED request as delivered")
        void markAsDelivered_Success() {
            // Arrange
            PartRequest shippedRequest = new PartRequest();
            shippedRequest.setRequestId(1L);
            shippedRequest.setStatus(PartRequestStatus.SHIPPED);

            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(shippedRequest));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.markAsDelivered(1L, authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.DELIVERED);
        }

        @Test
        @DisplayName("Should throw exception when marking non-SHIPPED request as delivered")
        void markAsDelivered_NotShipped_ThrowsException() {
            // Arrange
            PartRequest approvedRequest = new PartRequest();
            approvedRequest.setRequestId(1L);
            approvedRequest.setStatus(PartRequestStatus.APPROVED);

            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(approvedRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> partRequestService.markAsDelivered(1L, authHeader));
            assertThat(exception.getMessage()).isEqualTo("Can only mark SHIPPED requests as delivered");
        }
    }

    @Nested
    @DisplayName("Get Pending Requests")
    class GetPendingRequests {

        @Test
        @DisplayName("Should return pending requests")
        void getPendingRequests_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setStatus(PartRequestStatus.PENDING);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findPendingRequests(pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getPendingRequests(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get In Transit Requests")
    class GetInTransitRequests {

        @Test
        @DisplayName("Should return in-transit requests")
        void getInTransitRequests_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setStatus(PartRequestStatus.SHIPPED);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findInTransitRequests(pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getInTransitRequests(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get Part Requests By Warranty Claim")
    class GetPartRequestsByWarrantyClaim {

        @Test
        @DisplayName("Should return part requests for warranty claim")
        void getPartRequestsByWarrantyClaim_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findByWarrantyClaimWarrantyClaimId(1L, pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getPartRequestsByWarrantyClaim(1L, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get Part Requests By Service Center")
    class GetPartRequestsByServiceCenter {

        @Test
        @DisplayName("Should return part requests for service center")
        void getPartRequestsByServiceCenter_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);
            when(partRequestRepository.findByServiceCenterServiceCenterId(1L, pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getPartRequestsByServiceCenter(1L, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get My Part Requests")
    class GetMyPartRequests {

        @Test
        @DisplayName("Should return current user's part requests")
        void getMyPartRequests_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<PartRequest> requests = new ArrayList<>();
            PartRequest request = new PartRequest();
            request.setRequestId(1L);
            request.setRequestedBy(technician);
            requests.add(request);

            Page<PartRequest> page = new PageImpl<>(requests, pageable, 1);

            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(partRequestRepository.findByRequestedByUserId(1L, pageable)).thenReturn(page);

            // Act
            PagedResponse<PartRequestResponseDTO> result = partRequestService.getMyPartRequests(authHeader, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Cancel Part Request")
    class CancelPartRequest {

        @Test
        @DisplayName("Should cancel own PENDING request successfully")
        void cancelPartRequest_Success() {
            // Arrange
            PartRequest pendingRequest = new PartRequest();
            pendingRequest.setRequestId(1L);
            pendingRequest.setStatus(PartRequestStatus.PENDING);
            pendingRequest.setRequestedBy(technician);

            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));
            when(partRequestRepository.save(any(PartRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            PartRequestResponseDTO result = partRequestService.cancelPartRequest(1L, authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(PartRequestStatus.CANCELLED);
        }

        @Test
        @DisplayName("Should throw exception when cancelling someone else's request")
        void cancelPartRequest_NotOwner_ThrowsException() {
            // Arrange
            User otherUser = new User();
            otherUser.setUserId(999L);
            otherUser.setUsername("other");

            PartRequest pendingRequest = new PartRequest();
            pendingRequest.setRequestId(1L);
            pendingRequest.setStatus(PartRequestStatus.PENDING);
            pendingRequest.setRequestedBy(otherUser);

            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));

            // Act & Assert
            assertThrows(AccessDeniedException.class, () -> partRequestService.cancelPartRequest(1L, authHeader));
        }

        @Test
        @DisplayName("Should throw exception when cancelling non-PENDING request")
        void cancelPartRequest_NotPending_ThrowsException() {
            // Arrange
            PartRequest approvedRequest = new PartRequest();
            approvedRequest.setRequestId(1L);
            approvedRequest.setStatus(PartRequestStatus.APPROVED);
            approvedRequest.setRequestedBy(technician);

            when(jwtService.extractUsername("valid-token")).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(partRequestRepository.findById(1L)).thenReturn(Optional.of(approvedRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> partRequestService.cancelPartRequest(1L, authHeader));
            assertThat(exception.getMessage()).isEqualTo("Can only cancel PENDING requests");
        }
    }

    @Nested
    @DisplayName("Count By Status")
    class CountByStatus {

        @Test
        @DisplayName("Should return count for specific status")
        void countByStatus_Success() {
            // Arrange
            when(partRequestRepository.countByStatus(PartRequestStatus.PENDING)).thenReturn(5L);

            // Act
            Long count = partRequestService.countByStatus(PartRequestStatus.PENDING);

            // Assert
            assertThat(count).isEqualTo(5L);
            verify(partRequestRepository).countByStatus(PartRequestStatus.PENDING);
        }

        @Test
        @DisplayName("Should return zero when no requests with status")
        void countByStatus_NoRequests_ReturnsZero() {
            // Arrange
            when(partRequestRepository.countByStatus(PartRequestStatus.DELIVERED)).thenReturn(0L);

            // Act
            Long count = partRequestService.countByStatus(PartRequestStatus.DELIVERED);

            // Assert
            assertThat(count).isEqualTo(0L);
        }
    }
}
