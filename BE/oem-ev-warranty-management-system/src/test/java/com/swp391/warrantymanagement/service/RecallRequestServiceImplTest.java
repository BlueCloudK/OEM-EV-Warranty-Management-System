package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.RecallRequestRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.service.impl.RecallRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecallRequestService Unit Tests")
class RecallRequestServiceImplTest {

    @Mock
    private RecallRequestRepository recallRequestRepository;
    @Mock
    private WarrantyClaimRepository warrantyClaimRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InstalledPartRepository installedPartRepository;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private RecallRequestServiceImpl recallRequestService;

    private RecallRequest recallRequest;
    private User customerUser;
    private User evmUser;
    private User adminUser;
    private Customer customer;
    private InstalledPart installedPart;
    private Vehicle vehicle;
    private final String authHeader = "Bearer valid-token";

    @BeforeEach
    void setUp() {
        customerUser = new User();
        customerUser.setUserId(1L);
        customerUser.setUsername("customer");
        customerUser.setCreatedAt(LocalDateTime.now());

        evmUser = new User();
        evmUser.setUserId(2L);
        evmUser.setUsername("evmstaff");
        evmUser.setCreatedAt(LocalDateTime.now());

        adminUser = new User();
        adminUser.setUserId(3L);
        adminUser.setUsername("admin");
        adminUser.setCreatedAt(LocalDateTime.now());

        customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setUser(customerUser);
        customerUser.setCustomer(customer);

        vehicle = new Vehicle();
        vehicle.setCustomer(customer);

        installedPart = new InstalledPart();
        installedPart.setInstalledPartId(1L);
        installedPart.setVehicle(vehicle);

        recallRequest = new RecallRequest();
        recallRequest.setRecallRequestId(1L);
        recallRequest.setInstalledPart(installedPart);
        recallRequest.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);
        recallRequest.setCreatedBy(evmUser);
    }

    @Nested
    @DisplayName("Create Recall Request")
    class CreateRecallRequest {

        @Test
        @DisplayName("Should create recall request successfully")
        void createRecallRequest_Success() {
            // Arrange
            RecallRequestRequestDTO requestDTO = new RecallRequestRequestDTO();
            requestDTO.setInstalledPartId(1L);
            requestDTO.setReason("Defective battery - safety recall");

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));
            when(recallRequestRepository.save(any(RecallRequest.class))).thenAnswer(inv -> {
                RecallRequest saved = inv.getArgument(0);
                saved.setRecallRequestId(1L);
                return saved;
            });

            // Act
            RecallRequestResponseDTO result = recallRequestService.createRecallRequest(requestDTO, authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRecallRequestId()).isEqualTo(1L);

            ArgumentCaptor<RecallRequest> captor = ArgumentCaptor.forClass(RecallRequest.class);
            verify(recallRequestRepository).save(captor.capture());
            RecallRequest saved = captor.getValue();

            assertThat(saved.getReason()).isEqualTo("Defective battery - safety recall");
            assertThat(saved.getStatus()).isEqualTo(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
            assertThat(saved.getCreatedBy()).isEqualTo(evmUser);
        }

        @Test
        @DisplayName("Should throw exception when installed part not found")
        void createRecallRequest_InstalledPartNotFound_ThrowsException() {
            // Arrange
            RecallRequestRequestDTO requestDTO = new RecallRequestRequestDTO();
            requestDTO.setInstalledPartId(999L);
            requestDTO.setReason("Test reason");

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(installedPartRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.createRecallRequest(requestDTO, authHeader));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void createRecallRequest_UserNotFound_ThrowsException() {
            // Arrange
            RecallRequestRequestDTO requestDTO = new RecallRequestRequestDTO();
            requestDTO.setInstalledPartId(1L);
            requestDTO.setReason("Test reason");

            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.createRecallRequest(requestDTO, authHeader));
        }
    }

    @Nested
    @DisplayName("Get Recall Requests For Admin")
    class GetRecallRequestsForAdmin {

        @Test
        @DisplayName("Should return all recall requests")
        void getRecallRequestsForAdmin_Success() {
            // Arrange
            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);

            RecallRequest recall2 = new RecallRequest();
            recall2.setRecallRequestId(2L);
            recall2.setInstalledPart(installedPart);
            recall2.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
            recalls.add(recall2);

            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForAdmin();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            verify(recallRequestRepository).findAll();
        }
    }

    @Nested
    @DisplayName("Get Recall Requests For Customer")
    class GetRecallRequestsForCustomer {

        @Test
        @DisplayName("Should return recall requests for specific customer")
        void getRecallRequestsForCustomer_Success() {
            // Arrange
            UUID customerId = customer.getCustomerId();
            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);

            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForCustomer(customerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty list for customer with no recalls")
        void getRecallRequestsForCustomer_NoRecalls_ReturnsEmpty() {
            // Arrange
            UUID otherCustomerId = UUID.randomUUID();
            when(recallRequestRepository.findAll()).thenReturn(new ArrayList<>());

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForCustomer(otherCustomerId);

            // Assert
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should filter out recalls with null installedPart")
        void getRecallRequestsForCustomer_NullInstalledPart_FiltersOut() {
            // Arrange
            RecallRequest recallWithNullPart = new RecallRequest();
            recallWithNullPart.setRecallRequestId(2L);
            recallWithNullPart.setInstalledPart(null); // Null installedPart

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullPart);

            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForCustomer(customer.getCustomerId());

            // Assert
            assertThat(result).hasSize(1); // Only the valid one
        }

        @Test
        @DisplayName("Should filter out recalls with null vehicle")
        void getRecallRequestsForCustomer_NullVehicle_FiltersOut() {
            // Arrange
            InstalledPart partWithNullVehicle = new InstalledPart();
            partWithNullVehicle.setInstalledPartId(2L);
            partWithNullVehicle.setVehicle(null); // Null vehicle

            RecallRequest recallWithNullVehicle = new RecallRequest();
            recallWithNullVehicle.setRecallRequestId(2L);
            recallWithNullVehicle.setInstalledPart(partWithNullVehicle);

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullVehicle);

            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForCustomer(customer.getCustomerId());

            // Assert
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should filter out recalls with null customer")
        void getRecallRequestsForCustomer_NullCustomer_FiltersOut() {
            // Arrange
            Vehicle vehicleWithNullCustomer = new Vehicle();
            vehicleWithNullCustomer.setCustomer(null); // Null customer

            InstalledPart partWithNullCustomer = new InstalledPart();
            partWithNullCustomer.setInstalledPartId(2L);
            partWithNullCustomer.setVehicle(vehicleWithNullCustomer);

            RecallRequest recallWithNullCustomer = new RecallRequest();
            recallWithNullCustomer.setRecallRequestId(2L);
            recallWithNullCustomer.setInstalledPart(partWithNullCustomer);

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullCustomer);

            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getRecallRequestsForCustomer(customer.getCustomerId());

            // Assert
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Approve Recall Request")
    class ApproveRecallRequest {

        @Test
        @DisplayName("Should approve PENDING recall request")
        void approveRecallRequest_Success() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);

            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));
            when(recallRequestRepository.save(any(RecallRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            RecallRequestResponseDTO result = recallRequestService.approveRecallRequest(1L, "Approved for recall", authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);

            ArgumentCaptor<RecallRequest> captor = ArgumentCaptor.forClass(RecallRequest.class);
            verify(recallRequestRepository).save(captor.capture());
            RecallRequest saved = captor.getValue();

            assertThat(saved.getStatus()).isEqualTo(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);
            assertThat(saved.getAdminNote()).isEqualTo("Approved for recall");
            assertThat(saved.getApprovedBy()).isEqualTo(adminUser);
        }

        @Test
        @DisplayName("Should throw exception when approving non-PENDING request")
        void approveRecallRequest_InvalidStatus_ThrowsException() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);

            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> recallRequestService.approveRecallRequest(1L, "Note", authHeader));
            assertThat(exception.getMessage()).contains("Can only approve recall requests with status PENDING_ADMIN_APPROVAL");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void approveRecallRequest_UserNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.approveRecallRequest(1L, "Note", authHeader));
        }

        @Test
        @DisplayName("Should throw exception when recall not found")
        void approveRecallRequest_RecallNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.approveRecallRequest(999L, "Note", authHeader));
        }
    }

    @Nested
    @DisplayName("Reject Recall Request")
    class RejectRecallRequest {

        @Test
        @DisplayName("Should reject PENDING recall request")
        void rejectRecallRequest_Success() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);

            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));
            when(recallRequestRepository.save(any(RecallRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            RecallRequestResponseDTO result = recallRequestService.rejectRecallRequest(1L, "Not a safety issue", authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(RecallRequestStatus.REJECTED_BY_ADMIN);

            ArgumentCaptor<RecallRequest> captor = ArgumentCaptor.forClass(RecallRequest.class);
            verify(recallRequestRepository).save(captor.capture());
            RecallRequest saved = captor.getValue();

            assertThat(saved.getStatus()).isEqualTo(RecallRequestStatus.REJECTED_BY_ADMIN);
            assertThat(saved.getAdminNote()).isEqualTo("Not a safety issue");
            assertThat(saved.getApprovedBy()).isEqualTo(adminUser);
        }

        @Test
        @DisplayName("Should throw exception when rejecting non-PENDING request")
        void rejectRecallRequest_InvalidStatus_ThrowsException() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.CLAIM_CREATED);

            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> recallRequestService.rejectRecallRequest(1L, "Note", authHeader));
            assertThat(exception.getMessage()).contains("Can only reject recall requests with status PENDING_ADMIN_APPROVAL");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void rejectRecallRequest_UserNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.rejectRecallRequest(1L, "Note", authHeader));
        }

        @Test
        @DisplayName("Should throw exception when recall not found")
        void rejectRecallRequest_RecallNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("admin");
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(recallRequestRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.rejectRecallRequest(999L, "Note", authHeader));
        }
    }

    @Nested
    @DisplayName("Get My Recall Requests")
    class GetMyRecallRequests {

        @Test
        @DisplayName("Should return customer's recall requests")
        void getMyRecallRequests_Success() {
            // Arrange
            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getMyRecallRequests(authHeader);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should throw exception when user is not a customer")
        void getMyRecallRequests_NotCustomer_ThrowsException() {
            // Arrange
            evmUser.setCustomer(null);

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> recallRequestService.getMyRecallRequests(authHeader));
            assertThat(exception.getMessage()).isEqualTo("User is not a customer");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getMyRecallRequests_UserNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.getMyRecallRequests(authHeader));
        }

        @Test
        @DisplayName("Should filter out recalls with null installedPart")
        void getMyRecallRequests_NullInstalledPart_FiltersOut() {
            // Arrange
            RecallRequest recallWithNullPart = new RecallRequest();
            recallWithNullPart.setRecallRequestId(2L);
            recallWithNullPart.setInstalledPart(null);

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullPart);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getMyRecallRequests(authHeader);

            // Assert
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should filter out recalls with null vehicle")
        void getMyRecallRequests_NullVehicle_FiltersOut() {
            // Arrange
            InstalledPart partWithNullVehicle = new InstalledPart();
            partWithNullVehicle.setInstalledPartId(2L);
            partWithNullVehicle.setVehicle(null);

            RecallRequest recallWithNullVehicle = new RecallRequest();
            recallWithNullVehicle.setRecallRequestId(2L);
            recallWithNullVehicle.setInstalledPart(partWithNullVehicle);

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullVehicle);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getMyRecallRequests(authHeader);

            // Assert
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should filter out recalls with null customer")
        void getMyRecallRequests_NullCustomer_FiltersOut() {
            // Arrange
            Vehicle vehicleWithNullCustomer = new Vehicle();
            vehicleWithNullCustomer.setCustomer(null);

            InstalledPart partWithNullCustomer = new InstalledPart();
            partWithNullCustomer.setInstalledPartId(2L);
            partWithNullCustomer.setVehicle(vehicleWithNullCustomer);

            RecallRequest recallWithNullCustomer = new RecallRequest();
            recallWithNullCustomer.setRecallRequestId(2L);
            recallWithNullCustomer.setInstalledPart(partWithNullCustomer);

            List<RecallRequest> recalls = new ArrayList<>();
            recalls.add(recallRequest);
            recalls.add(recallWithNullCustomer);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findAll()).thenReturn(recalls);

            // Act
            List<RecallRequestResponseDTO> result = recallRequestService.getMyRecallRequests(authHeader);

            // Assert
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Delete Recall Request")
    class DeleteRecallRequest {

        @Test
        @DisplayName("Should delete PENDING recall request by creator")
        void deleteRecallRequest_Success() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
            recallRequest.setCreatedBy(evmUser);

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));
            doNothing().when(recallRequestRepository).delete(recallRequest);

            // Act
            recallRequestService.deleteRecallRequest(1L, authHeader);

            // Assert
            verify(recallRequestRepository).delete(recallRequest);
        }

        @Test
        @DisplayName("Should throw exception when deleting non-PENDING request")
        void deleteRecallRequest_InvalidStatus_ThrowsException() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);
            recallRequest.setCreatedBy(evmUser);

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> recallRequestService.deleteRecallRequest(1L, authHeader));
            assertThat(exception.getMessage()).contains("Can only delete recall requests with status PENDING_ADMIN_APPROVAL");
            verify(recallRequestRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should throw exception when deleting someone else's request")
        void deleteRecallRequest_NotOwner_ThrowsException() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
            recallRequest.setCreatedBy(adminUser);

            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> recallRequestService.deleteRecallRequest(1L, authHeader));
            assertThat(exception.getMessage()).contains("You can only delete recall requests that you created");
            verify(recallRequestRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("Customer Confirm Recall")
    class CustomerConfirmRecall {

        @Test
        @DisplayName("Should create WarrantyClaim when customer accepts")
        void customerConfirmRecall_Accepts_CreatesWarrantyClaim() {
            // Arrange
            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(true);
            responseDTO.setCustomerNote("I agree to the recall.");

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));
            when(recallRequestRepository.save(any(RecallRequest.class))).thenAnswer(inv -> inv.getArgument(0));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            recallRequestService.customerConfirmRecall(1L, responseDTO, authHeader);

            // Assert
            ArgumentCaptor<WarrantyClaim> claimCaptor = ArgumentCaptor.forClass(WarrantyClaim.class);
            verify(warrantyClaimRepository).save(claimCaptor.capture());
            WarrantyClaim savedClaim = claimCaptor.getValue();

            assertThat(savedClaim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
            assertThat(savedClaim.getDescription()).contains("RECALL");

            ArgumentCaptor<RecallRequest> recallCaptor = ArgumentCaptor.forClass(RecallRequest.class);
            verify(recallRequestRepository).save(recallCaptor.capture());
            RecallRequest savedRecall = recallCaptor.getValue();

            assertThat(savedRecall.getStatus()).isEqualTo(RecallRequestStatus.CLAIM_CREATED);
            assertThat(savedRecall.getWarrantyClaim()).isEqualTo(savedClaim);
        }

        @Test
        @DisplayName("Should set status to REJECTED_BY_CUSTOMER when customer rejects")
        void customerConfirmRecall_Rejects_SetsStatus() {
            // Arrange
            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(false);
            responseDTO.setCustomerNote("I will do it later.");

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));
            when(recallRequestRepository.save(any(RecallRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            recallRequestService.customerConfirmRecall(1L, responseDTO, authHeader);

            // Assert
            ArgumentCaptor<RecallRequest> recallCaptor = ArgumentCaptor.forClass(RecallRequest.class);
            verify(recallRequestRepository).save(recallCaptor.capture());
            RecallRequest savedRecall = recallCaptor.getValue();

            assertThat(savedRecall.getStatus()).isEqualTo(RecallRequestStatus.REJECTED_BY_CUSTOMER);
        }

        @Test
        @DisplayName("Should throw exception if status is not WAITING_CUSTOMER_CONFIRM")
        void customerConfirmRecall_InvalidStatus_ThrowsException() {
            // Arrange
            recallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(true);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> recallRequestService.customerConfirmRecall(1L, responseDTO, authHeader));
            assertThat(exception.getMessage()).contains("Can only confirm recall requests with status WAITING_CUSTOMER_CONFIRM");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void customerConfirmRecall_UserNotFound_ThrowsException() {
            // Arrange
            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(true);

            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.customerConfirmRecall(1L, responseDTO, authHeader));
        }

        @Test
        @DisplayName("Should throw exception when recall not found")
        void customerConfirmRecall_RecallNotFound_ThrowsException() {
            // Arrange
            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(true);

            when(jwtService.extractUsername("valid-token")).thenReturn("customer");
            when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
            when(recallRequestRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.customerConfirmRecall(999L, responseDTO, authHeader));
        }

        @Test
        @DisplayName("Should throw exception when customer does not own the vehicle")
        void customerConfirmRecall_NotOwner_ThrowsException() {
            // Arrange
            User otherCustomerUser = new User();
            otherCustomerUser.setUserId(99L);
            otherCustomerUser.setUsername("othercustomer");

            RecallCustomerResponseDTO responseDTO = new RecallCustomerResponseDTO();
            responseDTO.setAccepted(true);

            when(jwtService.extractUsername("valid-token")).thenReturn("othercustomer");
            when(userRepository.findByUsername("othercustomer")).thenReturn(Optional.of(otherCustomerUser));
            when(recallRequestRepository.findById(1L)).thenReturn(Optional.of(recallRequest));

            // Act & Assert
            AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> recallRequestService.customerConfirmRecall(1L, responseDTO, authHeader));
            assertThat(exception.getMessage()).contains("You can only confirm recall requests for your own vehicles");
        }
    }

    @Nested
    @DisplayName("Delete Recall Request - Additional Tests")
    class DeleteRecallRequestAdditional {

        @Test
        @DisplayName("Should throw exception when user not found")
        void deleteRecallRequest_UserNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.deleteRecallRequest(1L, authHeader));
        }

        @Test
        @DisplayName("Should throw exception when recall not found")
        void deleteRecallRequest_RecallNotFound_ThrowsException() {
            // Arrange
            when(jwtService.extractUsername("valid-token")).thenReturn("evmstaff");
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmUser));
            when(recallRequestRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class,
                () -> recallRequestService.deleteRecallRequest(999L, authHeader));
        }
    }
}
