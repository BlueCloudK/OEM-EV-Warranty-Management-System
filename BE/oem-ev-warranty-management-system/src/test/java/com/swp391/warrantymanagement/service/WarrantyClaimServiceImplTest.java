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
import java.util.UUID;

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

        @Test
        @DisplayName("Should start processing when user not found in work log creation")
        void techStartProcessing_UserNotFound_StillProcesses() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.empty()); // User not found

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting work");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
            verify(workLogRepository, never()).save(any(WorkLog.class)); // Work log not created
        }

        @Test
        @DisplayName("Should start processing when authentication is null")
        void techStartProcessing_AuthenticationNull_StillProcesses() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(null);
            SecurityContextHolder.setContext(securityContext);

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting work");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
            verify(workLogRepository, never()).save(any(WorkLog.class));
        }

        @Test
        @DisplayName("Should start processing when authentication is not authenticated")
        void techStartProcessing_NotAuthenticated_StillProcesses() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(false);

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting work");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
            verify(workLogRepository, never()).save(any(WorkLog.class));
        }

        @Test
        @DisplayName("Should start processing when exception occurs in work log creation")
        void techStartProcessing_ExceptionInWorkLog_StillProcesses() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenThrow(new RuntimeException("Database error"));

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting work");

            // Assert - Should still process despite exception
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
        }

        @Test
        @DisplayName("Should create work log with default description when note is empty")
        void techStartProcessing_EmptyNote_UsesDefaultDescription() {
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
            warrantyClaimService.techStartProcessing(1L, "");

            // Assert
            ArgumentCaptor<WorkLog> workLogCaptor = ArgumentCaptor.forClass(WorkLog.class);
            verify(workLogRepository).save(workLogCaptor.capture());
            WorkLog savedWorkLog = workLogCaptor.getValue();

            assertThat(savedWorkLog.getDescription()).isEqualTo("Technician started processing claim");
        }

        @Test
        @DisplayName("Should update description and create work log with note when note is provided")
        void techStartProcessing_WithNote_UpdatesDescriptionAndWorkLog() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.techStartProcessing(1L, "Starting repair work");

            // Assert
            assertThat(claim.getDescription()).contains("[Tech Start]: Starting repair work");
            ArgumentCaptor<WorkLog> workLogCaptor = ArgumentCaptor.forClass(WorkLog.class);
            verify(workLogRepository).save(workLogCaptor.capture());
            assertThat(workLogCaptor.getValue().getDescription()).isEqualTo("Starting repair work");
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

        @Test
        @DisplayName("Should complete claim when user not found in work log update")
        void techCompleteClaim_UserNotFound_StillCompletes() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.empty()); // User not found

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should complete claim when no work logs found")
        void techCompleteClaim_NoWorkLogs_StillCompletes() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            claim.setWorkLogs(List.of()); // Empty work logs
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should complete claim when no active work log found for current user")
        void techCompleteClaim_NoActiveWorkLog_StillCompletes() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);

            // Create a work log that already has end time (not active)
            WorkLog completedWorkLog = new WorkLog();
            completedWorkLog.setUser(technician);
            completedWorkLog.setStartTime(java.time.LocalDateTime.now().minusHours(2));
            completedWorkLog.setEndTime(java.time.LocalDateTime.now().minusHours(1));
            claim.setWorkLogs(List.of(completedWorkLog));

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should complete claim when active work log belongs to different user")
        void techCompleteClaim_WorkLogDifferentUser_StillCompletes() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);

            User otherUser = new User();
            otherUser.setUserId(2L);
            otherUser.setUsername("othertech");

            WorkLog otherUserWorkLog = new WorkLog();
            otherUserWorkLog.setUser(otherUser);
            otherUserWorkLog.setStartTime(java.time.LocalDateTime.now().minusHours(1));
            otherUserWorkLog.setEndTime(null); // Active but different user
            claim.setWorkLogs(List.of(otherUserWorkLog));

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should complete claim when exception occurs in work log update")
        void techCompleteClaim_ExceptionInWorkLog_StillCompletes() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenThrow(new RuntimeException("Database error"));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "Work finished");

            // Assert - Should still complete despite exception
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should update active work log when found for current user")
        void techCompleteClaim_ActiveWorkLogFound_UpdatesWorkLog() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);

            WorkLog activeWorkLog = new WorkLog();
            activeWorkLog.setUser(technician);
            activeWorkLog.setStartTime(java.time.LocalDateTime.now().minusHours(1));
            activeWorkLog.setEndTime(null); // Active work log
            activeWorkLog.setDescription("Started work");
            claim.setWorkLogs(new java.util.ArrayList<>(List.of(activeWorkLog)));

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenAnswer(inv -> inv.getArgument(0));
            when(workLogRepository.save(any(WorkLog.class))).thenAnswer(inv -> inv.getArgument(0));

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getName()).thenReturn("tech");
            when(userRepository.findByUsername("tech")).thenReturn(Optional.of(technician));

            // Act
            warrantyClaimService.techCompleteClaim(1L, "All done");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
            assertThat(activeWorkLog.getEndTime()).isNotNull();
            assertThat(activeWorkLog.getDescription()).contains("[Completion]: All done");
            verify(workLogRepository).save(activeWorkLog);
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
        @DisplayName("Should return false when claim doesn't exist")
        void deleteClaim_NotExists_ReturnsFalse() {
            // Arrange
            when(warrantyClaimRepository.existsById(999L)).thenReturn(false);

            // Act
            boolean result = warrantyClaimService.deleteClaim(999L);

            // Assert
            assertThat(result).isFalse();
            verify(warrantyClaimRepository).existsById(999L);
            verify(warrantyClaimRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("Create Claim - Validation Branches")
    class CreateClaimValidation {

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
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaim(requestDTO));
            assertThat(exception.getMessage()).contains("Installed part 999 not found");
        }

        @Test
        @DisplayName("Should throw exception when installed part not on vehicle")
        void createClaim_InstalledPartMismatch_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Vehicle differentVehicle = new Vehicle();
            differentVehicle.setVehicleId(2L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(differentVehicle);

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaim(requestDTO));
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
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaim(requestDTO));
            assertThat(exception.getMessage()).contains("Warranty for this installed part has expired");
        }
    }

    @Nested
    @DisplayName("Update Claim - Validation Branches")
    class UpdateClaimValidation {

        @Test
        @DisplayName("Should update claim when installed part does not change")
        void updateClaim_SameInstalledPart_Success() {
            // Arrange
            Long claimId = 1L;
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L); // Same installed part
            requestDTO.setDescription("Updated description only");

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);

            WarrantyClaim existingClaim = new WarrantyClaim();
            existingClaim.setWarrantyClaimId(claimId);
            existingClaim.setInstalledPart(installedPart);
            existingClaim.setDescription("Old description");

            when(warrantyClaimRepository.findById(claimId)).thenReturn(Optional.of(existingClaim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.updateClaim(claimId, requestDTO);

            // Assert
            assertThat(existingClaim.getDescription()).isEqualTo("Updated description only");
            verify(installedPartRepository, never()).findById(anyLong()); // Should not fetch new part
            verify(warrantyClaimRepository).save(existingClaim);
        }

        @Test
        @DisplayName("Should update claim when installed part changes")
        void updateClaim_ChangeInstalledPart_Success() {
            // Arrange
            Long claimId = 1L;
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(2L); // Different installed part
            requestDTO.setDescription("Updated description");

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart oldPart = new InstalledPart();
            oldPart.setInstalledPartId(1L);
            oldPart.setVehicle(vehicle);

            InstalledPart newPart = new InstalledPart();
            newPart.setInstalledPartId(2L);
            newPart.setVehicle(vehicle);
            newPart.setWarrantyExpirationDate(java.time.LocalDate.now().plusYears(1));

            WarrantyClaim existingClaim = new WarrantyClaim();
            existingClaim.setWarrantyClaimId(claimId);
            existingClaim.setInstalledPart(oldPart);

            when(warrantyClaimRepository.findById(claimId)).thenReturn(Optional.of(existingClaim));
            when(installedPartRepository.findById(2L)).thenReturn(Optional.of(newPart));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.updateClaim(claimId, requestDTO);

            // Assert
            verify(installedPartRepository).findById(2L);
            verify(warrantyClaimRepository).save(any(WarrantyClaim.class));
        }

        @Test
        @DisplayName("Should throw exception when new installed part not on vehicle")
        void updateClaim_NewPartMismatch_ThrowsException() {
            // Arrange
            Long claimId = 1L;
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(2L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Vehicle differentVehicle = new Vehicle();
            differentVehicle.setVehicleId(2L);

            InstalledPart oldPart = new InstalledPart();
            oldPart.setInstalledPartId(1L);

            InstalledPart newPart = new InstalledPart();
            newPart.setInstalledPartId(2L);
            newPart.setVehicle(differentVehicle); // Different vehicle

            WarrantyClaim existingClaim = new WarrantyClaim();
            existingClaim.setWarrantyClaimId(claimId);
            existingClaim.setInstalledPart(oldPart);

            when(warrantyClaimRepository.findById(claimId)).thenReturn(Optional.of(existingClaim));
            when(installedPartRepository.findById(2L)).thenReturn(Optional.of(newPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.updateClaim(claimId, requestDTO));
            assertThat(exception.getMessage()).contains("is not installed on vehicle");
        }

        @Test
        @DisplayName("Should throw exception when new installed part warranty expired")
        void updateClaim_NewPartExpired_ThrowsException() {
            // Arrange
            Long claimId = 1L;
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(2L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart oldPart = new InstalledPart();
            oldPart.setInstalledPartId(1L);

            InstalledPart newPart = new InstalledPart();
            newPart.setInstalledPartId(2L);
            newPart.setVehicle(vehicle);
            newPart.setWarrantyExpirationDate(java.time.LocalDate.now().minusDays(1)); // Expired

            WarrantyClaim existingClaim = new WarrantyClaim();
            existingClaim.setWarrantyClaimId(claimId);
            existingClaim.setInstalledPart(oldPart);

            when(warrantyClaimRepository.findById(claimId)).thenReturn(Optional.of(existingClaim));
            when(installedPartRepository.findById(2L)).thenReturn(Optional.of(newPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.updateClaim(claimId, requestDTO));
            assertThat(exception.getMessage()).contains("Warranty for this installed part has expired");
        }
    }

    @Nested
    @DisplayName("Admin Accept/Reject Claim - Note Branches")
    class AdminAcceptRejectClaim {

        @Test
        @DisplayName("Should accept claim with note")
        void adminAcceptClaim_WithNote_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, "Approved by admin");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
            assertThat(claim.getDescription()).contains("[Admin Note]: Approved by admin");
        }

        @Test
        @DisplayName("Should accept claim without note")
        void adminAcceptClaim_WithoutNote_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, null);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
            assertThat(claim.getDescription()).isEqualTo("Original description");
        }

        @Test
        @DisplayName("Should accept claim with empty note")
        void adminAcceptClaim_WithEmptyNote_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminAcceptClaim(1L, "  ");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
            assertThat(claim.getDescription()).isEqualTo("Original description");
        }

        @Test
        @DisplayName("Should throw exception when accepting non-SUBMITTED claim")
        void adminAcceptClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.adminAcceptClaim(1L, "note"));
            assertThat(exception.getMessage()).contains("Claim must be in SUBMITTED status");
        }

        @Test
        @DisplayName("Should reject claim with reason")
        void adminRejectClaim_WithReason_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            claim.setDescription("Original description");
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            warrantyClaimService.adminRejectClaim(1L, "Not covered by warranty");

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.REJECTED);
            assertThat(claim.getDescription()).contains("[Admin Rejection]: Not covered by warranty");
            assertThat(claim.getResolutionDate()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when rejecting non-SUBMITTED claim")
        void adminRejectClaim_InvalidStatus_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.adminRejectClaim(1L, "reason"));
            assertThat(exception.getMessage()).contains("Claim must be in SUBMITTED status");
        }
    }

    @Nested
    @DisplayName("SC Staff Creates Claim")
    class CreateClaimBySCStaff {

        @Test
        @DisplayName("Should create claim with SUBMITTED status")
        void createClaimBySCStaff_Success() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);
            requestDTO.setDescription("Part malfunction");

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(vehicle);
            installedPart.setWarrantyExpirationDate(java.time.LocalDate.now().plusYears(1));
            installedPart.setPart(new Part());

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> {
                WarrantyClaim claim = inv.getArgument(0);
                claim.setWarrantyClaimId(1L);
                return claim;
            });

            // Act
            var result = warrantyClaimService.createClaimBySCStaff(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            ArgumentCaptor<WarrantyClaim> claimCaptor = ArgumentCaptor.forClass(WarrantyClaim.class);
            verify(warrantyClaimRepository).save(claimCaptor.capture());
            assertThat(claimCaptor.getValue().getStatus()).isEqualTo(WarrantyClaimStatus.SUBMITTED);
        }

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
        @DisplayName("Should throw exception when installed part not on vehicle")
        void createClaimBySCStaff_PartMismatch_ThrowsException() {
            // Arrange
            WarrantyClaimRequestDTO requestDTO = new WarrantyClaimRequestDTO();
            requestDTO.setVehicleId(1L);
            requestDTO.setInstalledPartId(1L);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            Vehicle differentVehicle = new Vehicle();
            differentVehicle.setVehicleId(2L);

            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setVehicle(differentVehicle); // Different vehicle

            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.findById(1L)).thenReturn(Optional.of(installedPart));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
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
            RuntimeException exception = assertThrows(RuntimeException.class, () -> warrantyClaimService.createClaimBySCStaff(requestDTO));
            assertThat(exception.getMessage()).contains("Warranty for this installed part has expired");
        }
    }

    @Nested
    @DisplayName("Get Claims By Status")
    class GetClaimsByStatus {

        @Test
        @DisplayName("Should return claims with specific status")
        void getClaimsByStatus_Success() {
            // Arrange
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> claimPage = new PageImpl<>(claims);
            Pageable pageable = PageRequest.of(0, 10);

            when(warrantyClaimRepository.findByStatus(WarrantyClaimStatus.SUBMITTED, pageable)).thenReturn(claimPage);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getClaimsByStatus("SUBMITTED", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(warrantyClaimRepository).findByStatus(WarrantyClaimStatus.SUBMITTED, pageable);
        }

        @Test
        @DisplayName("Should throw exception for invalid status")
        void getClaimsByStatus_InvalidStatus_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> warrantyClaimService.getClaimsByStatus("INVALID_STATUS", pageable));
            assertThat(exception.getMessage()).contains("Invalid status");
        }
    }

    @Nested
    @DisplayName("Get Tech Pending Claims")
    class GetTechPendingClaims {

        @Test
        @DisplayName("Should return claims in MANAGER_REVIEW or PROCESSING status")
        void getTechPendingClaims_Success() {
            // Arrange
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> claimPage = new PageImpl<>(claims);
            Pageable pageable = PageRequest.of(0, 10);

            when(warrantyClaimRepository.findByStatusIn(
                List.of(WarrantyClaimStatus.MANAGER_REVIEW, WarrantyClaimStatus.PROCESSING),
                pageable
            )).thenReturn(claimPage);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getTechPendingClaims(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Assign Claim")
    class AssignClaim {

        @Test
        @DisplayName("Should assign claim to user")
        void assignClaimToMe_Success() {
            // Arrange
            User assignee = new User();
            assignee.setUserId(2L);
            assignee.setUsername("tech2");

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.assignClaimToMe(1L, 2L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(claim.getAssignedTo()).isEqualTo(assignee);
        }

        @Test
        @DisplayName("Should throw exception when claim not found")
        void assignClaimToMe_ClaimNotFound_ThrowsException() {
            // Arrange
            when(warrantyClaimRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.assignClaimToMe(999L, 2L));
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
        @DisplayName("Should return claims assigned to user")
        void getMyAssignedClaims_Success() {
            // Arrange
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> claimPage = new PageImpl<>(claims);
            Pageable pageable = PageRequest.of(0, 10);

            when(warrantyClaimRepository.findByAssignedToUserId(1L, pageable)).thenReturn(claimPage);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getMyAssignedClaims(1L, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get All Claims Page")
    class GetAllClaimsPage {

        @Test
        @DisplayName("Should return paginated claims")
        void getAllClaimsPage_Success() {
            // Arrange
            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> claimPage = new PageImpl<>(claims);
            Pageable pageable = PageRequest.of(0, 10);

            when(warrantyClaimRepository.findAll(pageable)).thenReturn(claimPage);

            // Act
            PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getAllClaimsPage(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Update Claim Status")
    class UpdateClaimStatus {

        @Test
        @DisplayName("Should update status with valid transition")
        void updateClaimStatus_ValidTransition_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.MANAGER_REVIEW);
        }

        @Test
        @DisplayName("Should set resolution date when completing")
        void updateClaimStatus_ToCompleted_SetsResolutionDate() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.COMPLETED);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
            assertThat(claim.getResolutionDate()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception for invalid transition")
        void updateClaimStatus_InvalidTransition_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.COMPLETED); // Invalid: SUBMITTED -> COMPLETED

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            assertThrows(IllegalStateException.class, () -> warrantyClaimService.updateClaimStatus(1L, requestDTO));
        }

        @Test
        @DisplayName("Should allow SUBMITTED to REJECTED transition")
        void updateClaimStatus_SubmittedToRejected_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.SUBMITTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.REJECTED);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.REJECTED);
        }

        @Test
        @DisplayName("Should allow MANAGER_REVIEW to PROCESSING transition")
        void updateClaimStatus_ManagerReviewToProcessing_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.PROCESSING);
        }

        @Test
        @DisplayName("Should allow PROCESSING to COMPLETED transition")
        void updateClaimStatus_ProcessingToCompleted_Success() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.PROCESSING);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.COMPLETED);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
            when(warrantyClaimRepository.save(any(WarrantyClaim.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            var result = warrantyClaimService.updateClaimStatus(1L, requestDTO);

            // Assert
            assertThat(claim.getStatus()).isEqualTo(WarrantyClaimStatus.COMPLETED);
            assertThat(claim.getResolutionDate()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when claim not found")
        void updateClaimStatus_ClaimNotFound_ThrowsException() {
            // Arrange
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.COMPLETED);
            when(warrantyClaimRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> warrantyClaimService.updateClaimStatus(999L, requestDTO));
        }

        @Test
        @DisplayName("Should throw exception for invalid transition from COMPLETED")
        void updateClaimStatus_FromCompleted_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.COMPLETED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            assertThrows(IllegalStateException.class, () -> warrantyClaimService.updateClaimStatus(1L, requestDTO));
        }

        @Test
        @DisplayName("Should throw exception for invalid transition from REJECTED")
        void updateClaimStatus_FromRejected_ThrowsException() {
            // Arrange
            claim.setStatus(WarrantyClaimStatus.REJECTED);
            WarrantyClaimStatusUpdateRequestDTO requestDTO = new WarrantyClaimStatusUpdateRequestDTO();
            requestDTO.setStatus(WarrantyClaimStatus.PROCESSING);

            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(claim));

            // Act & Assert
            assertThrows(IllegalStateException.class, () -> warrantyClaimService.updateClaimStatus(1L, requestDTO));
        }
    }

    @Nested
    @DisplayName("Customer Get My Warranty Claims")
    class CustomerGetMyWarrantyClaims {

        @Test
        @DisplayName("Should return customer's claims when authenticated")
        void getMyWarrantyClaims_Success() {
            // Arrange
            Customer customer = new Customer();
            UUID customerId = UUID.randomUUID();
            customer.setCustomerId(customerId);

            User user = new User();
            user.setUserId(1L);
            user.setUsername("customer1");
            user.setCustomer(customer);

            List<WarrantyClaim> claims = List.of(claim);
            Page<WarrantyClaim> claimPage = new PageImpl<>(claims);
            Pageable pageable = PageRequest.of(0, 10);

            // Mock SecurityUtil via SecurityContext
            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("customer1"));

                when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
                when(warrantyClaimRepository.findByVehicleCustomerCustomerId(customerId, pageable)).thenReturn(claimPage);

                // Act
                PagedResponse<WarrantyClaimResponseDTO> result = warrantyClaimService.getMyWarrantyClaims(pageable);

                // Assert
                assertThat(result).isNotNull();
                assertThat(result.getContent()).hasSize(1);
            }
        }

        @Test
        @DisplayName("Should throw exception when user not authenticated")
        void getMyWarrantyClaims_NotAuthenticated_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaims(pageable));
                assertThat(exception.getMessage()).contains("not authenticated");
            }
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getMyWarrantyClaims_UserNotFound_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("unknown"));

                when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaims(pageable));
                assertThat(exception.getMessage()).contains("User not found");
            }
        }

        @Test
        @DisplayName("Should throw exception when customer profile not found")
        void getMyWarrantyClaims_CustomerNotFound_ThrowsException() {
            // Arrange
            User user = new User();
            user.setUserId(1L);
            user.setUsername("customer1");
            user.setCustomer(null); // No customer profile

            Pageable pageable = PageRequest.of(0, 10);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("customer1"));

                when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaims(pageable));
                assertThat(exception.getMessage()).contains("Customer profile not found");
            }
        }
    }

    @Nested
    @DisplayName("Customer Get My Warranty Claim By ID")
    class CustomerGetMyWarrantyClaimById {

        @Test
        @DisplayName("Should return claim when it belongs to customer")
        void getMyWarrantyClaimById_Success() {
            // Arrange
            Customer customer = new Customer();
            UUID customerId = UUID.randomUUID();
            customer.setCustomerId(customerId);

            User user = new User();
            user.setUserId(1L);
            user.setUsername("customer1");
            user.setCustomer(customer);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("customer1"));

                when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
                when(warrantyClaimRepository.findByWarrantyClaimIdAndVehicleCustomerCustomerId(1L, customerId))
                    .thenReturn(Optional.of(claim));

                // Act
                var result = warrantyClaimService.getMyWarrantyClaimById(1L);

                // Assert
                assertThat(result).isNotNull();
                assertThat(result.getWarrantyClaimId()).isEqualTo(1L);
            }
        }

        @Test
        @DisplayName("Should throw exception when user not authenticated")
        void getMyWarrantyClaimById_NotAuthenticated_ThrowsException() {
            // Arrange
            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaimById(1L));
                assertThat(exception.getMessage()).contains("not authenticated");
            }
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getMyWarrantyClaimById_UserNotFound_ThrowsException() {
            // Arrange
            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("unknown"));

                when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaimById(1L));
                assertThat(exception.getMessage()).contains("User not found");
            }
        }

        @Test
        @DisplayName("Should throw exception when customer profile not found")
        void getMyWarrantyClaimById_CustomerNotFound_ThrowsException() {
            // Arrange
            User user = new User();
            user.setUserId(1L);
            user.setUsername("customer1");
            user.setCustomer(null);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("customer1"));

                when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaimById(1L));
                assertThat(exception.getMessage()).contains("Customer profile not found");
            }
        }

        @Test
        @DisplayName("Should throw exception when claim not found or doesn't belong to customer")
        void getMyWarrantyClaimById_ClaimNotFound_ThrowsException() {
            // Arrange
            Customer customer = new Customer();
            UUID customerId = UUID.randomUUID();
            customer.setCustomerId(customerId);

            User user = new User();
            user.setUserId(1L);
            user.setUsername("customer1");
            user.setCustomer(customer);

            try (var mockedStatic = mockStatic(com.swp391.warrantymanagement.util.SecurityUtil.class)) {
                mockedStatic.when(com.swp391.warrantymanagement.util.SecurityUtil::getCurrentUsername)
                    .thenReturn(Optional.of("customer1"));

                when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
                when(warrantyClaimRepository.findByWarrantyClaimIdAndVehicleCustomerCustomerId(999L, customerId))
                    .thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> warrantyClaimService.getMyWarrantyClaimById(999L));
                assertThat(exception.getMessage()).contains("not found or you don't have permission");
            }
        }
    }
}
