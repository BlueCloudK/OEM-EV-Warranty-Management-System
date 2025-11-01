package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.ServiceHistoryMapper;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.JwtService;
import com.swp391.warrantymanagement.service.impl.ServiceHistoryServiceImpl;
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

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServiceHistoryService Unit Tests")
class ServiceHistoryServiceImplTest {

    @Mock
    private ServiceHistoryRepository serviceHistoryRepository;

    @Mock
    private PartRepository partRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.swp391.warrantymanagement.repository.CustomerRepository customerRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private ServiceHistoryServiceImpl serviceHistoryService;

    private ServiceHistoryRequestDTO requestDTO;
    private Vehicle vehicle;
    private Part part;
    private ServiceHistory savedServiceHistory;
    private LocalDate serviceLocalDate;
    private Date serviceUtilDate;

    @BeforeEach
    void setUp() {
        serviceLocalDate = LocalDate.parse("2023-10-01"); // Past date to satisfy @PastOrPresent
        serviceUtilDate = Date.from(serviceLocalDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

        requestDTO = new ServiceHistoryRequestDTO();
        requestDTO.setVehicleId(1L);
        requestDTO.setPartId(101L);
        requestDTO.setServiceDate(serviceUtilDate);
        requestDTO.setDescription("Annual maintenance");

        vehicle = new Vehicle();
        vehicle.setVehicleId(1L);

        part = new Part();
        part.setPartId(101L);

        // This is the object we expect after the initial save
        savedServiceHistory = new ServiceHistory();
        savedServiceHistory.setServiceHistoryId(99L); // A sample ID given by the database
        savedServiceHistory.setVehicle(vehicle);
        savedServiceHistory.setDescription(requestDTO.getDescription());
        savedServiceHistory.setServiceDate(serviceLocalDate); // The entity uses LocalDate
    }

    @Nested
    @DisplayName("Create Service History")
    class CreateServiceHistory {

        @Test
        @DisplayName("Should create service history successfully")
        void createServiceHistory_Success() {
            // Arrange
            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(partRepository.findById(101L)).thenReturn(Optional.of(part)); // Corrected to Long
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenReturn(savedServiceHistory);

            // Act
            ServiceHistoryResponseDTO result = serviceHistoryService.createServiceHistory(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getServiceHistoryId()).isEqualTo(savedServiceHistory.getServiceHistoryId());
            assertThat(result.getDescription()).isEqualTo(requestDTO.getDescription());
            // Compare java.util.Date from DTO with java.util.Date from setup
            assertThat(result.getServiceDate()).isEqualTo(serviceUtilDate);

            verify(vehicleRepository).findById(1L);
            verify(partRepository).findById(101L);
            verify(serviceHistoryRepository, times(2)).save(any(ServiceHistory.class));
        }

        @Test
        @DisplayName("Should throw exception when vehicle not found")
        void createServiceHistory_VehicleNotFound_ThrowsException() {
            // Arrange
            when(partRepository.findById(101L)).thenReturn(Optional.of(part)); // Part is found first
            when(vehicleRepository.findById(1L)).thenReturn(Optional.empty()); // Then vehicle is NOT found

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> serviceHistoryService.createServiceHistory(requestDTO));

            assertThat(exception.getMessage()).isEqualTo("Vehicle not found with id: 1");
            verify(partRepository).findById(101L); // Verify part was looked up
            verify(serviceHistoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when part not found")
        void createServiceHistory_PartNotFound_ThrowsException() {
            // Arrange
            // Only mock partRepository to return empty, as the service checks part first.
            when(partRepository.findById(101L)).thenReturn(Optional.empty());
            // No need to mock vehicleRepository here, as it won't be called.

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> serviceHistoryService.createServiceHistory(requestDTO));

            assertThat(exception.getMessage()).isEqualTo("Part not found with id: 101");
            verify(partRepository).findById(101L);
            verify(vehicleRepository, never()).findById(anyLong()); // Ensure vehicleRepository was not called
            verify(serviceHistoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Delete Service History")
    class DeleteServiceHistory {

        @Test
        @DisplayName("Should return true when deleting an existing history")
        void deleteServiceHistory_Exists_ReturnsTrue() {
            // Arrange
            Long existingId = 1L;
            when(serviceHistoryRepository.existsById(existingId)).thenReturn(true);
            doNothing().when(serviceHistoryRepository).deleteById(existingId);

            // Act
            boolean result = serviceHistoryService.deleteServiceHistory(existingId);

            // Assert
            assertThat(result).isTrue();
            verify(serviceHistoryRepository).existsById(existingId);
            verify(serviceHistoryRepository).deleteById(existingId);
        }

        @Test
        @DisplayName("Should return false when deleting a non-existent history")
        void deleteServiceHistory_NotExists_ReturnsFalse() {
            // Arrange
            Long nonExistentId = 999L;
            when(serviceHistoryRepository.existsById(nonExistentId)).thenReturn(false);

            // Act
            boolean result = serviceHistoryService.deleteServiceHistory(nonExistentId);

            // Assert
            assertThat(result).isFalse();
            verify(serviceHistoryRepository).existsById(nonExistentId);
            verify(serviceHistoryRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("Get Service History By ID")
    class GetServiceHistoryById {

        @Test
        @DisplayName("Should return service history when found")
        void getServiceHistoryById_Found_ReturnsDTO() {
            // Arrange
            Long historyId = 1L;
            ServiceHistory serviceHistory = new ServiceHistory();
            serviceHistory.setServiceHistoryId(historyId);
            serviceHistory.setDescription("Test service");
            serviceHistory.setServiceDate(serviceLocalDate);
            serviceHistory.setVehicle(vehicle);

            when(serviceHistoryRepository.findById(historyId)).thenReturn(Optional.of(serviceHistory));

            // Act
            ServiceHistoryResponseDTO result = serviceHistoryService.getServiceHistoryById(historyId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getServiceHistoryId()).isEqualTo(historyId);
            verify(serviceHistoryRepository).findById(historyId);
        }

        @Test
        @DisplayName("Should return null when service history not found")
        void getServiceHistoryById_NotFound_ReturnsNull() {
            // Arrange
            Long historyId = 999L;
            when(serviceHistoryRepository.findById(historyId)).thenReturn(Optional.empty());

            // Act
            ServiceHistoryResponseDTO result = serviceHistoryService.getServiceHistoryById(historyId);

            // Assert
            assertThat(result).isNull();
            verify(serviceHistoryRepository).findById(historyId);
        }
    }

    @Nested
    @DisplayName("Update Service History")
    class UpdateServiceHistory {

        @Test
        @DisplayName("Should update service history successfully")
        void updateServiceHistory_Success() {
            // Arrange
            Long historyId = 1L;
            ServiceHistory existingHistory = new ServiceHistory();
            existingHistory.setServiceHistoryId(historyId);
            existingHistory.setDescription("Old description");
            existingHistory.setServiceDate(serviceLocalDate);
            existingHistory.setVehicle(vehicle);

            ServiceHistoryRequestDTO updateDTO = new ServiceHistoryRequestDTO();
            updateDTO.setDescription("Updated description");
            updateDTO.setServiceDate(serviceUtilDate);

            when(serviceHistoryRepository.findById(historyId)).thenReturn(Optional.of(existingHistory));
            when(serviceHistoryRepository.save(any(ServiceHistory.class))).thenReturn(existingHistory);

            // Act
            ServiceHistoryResponseDTO result = serviceHistoryService.updateServiceHistory(historyId, updateDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getServiceHistoryId()).isEqualTo(historyId);
            verify(serviceHistoryRepository).findById(historyId);
            verify(serviceHistoryRepository).save(any(ServiceHistory.class));
        }

        @Test
        @DisplayName("Should return null when service history not found")
        void updateServiceHistory_NotFound_ReturnsNull() {
            // Arrange
            Long historyId = 999L;
            ServiceHistoryRequestDTO updateDTO = new ServiceHistoryRequestDTO();
            updateDTO.setDescription("Updated description");

            when(serviceHistoryRepository.findById(historyId)).thenReturn(Optional.empty());

            // Act
            ServiceHistoryResponseDTO result = serviceHistoryService.updateServiceHistory(historyId, updateDTO);

            // Assert
            assertThat(result).isNull();
            verify(serviceHistoryRepository).findById(historyId);
            verify(serviceHistoryRepository, never()).save(any(ServiceHistory.class));
        }
    }

    @Nested
    @DisplayName("Get All Service Histories With Pagination")
    class GetAllServiceHistories {

        @Test
        @DisplayName("Should get all service histories without search")
        void getAllServiceHistories_NoSearch_ReturnsPagedResponse() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            ServiceHistory history1 = new ServiceHistory();
            history1.setServiceHistoryId(1L);
            history1.setServiceDate(serviceLocalDate);
            history1.setVehicle(vehicle);

            ServiceHistory history2 = new ServiceHistory();
            history2.setServiceHistoryId(2L);
            history2.setServiceDate(serviceLocalDate);
            history2.setVehicle(vehicle);

            List<ServiceHistory> histories = List.of(history1, history2);
            Page<ServiceHistory> page = new PageImpl<>(histories, pageable, histories.size());

            when(serviceHistoryRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getAllServiceHistoriesPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            verify(serviceHistoryRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should get all service histories with empty search string")
        void getAllServiceHistories_EmptySearch_ReturnsAll() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getAllServiceHistoriesPage(pageable, "");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(serviceHistoryRepository).findAll(pageable);
            verify(serviceHistoryRepository, never()).findByServiceTypeContainingIgnoreCase(anyString(), any());
        }

        @Test
        @DisplayName("Should get all service histories with whitespace search string")
        void getAllServiceHistories_WhitespaceSearch_ReturnsAll() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getAllServiceHistoriesPage(pageable, "   ");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(serviceHistoryRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should search service histories by service type")
        void getAllServiceHistories_WithSearch_ReturnsFilteredResults() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            String searchTerm = "maintenance";
            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findByServiceTypeContainingIgnoreCase(searchTerm, pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getAllServiceHistoriesPage(pageable, searchTerm);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(serviceHistoryRepository).findByServiceTypeContainingIgnoreCase(searchTerm, pageable);
        }
    }

    @Nested
    @DisplayName("Get Service Histories By Vehicle ID")
    class GetServiceHistoriesByVehicleId {

        @Test
        @DisplayName("Should get service histories for a specific vehicle")
        void getServiceHistoriesByVehicleId_Success() {
            // Arrange
            Long vehicleId = 1L;
            Pageable pageable = PageRequest.of(0, 10);
            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findByVehicleVehicleId(vehicleId, pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getServiceHistoriesByVehicleId(vehicleId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(serviceHistoryRepository).findByVehicleVehicleId(vehicleId, pageable);
        }
    }

    @Nested
    @DisplayName("Get Service Histories By Part ID")
    class GetServiceHistoriesByPartId {

        @Test
        @DisplayName("Should get service histories for a specific part")
        void getServiceHistoriesByPartId_Success() {
            // Arrange
            String partId = "PART-001";
            Pageable pageable = PageRequest.of(0, 10);
            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findByServiceHistoryDetailsPartPartId(partId, pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getServiceHistoriesByPartId(partId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(serviceHistoryRepository).findByServiceHistoryDetailsPartPartId(partId, pageable);
        }
    }

    @Nested
    @DisplayName("Get Service Histories By Current User")
    class GetServiceHistoriesByCurrentUser {

        @Test
        @DisplayName("Should get service histories for current customer user")
        void getServiceHistoriesByCurrentUser_Success() {
            // Arrange
            String authHeader = "Bearer valid-token";
            String username = "customer1";
            Pageable pageable = PageRequest.of(0, 10);

            User user = new User();
            user.setUsername(username);

            Customer customer = new Customer();
            customer.setCustomerId(UUID.randomUUID());
            customer.setUser(user);

            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(serviceLocalDate);
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(jwtService.extractUsername("valid-token")).thenReturn(username);
            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
            when(customerRepository.findByUser(user)).thenReturn(customer);
            when(serviceHistoryRepository.findByVehicleCustomerCustomerId(customer.getCustomerId(), pageable)).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getServiceHistoriesByCurrentUser(authHeader, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(jwtService).extractUsername("valid-token");
            verify(userRepository).findByUsername(username);
            verify(customerRepository).findByUser(user);
        }

        @Test
        @DisplayName("Should throw exception when authorization header is null")
        void getServiceHistoriesByCurrentUser_NullAuthHeader_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> serviceHistoryService.getServiceHistoriesByCurrentUser(null, pageable));
            assertThat(exception.getMessage()).contains("Invalid or missing authorization token");
        }

        @Test
        @DisplayName("Should throw exception when authorization header has no Bearer prefix")
        void getServiceHistoriesByCurrentUser_NoBearerPrefix_ThrowsException() {
            // Arrange
            String authHeader = "invalid-header-format";
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> serviceHistoryService.getServiceHistoriesByCurrentUser(authHeader, pageable));
            assertThat(exception.getMessage()).contains("Invalid or missing authorization token");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getServiceHistoriesByCurrentUser_UserNotFound_ThrowsException() {
            // Arrange
            String authHeader = "Bearer valid-token";
            String username = "nonexistent";
            Pageable pageable = PageRequest.of(0, 10);

            when(jwtService.extractUsername("valid-token")).thenReturn(username);
            when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> serviceHistoryService.getServiceHistoriesByCurrentUser(authHeader, pageable));
            assertThat(exception.getMessage()).contains("User not found");
        }

        @Test
        @DisplayName("Should throw exception when customer profile not found")
        void getServiceHistoriesByCurrentUser_CustomerNotFound_ThrowsException() {
            // Arrange
            String authHeader = "Bearer valid-token";
            String username = "user1";
            Pageable pageable = PageRequest.of(0, 10);

            User user = new User();
            user.setUsername(username);

            when(jwtService.extractUsername("valid-token")).thenReturn(username);
            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
            when(customerRepository.findByUser(user)).thenReturn(null);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> serviceHistoryService.getServiceHistoriesByCurrentUser(authHeader, pageable));
            assertThat(exception.getMessage()).contains("Customer profile not found");
        }
    }

    @Nested
    @DisplayName("Get Service Histories By Date Range")
    class GetServiceHistoriesByDateRange {

        @Test
        @DisplayName("Should get service histories within date range")
        void getServiceHistoriesByDateRange_Success() {
            // Arrange
            String startDate = "2023-01-01";
            String endDate = "2023-12-31";
            Pageable pageable = PageRequest.of(0, 10);

            ServiceHistory history = new ServiceHistory();
            history.setServiceHistoryId(1L);
            history.setServiceDate(LocalDate.of(2023, 6, 15));
            history.setVehicle(vehicle);

            Page<ServiceHistory> page = new PageImpl<>(List.of(history), pageable, 1);

            when(serviceHistoryRepository.findByServiceDateBetween(
                LocalDate.of(2023, 1, 1),
                LocalDate.of(2023, 12, 31),
                pageable
            )).thenReturn(page);

            // Act
            PagedResponse<ServiceHistoryResponseDTO> result = serviceHistoryService.getServiceHistoriesByDateRange(startDate, endDate, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(serviceHistoryRepository).findByServiceDateBetween(
                LocalDate.of(2023, 1, 1),
                LocalDate.of(2023, 12, 31),
                pageable
            );
        }

        @Test
        @DisplayName("Should throw exception for invalid date format")
        void getServiceHistoriesByDateRange_InvalidFormat_ThrowsException() {
            // Arrange
            String startDate = "01-01-2023"; // Wrong format
            String endDate = "31-12-2023";
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> serviceHistoryService.getServiceHistoriesByDateRange(startDate, endDate, pageable));
            assertThat(exception.getMessage()).contains("Invalid date format");
        }
    }
}
