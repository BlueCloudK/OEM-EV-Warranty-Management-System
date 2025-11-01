package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.WorkLogRepository;
import com.swp391.warrantymanagement.service.impl.WorkLogServiceImpl;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WorkLogService Unit Tests")
class WorkLogServiceImplTest {

    @Mock
    private WorkLogRepository workLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WarrantyClaimRepository warrantyClaimRepository;

    @InjectMocks
    private WorkLogServiceImpl workLogService;

    private WorkLogRequestDTO requestDTO;
    private User user;
    private WarrantyClaim warrantyClaim;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);

        warrantyClaim = new WarrantyClaim();
        warrantyClaim.setWarrantyClaimId(1L);

        requestDTO = new WorkLogRequestDTO();
        requestDTO.setWarrantyClaimId(1L);
        requestDTO.setStartTime(LocalDateTime.of(2023, 1, 1, 9, 0));
        requestDTO.setEndTime(LocalDateTime.of(2023, 1, 1, 11, 0));
        requestDTO.setDescription("Replaced the battery.");
    }

    @Nested
    @DisplayName("Create WorkLog")
    class CreateWorkLog {

        @Test
        @DisplayName("Should create worklog successfully")
        void createWorkLog_Success() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(warrantyClaim));
            when(workLogRepository.save(any(WorkLog.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            WorkLogResponseDTO result = workLogService.createWorkLog(requestDTO, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getDescription()).isEqualTo("Replaced the battery.");
            assertThat(result.getUserId()).isEqualTo(1L);
            verify(workLogRepository).save(any(WorkLog.class));
        }

        @Test
        @DisplayName("Should throw exception if User not found")
        void createWorkLog_UserNotFound_ThrowsException() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> workLogService.createWorkLog(requestDTO, 1L));
            assertThat(exception.getMessage()).isEqualTo("User not found with id: 1");
        }

        @Test
        @DisplayName("Should throw exception if WarrantyClaim not found")
        void createWorkLog_ClaimNotFound_ThrowsException() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> workLogService.createWorkLog(requestDTO, 1L));
            assertThat(exception.getMessage()).isEqualTo("Warranty claim not found with id: 1");
        }

        @Test
        @DisplayName("Should throw exception if end time is before start time")
        void createWorkLog_InvalidTime_ThrowsException() {
            // Arrange
            requestDTO.setEndTime(LocalDateTime.of(2023, 1, 1, 8, 0)); // End time before start time
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(warrantyClaim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> workLogService.createWorkLog(requestDTO, 1L));
            assertThat(exception.getMessage()).isEqualTo("End time must be after start time");
        }
    }

    @Nested
    @DisplayName("Get WorkLog By ID")
    class GetWorkLogById {

        @Test
        @DisplayName("Should return worklog when found")
        void getWorkLogById_Found_ReturnsDTO() {
            // Arrange
            Long workLogId = 1L;
            WorkLog workLog = new WorkLog();
            workLog.setWorkLogId(workLogId);
            workLog.setDescription("Test work");
            workLog.setUser(user);
            workLog.setWarrantyClaim(warrantyClaim);

            when(workLogRepository.findById(workLogId)).thenReturn(Optional.of(workLog));

            // Act
            WorkLogResponseDTO result = workLogService.getWorkLogById(workLogId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getWorkLogId()).isEqualTo(workLogId);
            assertThat(result.getDescription()).isEqualTo("Test work");
            verify(workLogRepository).findById(workLogId);
        }

        @Test
        @DisplayName("Should return null when worklog not found")
        void getWorkLogById_NotFound_ReturnsNull() {
            // Arrange
            Long workLogId = 999L;
            when(workLogRepository.findById(workLogId)).thenReturn(Optional.empty());

            // Act
            WorkLogResponseDTO result = workLogService.getWorkLogById(workLogId);

            // Assert
            assertThat(result).isNull();
            verify(workLogRepository).findById(workLogId);
        }
    }

    @Nested
    @DisplayName("Update WorkLog")
    class UpdateWorkLog {

        @Test
        @DisplayName("Should update worklog successfully")
        void updateWorkLog_Success() {
            // Arrange
            Long workLogId = 1L;
            WorkLog existingWorkLog = new WorkLog();
            existingWorkLog.setWorkLogId(workLogId);
            existingWorkLog.setDescription("Old description");
            existingWorkLog.setUser(user);
            existingWorkLog.setWarrantyClaim(warrantyClaim);

            WorkLogRequestDTO updateDTO = new WorkLogRequestDTO();
            updateDTO.setWarrantyClaimId(1L);
            updateDTO.setStartTime(LocalDateTime.of(2023, 1, 2, 10, 0));
            updateDTO.setEndTime(LocalDateTime.of(2023, 1, 2, 12, 0));
            updateDTO.setDescription("Updated description");

            when(workLogRepository.findById(workLogId)).thenReturn(Optional.of(existingWorkLog));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(warrantyClaim));
            when(workLogRepository.save(any(WorkLog.class))).thenReturn(existingWorkLog);

            // Act
            WorkLogResponseDTO result = workLogService.updateWorkLog(workLogId, updateDTO, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getWorkLogId()).isEqualTo(workLogId);
            verify(workLogRepository).findById(workLogId);
            verify(workLogRepository).save(any(WorkLog.class));
        }

        @Test
        @DisplayName("Should return null when worklog not found")
        void updateWorkLog_NotFound_ReturnsNull() {
            // Arrange
            Long workLogId = 999L;
            WorkLogRequestDTO updateDTO = new WorkLogRequestDTO();
            updateDTO.setDescription("Updated description");

            when(workLogRepository.findById(workLogId)).thenReturn(Optional.empty());

            // Act
            WorkLogResponseDTO result = workLogService.updateWorkLog(workLogId, updateDTO, 1L);

            // Assert
            assertThat(result).isNull();
            verify(workLogRepository).findById(workLogId);
            verify(workLogRepository, never()).save(any(WorkLog.class));
        }

        @Test
        @DisplayName("Should throw exception if end time is before start time")
        void updateWorkLog_InvalidTime_ThrowsException() {
            // Arrange
            Long workLogId = 1L;
            WorkLog existingWorkLog = new WorkLog();
            existingWorkLog.setWorkLogId(workLogId);
            existingWorkLog.setUser(user);
            existingWorkLog.setWarrantyClaim(warrantyClaim);

            WorkLogRequestDTO updateDTO = new WorkLogRequestDTO();
            updateDTO.setWarrantyClaimId(1L);
            updateDTO.setStartTime(LocalDateTime.of(2023, 1, 2, 12, 0));
            updateDTO.setEndTime(LocalDateTime.of(2023, 1, 2, 10, 0)); // End before start

            when(workLogRepository.findById(workLogId)).thenReturn(Optional.of(existingWorkLog));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findById(1L)).thenReturn(Optional.of(warrantyClaim));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> workLogService.updateWorkLog(workLogId, updateDTO, 1L));
            assertThat(exception.getMessage()).isEqualTo("End time must be after start time");
        }
    }

    @Nested
    @DisplayName("Delete WorkLog")
    class DeleteWorkLog {

        @Test
        @DisplayName("Should return true when deleting existing worklog")
        void deleteWorkLog_Exists_ReturnsTrue() {
            // Arrange
            Long workLogId = 1L;
            when(workLogRepository.existsById(workLogId)).thenReturn(true);
            doNothing().when(workLogRepository).deleteById(workLogId);

            // Act
            boolean result = workLogService.deleteWorkLog(workLogId);

            // Assert
            assertThat(result).isTrue();
            verify(workLogRepository).existsById(workLogId);
            verify(workLogRepository).deleteById(workLogId);
        }

        @Test
        @DisplayName("Should return false when deleting non-existent worklog")
        void deleteWorkLog_NotExists_ReturnsFalse() {
            // Arrange
            Long workLogId = 999L;
            when(workLogRepository.existsById(workLogId)).thenReturn(false);

            // Act
            boolean result = workLogService.deleteWorkLog(workLogId);

            // Assert
            assertThat(result).isFalse();
            verify(workLogRepository).existsById(workLogId);
            verify(workLogRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("Get All WorkLogs")
    class GetAllWorkLogs {

        @Test
        @DisplayName("Should get all worklogs with pagination")
        void getAllWorkLogs_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            WorkLog workLog1 = new WorkLog();
            workLog1.setWorkLogId(1L);
            workLog1.setUser(user);
            workLog1.setWarrantyClaim(warrantyClaim);

            WorkLog workLog2 = new WorkLog();
            workLog2.setWorkLogId(2L);
            workLog2.setUser(user);
            workLog2.setWarrantyClaim(warrantyClaim);

            List<WorkLog> workLogs = List.of(workLog1, workLog2);
            Page<WorkLog> page = new PageImpl<>(workLogs, pageable, workLogs.size());

            when(workLogRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<WorkLogResponseDTO> result = workLogService.getAllWorkLogs(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getTotalPages()).isEqualTo(1);
            verify(workLogRepository).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Get WorkLogs By Warranty Claim")
    class GetWorkLogsByWarrantyClaim {

        @Test
        @DisplayName("Should get worklogs for a specific warranty claim")
        void getWorkLogsByWarrantyClaim_Success() {
            // Arrange
            Long claimId = 1L;
            Pageable pageable = PageRequest.of(0, 10);
            WorkLog workLog = new WorkLog();
            workLog.setWorkLogId(1L);
            workLog.setUser(user);
            workLog.setWarrantyClaim(warrantyClaim);

            Page<WorkLog> page = new PageImpl<>(List.of(workLog), pageable, 1);

            when(workLogRepository.findByWarrantyClaimWarrantyClaimId(claimId, pageable)).thenReturn(page);

            // Act
            PagedResponse<WorkLogResponseDTO> result = workLogService.getWorkLogsByWarrantyClaim(claimId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(workLogRepository).findByWarrantyClaimWarrantyClaimId(claimId, pageable);
        }
    }

    @Nested
    @DisplayName("Get WorkLogs By User")
    class GetWorkLogsByUser {

        @Test
        @DisplayName("Should get worklogs for a specific user")
        void getWorkLogsByUser_Success() {
            // Arrange
            Long userId = 1L;
            Pageable pageable = PageRequest.of(0, 10);
            WorkLog workLog = new WorkLog();
            workLog.setWorkLogId(1L);
            workLog.setUser(user);
            workLog.setWarrantyClaim(warrantyClaim);

            Page<WorkLog> page = new PageImpl<>(List.of(workLog), pageable, 1);

            when(workLogRepository.findByUserUserId(userId, pageable)).thenReturn(page);

            // Act
            PagedResponse<WorkLogResponseDTO> result = workLogService.getWorkLogsByUser(userId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(workLogRepository).findByUserUserId(userId, pageable);
        }
    }
}
