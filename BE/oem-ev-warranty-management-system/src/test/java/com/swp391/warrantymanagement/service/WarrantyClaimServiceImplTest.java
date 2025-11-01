package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.service.impl.WarrantyClaimServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WarrantyClaimService Unit Tests")
class WarrantyClaimServiceImplTest {

    @Mock
    private WarrantyClaimRepository warrantyClaimRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WorkLogRepository workLogRepository;
    @Mock
    private ServiceHistoryRepository serviceHistoryRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private InstalledPartRepository installedPartRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private Authentication authentication;
    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private WarrantyClaimServiceImpl warrantyClaimService;

    private WarrantyClaim claim;
    private User technician;

    @BeforeEach
    void setUp() {
        technician = new User();
        technician.setUserId(1L);
        technician.setUsername("tech");

        claim = new WarrantyClaim();
        claim.setWarrantyClaimId(1L);
        claim.setInstalledPart(new InstalledPart());
        claim.getInstalledPart().setPart(new Part());
        claim.setVehicle(new Vehicle());
    }

    @Nested
    @DisplayName("Technician Starts Processing")
    class TechStartProcessing {

        @Test
        @DisplayName("Should change status to PROCESSING and create WorkLog")
        void techStartProcessing_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting work");

            // Assert
            ArgumentCaptor<WorkLog> workLogCaptor = ArgumentCaptor.forClass(WorkLog.class);
            verify(workLogRepository).save(workLogCaptor.capture());
            WorkLog savedWorkLog = workLogCaptor.getValue();

            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
            assertThat(savedWorkLog.getUser()).isEqualTo(technician);
            assertThat(savedWorkLog.getStartTime()).isNotNull();
            assertThat(savedWorkLog.getEndTime()).isNull();
        }

        @Test
        @DisplayName("Should throw exception if claim status is not MANAGER_REVIEW")
        void techStartProcessing_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.techStartProcessing(1L, ""));
            assertThat(exception.getMessage()).contains("Claim must be in MANAGER_REVIEW status");
        }
    }

    @Nested
    @DisplayName("Technician Completes Claim")
    class TechCompleteClaim {

        @Test
        @DisplayName("Should change status to COMPLETED and create ServiceHistory")
        void techCompleteClaim_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            // Mock security context for work log completion
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert
            ArgumentCaptor<ServiceHistory> historyCaptor = ArgumentCaptor.forClass(ServiceHistory.class);
            verify(serviceHistoryRepository, times(2)).save(historyCaptor.capture()); // Called twice for detail saving
            ServiceHistory savedHistory = historyCaptor.getValue();

            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
            assertThat(savedHistory.getServiceType()).isEqualTo("Warranty Claim");
            assertThat(savedHistory.getVehicle()).isEqualTo(claim.getVehicle());
        }

        @Test
        @DisplayName("Should throw exception if claim status is not PROCESSING")
        void techCompleteClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.techCompleteClaim(1L, ""));
            assertThat(exception.getMessage()).contains("Claim must be in PROCESSING status");
        }
    }

    @Nested
    @DisplayName("Get Claim By ID")
    class GetClaimById {

        @Test
        @DisplayName("Should return claim when found")
        void getClaimById_Found_ReturnsClaim() {
            // Arrange
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act
            var result = warrantyClaimService.getClaimById(1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getWarrantyClaimId()).isEqualTo(1L);
            verify(warrantyClaimRepository).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when claim not found")
        void getClaimById_NotFound_ThrowsException() {
            // Arrange
            when(warrantyClaimRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.getClaimById(999L));
            verify(warrantyClaimRepository).findById(999L);
        }
    }

    @Nested
    @DisplayName("Delete Claim")
    class DeleteClaim {

        @Test
        @DisplayName("Should delete claim successfully when exists")
        void deleteClaim_Exists_ReturnsTrue() {
            // Arrange
            when(warrantyClaimRepository.existsById(1L)).thenReturn(true);
            doNothing().when(warrantyClaimRepository).deleteById(1L);

            // Act
            boolean result = warrantyClaimService.deleteClaim(1L);

            // Assert
            assertThat(result).isTrue();
            verify(warrantyClaimRepository).existsById(1L);
            verify(warrantyClaimRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Should return false when claim does not exist")
        void deleteClaim_NotExists_ReturnsFalse() {
            // Arrange
            when(warrantyClaimRepository.existsById(999L)).thenReturn(false);

            // Act
            boolean result = warrantyClaimService.deleteClaim(999L);

            // Assert
            assertThat(result).isFalse();
            verify(warrantyClaimRepository).existsById(999L);
            verify(warrantyClaimRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Create Claim - Error Branches")
    class CreateClaimErrors {

        @Test
        @DisplayName("Should throw exception when vehicle not found")
        void createClaim_VehicleNotFound_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(999L);
            requestDTO.setInstalledPartId(1L);
            when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaim(requestDTO));
            verify(vehicleRepository).findById(999L);
        }

        @Test
        @DisplayName("Should throw exception when installed part not found")
        void createClaim_InstalledPartNotFound_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(999L);
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaim(requestDTO));
            assertThat(exception.getMessage()).contains("Installed part").contains("not found");
        }

        @Test
        @DisplayName("Should throw exception when installed part not belong to vehicle")
        void createClaim_InstalledPartNotBelongToVehicle_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Vehicle otherVehicle = new Vehicle();
            otherVehicle.setVehicleId(2L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(otherVehicle);

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaim(requestDTO));
            assertThat(exception.getMessage()).contains("is not installed on vehicle");
        }

        @Test
        @DisplayName("Should throw exception when warranty expired")
        void createClaim_WarrantyExpired_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);
            installedPart.setWarrantyExpirationDate(java.time.LocalDate.now().minusDays(1)); // Expired

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaim(requestDTO));
            assertThat(exception.getMessage()).contains("Warranty").contains("expired");
        }
    }

    @Nested
    @DisplayName("Update Claim - Error Branches")
    class UpdateClaimErrors {

        @Test
        @DisplayName("Should throw exception when updating with different installed part not belonging to vehicle")
        void updateClaim_DifferentInstalledPartNotBelongToVehicle_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(2L); // Different part

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart currentPart = new InstalledPart();
            currentPart.setInstalledPartId(1L);
            currentPart.setVehicle(vehicle);

            Vehicle otherVehicle = new Vehicle();
            otherVehicle.setVehicleId(2L);

            InstalledPart newPart = new InstalledPart();
            newPart.setInstalledPartId(2L);
            newPart.setVehicle(otherVehicle); // Belongs to different vehicle

            WarrantyClaim claim = new WarrantyClaim();
            claim.setWarrantyClaimId(1L);
            claim.setInstalledPart(currentPart);
            claim.setVehicle(vehicle);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(installedPartRepository.findById(2L)).thenReturn(Optional.of(newPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.updateClaim(1L, requestDTO));
            assertThat(exception.getMessage()).contains("is not installed on vehicle");
        }

        @Test
        @DisplayName("Should throw exception when updating with expired warranty part")
        void updateClaim_ExpiredWarrantyPart_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(2L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart currentPart = new InstalledPart();
            currentPart.setInstalledPartId(1L);
            currentPart.setVehicle(vehicle);

            InstalledPart newPart = new InstalledPart();
            newPart.setInstalledPartId(2L);
            newPart.setVehicle(vehicle);
            newPart.setWarrantyExpirationDate(java.time.LocalDate.now().minusDays(1)); // Expired

            WarrantyClaim claim = new WarrantyClaim();
            claim.setWarrantyClaimId(1L);
            claim.setInstalledPart(currentPart);
            claim.setVehicle(vehicle);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(installedPartRepository.findById(2L)).thenReturn(Optional.of(newPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.updateClaim(1L, requestDTO));
            assertThat(exception.getMessage()).contains("Warranty").contains("expired");
        }
    }

    @Nested
    @DisplayName("Update Claim Status - Status Transition Validation")
    class UpdateClaimStatusValidation {

        @Test
        @DisplayName("Should allow SUBMITTED -> MANAGER_REVIEW transition")
        void updateStatus_SubmittedToManagerReview_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            requestDTO.setUpdatedBy("admin");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
        }

        @Test
        @DisplayName("Should allow SUBMITTED -> REJECTED transition")
        void updateStatus_SubmittedToRejected_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.REJECTED);
            requestDTO.setUpdatedBy("admin");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.REJECTED);
        }

        @Test
        @DisplayName("Should throw exception for invalid SUBMITTED -> PROCESSING transition")
        void updateStatus_SubmittedToProcessing_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);
            requestDTO.setUpdatedBy("admin");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> warrantyClaimService.updateClaimStatus(1L, requestDTO));
            assertThat(exception.getMessage()).contains("Invalid status transition");
        }

        @Test
        @DisplayName("Should allow MANAGER_REVIEW -> PROCESSING transition")
        void updateStatus_ManagerReviewToProcessing_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);
            requestDTO.setUpdatedBy("tech");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
        }

        @Test
        @DisplayName("Should allow PROCESSING -> COMPLETED transition and set resolution date")
        void updateStatus_ProcessingToCompleted_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.COMPLETED);
            requestDTO.setUpdatedBy("tech");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
            assertThat(claim.getResolutionDate()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception for invalid COMPLETED -> PROCESSING transition")
        void updateStatus_CompletedToProcessing_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.COMPLETED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);
            requestDTO.setUpdatedBy("admin");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> warrantyClaimService.updateClaimStatus(1L, requestDTO));
            assertThat(exception.getMessage()).contains("Invalid status transition");
        }
    }

    @Nested
    @DisplayName("Admin Accept Claim")
    class AdminAcceptClaim {

        @Test
        @DisplayName("Should change status to MANAGER_REVIEW when accepting")
        void adminAcceptClaim_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, "Approved for review");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
            verify(warrantyClaimRepository).save(claim);
        }

        @Test
        @DisplayName("Should throw exception if claim is not in SUBMITTED status")
        void adminAcceptClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.adminAcceptClaim(1L, "Note"));
            assertThat(exception.getMessage()).contains("Claim must be in SUBMITTED status");
        }
    }

    @Nested
    @DisplayName("Get All Claims Page")
    class GetAllClaimsPage {

        @Test
        @DisplayName("Should get all claims with pagination")
        void getAllClaimsPage_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> page = new PageImpl<>(claims, pageable, 1);

            when(warrantyClaimRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getAllClaimsPage(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(warrantyClaimRepository).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Create Claim")
    class CreateClaim {


        @Test
        @DisplayName("Should create claim successfully")
        void createClaim_Success() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setInstalledPartId(1L);
            requestDTO.setVehicleId(1L);
            requestDTO.setDescription("Defective part");

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);
            installedPart.setWarrantyExpirationDate(java.time.LocalDate.now().plusYears(1)); // Add warranty expiration date

            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));
            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.createClaim(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(warrantyClaimRepository).save(any(WarrantyClaim.class));
        }
    }

    @Nested
    @DisplayName("Update Claim")
    class UpdateClaim {

        @Test
        @DisplayName("Should update claim successfully")
        void updateClaim_Success() {
            // Arrange
            // Set installedPartId to avoid NullPointerException
            claim.getInstalledPart().setInstalledPartId(1L);

            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setInstalledPartId(1L);
            requestDTO.setDescription("Updated description");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.updateClaim(1L, requestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(warrantyClaimRepository).save(any(WarrantyClaim.class));
        }

        @Test
        @DisplayName("Should throw exception when claim not found")
        void updateClaim_NotFound_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            when(warrantyClaimRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.updateClaim(999L, requestDTO));
        }
    }

    @Nested
    @DisplayName("Update Claim Status")
    class UpdateClaimStatus {

        @Test
        @DisplayName("Should update claim status successfully")
        void updateClaimStatus_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW); // Set initial status to allow transition
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);
            requestDTO.setComments("Starting work");
            requestDTO.setUpdatedBy("admin");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(warrantyClaimRepository).save(any(WarrantyClaim.class));
        }
    }

    @Nested
    @DisplayName("Get Claims By Status")
    class GetClaimsByStatus {

        @Test
        @DisplayName("Should get claims by status with pagination")
        void getClaimsByStatus_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> page = new PageImpl<>(claims, pageable, 1);

            when(warrantyClaimRepository.findByStatus(WarrantyClaimStatus.PROCESSING, pageable)).thenReturn(page);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getClaimsByStatus("PROCESSING", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(warrantyClaimRepository).findByStatus(WarrantyClaimStatus.PROCESSING, pageable);
        }
    }

    @Nested
    @DisplayName("Get Tech Pending Claims")
    class GetTechPendingClaims {

        @Test
        @DisplayName("Should get claims pending for technician")
        void getTechPendingClaims_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> page = new PageImpl<>(claims, pageable, 1);

            when(warrantyClaimRepository.findByStatusIn(any(), any(Pageable.class))).thenReturn(page);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getTechPendingClaims(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(warrantyClaimRepository).findByStatusIn(any(), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Assign Claim To Me")
    class AssignClaimToMe {

        @Test
        @DisplayName("Should assign claim to user successfully")
        void assignClaimToMe_Success() {
            // Arrange
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(userRepository.findById(1L)).thenReturn(Optional.of(technician));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.assignClaimToMe(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            verify(warrantyClaimRepository).save(any(WarrantyClaim.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void assignClaimToMe_UserNotFound_ThrowsException() {
            // Arrange
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.assignClaimToMe(1L, 999L));
        }
    }

    @Nested
    @DisplayName("Get My Assigned Claims")
    class GetMyAssignedClaims {

        @Test
        @DisplayName("Should get assigned claims for user")
        void getMyAssignedClaims_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            claim.setAssignedTo(technician);
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> page = new PageImpl<>(claims, pageable, 1);

            when(warrantyClaimRepository.findByAssignedToUserId(1L, pageable)).thenReturn(page);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getMyAssignedClaims(1L, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(warrantyClaimRepository).findByAssignedToUserId(1L, pageable);
        }
    }

    @Nested
    @DisplayName("Get My Warranty Claims")
    class GetMyWarrantyClaims {

        @Test
        @DisplayName("Should get warranty claims for current customer")
        void getMyWarrantyClaims_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Customer customer = new Customer();
            customer.setUser(technician);
            customer.setCustomerId(java.util.UUID.randomUUID());
            technician.setCustomer(customer);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> page = new PageImpl<>(claims, pageable, 1);
            when(warrantyClaimRepository.findByVehicleCustomerCustomerId(customer.getCustomerId(), pageable)).thenReturn(page);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getMyWarrantyClaims(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(warrantyClaimRepository).findByVehicleCustomerCustomerId(customer.getCustomerId(), pageable);
        }
    }

    @Nested
    @DisplayName("Get My Warranty Claim By ID")
    class GetMyWarrantyClaimById {

        @Test
        @DisplayName("Should get warranty claim by ID for current customer")
        void getMyWarrantyClaimById_Success() {
            // Arrange
            Customer customer = new Customer();
            java.util.UUID customerId = java.util.UUID.randomUUID();
            customer.setCustomerId(customerId);
            customer.setUser(technician);
            technician.setCustomer(customer);

            // Set the SAME customer to the claim's vehicle
            claim.getVehicle().setCustomer(customer);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            // Mock the correct repository method used in implementation
            when(warrantyClaimRepository.findByWarrantyClaimIdAndVehicleCustomerCustomerId(1L, customerId))
                .thenReturn(Optional.of(claim));

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.getMyWarrantyClaimById(1L);

            // Assert
            assertThat(result).isNotNull();
            verify(warrantyClaimRepository).findByWarrantyClaimIdAndVehicleCustomerCustomerId(1L, customerId);
        }

        @Test
        @DisplayName("Should throw exception when claim does not belong to customer")
        void getMyWarrantyClaimById_NotOwnedByCurrent_ThrowsException() {
            // Arrange
            Customer customer = new Customer();
            java.util.UUID customerId = java.util.UUID.randomUUID();
            customer.setCustomerId(customerId);
            customer.setUser(technician);
            technician.setCustomer(customer);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            // Mock repository to return empty when claim doesn't belong to customer
            when(warrantyClaimRepository.findByWarrantyClaimIdAndVehicleCustomerCustomerId(1L, customerId))
                .thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.getMyWarrantyClaimById(1L));
            verify(warrantyClaimRepository).findByWarrantyClaimIdAndVehicleCustomerCustomerId(1L, customerId);
        }
    }

    @Nested
    @DisplayName("Create Claim By SC Staff")
    class CreateClaimBySCStaff {


        @Test
        @DisplayName("Should create claim by SC staff successfully")
        void createClaimBySCStaff_Success() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setInstalledPartId(1L);
            requestDTO.setVehicleId(1L);
            requestDTO.setDescription("Defective part");

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Part part = new Part();
            part.setPartId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);
            installedPart.setPart(part);
            installedPart.setWarrantyExpirationDate(java.time.LocalDate.now().plusYears(1));

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> {
                WarrantyClaim savedClaim = inv.getArgument(0);
                savedClaim.setWarrantyClaimId(1L);
                return savedClaim;
            });

            // Act
            WarrantyClaimResponseDTO result = warrantyClaimService.createClaimBySCStaff(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            ArgumentCaptor<WarrantyClaim> claimCaptor = ArgumentCaptor.forClass(WarrantyClaim.class);
            verify(warrantyClaimRepository).save(claimCaptor.capture());
            WarrantyClaim savedClaim = claimCaptor.getValue();

            // Verify that the claim was created with SUBMITTED status (SC Staff creates with SUBMITTED)
            assertThat(savedClaim.getStatus()).isEqualTo(WarrantyClaimStatus.SUBMITTED);
        }

        @Test
        @DisplayName("Should throw exception when claim status is not SUBMITTED")
        void adminAcceptClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.adminAcceptClaim(1L, "note"));
            assertThat(exception.getMessage()).contains("Claim must be in SUBMITTED status");
        }

        @Test
        @DisplayName("Should accept claim without note")
        void adminAcceptClaim_WithoutNote_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, null);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
        }

        @Test
        @DisplayName("Should accept claim with empty note")
        void adminAcceptClaim_WithEmptyNote_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, "   ");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
        }
    }

    @Nested
    @DisplayName("Admin Reject Claim")
    class AdminRejectClaim {

        @Test
        @DisplayName("Should change status to REJECTED with reason")
        void adminRejectClaim_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminRejectClaim(1L, "Not covered by warranty");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.REJECTED);
            assertThat(claim.getResolutionDate()).isNotNull();
            assertThat(claim.getDescription()).contains("Admin Rejection");
            assertThat(claim.getDescription()).contains("Not covered by warranty");
        }

        @Test
        @DisplayName("Should throw exception when claim status is not SUBMITTED")
        void adminRejectClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.adminRejectClaim(1L, "reason"));
            assertThat(exception.getMessage()).contains("Claim must be in SUBMITTED status to reject");
        }
    }

    @Nested
    @DisplayName("Create Claim By SC Staff - Error Branches")
    class CreateClaimBySCStaffErrors {

        @Test
        @DisplayName("Should throw exception when vehicle not found")
        void createClaimBySCStaff_VehicleNotFound_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(999L);
            requestDTO.setInstalledPartId(1L);
            when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
        }

        @Test
        @DisplayName("Should throw exception when installed part not found")
        void createClaimBySCStaff_InstalledPartNotFound_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(999L);
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
            assertThat(exception.getMessage()).contains("Installed part").contains("not found");
        }

        @Test
        @DisplayName("Should throw exception when installed part not belong to vehicle")
        void createClaimBySCStaff_InstalledPartNotBelongToVehicle_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Vehicle otherVehicle = new Vehicle();
            otherVehicle.setVehicleId(2L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(otherVehicle);

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
            assertThat(exception.getMessage()).contains("is not installed on vehicle");
        }

        @Test
        @DisplayName("Should throw exception when warranty expired")
        void createClaimBySCStaff_WarrantyExpired_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);
            installedPart.setWarrantyExpirationDate(java.time.LocalDate.now().minusDays(1)); // Expired

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
            assertThat(exception.getMessage()).contains("Warranty").contains("expired");
        }
    }
}
