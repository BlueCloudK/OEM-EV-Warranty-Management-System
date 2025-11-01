package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.impl.VehicleServiceImpl;
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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService Unit Tests")
class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private VehicleRequestDTO vehicleRequestDTO;
    private Customer customer;
    private User user;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();

        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setCreatedAt(LocalDateTime.now());

        customer = new Customer();
        customer.setCustomerId(customerId);
        customer.setName("Test Customer");
        customer.setUser(user);

        vehicleRequestDTO = new VehicleRequestDTO();
        vehicleRequestDTO.setCustomerId(customerId.toString());
        vehicleRequestDTO.setVehicleName("Tesla Model S");
        vehicleRequestDTO.setVehicleModel("Model S");
        vehicleRequestDTO.setVehicleYear(2023); // Initialize vehicleYear
        vehicleRequestDTO.setVehicleVin("VIN123456789");
        vehicleRequestDTO.setPurchaseDate(LocalDate.now());
        vehicleRequestDTO.setWarrantyStartDate(LocalDate.now());
        vehicleRequestDTO.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicleRequestDTO.setMileage(100);
    }

    @Nested
    @DisplayName("Create Vehicle")
    class CreateVehicle {

        @Test
        @DisplayName("Should create vehicle successfully")
        void createVehicle_Success() {
            // Arrange
            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
            when(vehicleRepository.existsByVehicleVin("VIN123456789")).thenReturn(false);
            when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> {
                Vehicle v = inv.getArgument(0);
                v.setVehicleId(1L);
                return v;
            });

            // Act
            VehicleResponseDTO result = vehicleService.createVehicle(vehicleRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getVehicleVin()).isEqualTo("VIN123456789");
            assertThat(result.getCustomerName()).isEqualTo("Test Customer");
            verify(vehicleRepository).save(any(Vehicle.class));
        }

        @Test
        @DisplayName("Should throw exception when customer not found")
        void createVehicle_CustomerNotFound_ThrowsException() {
            // Arrange
            when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> vehicleService.createVehicle(vehicleRequestDTO));
            assertThat(exception.getMessage()).isEqualTo("Customer not found with id: " + customerId);
        }

        @Test
        @DisplayName("Should throw exception when VIN already exists")
        void createVehicle_VinExists_ThrowsException() {
            // Arrange
            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
            when(vehicleRepository.existsByVehicleVin("VIN123456789")).thenReturn(true);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> vehicleService.createVehicle(vehicleRequestDTO));
            assertThat(exception.getMessage()).isEqualTo("Vehicle with VIN VIN123456789 already exists");
        }
    }

    @Nested
    @DisplayName("Get Vehicles By Current User")
    class GetVehiclesByCurrentUser {

        @Test
        @DisplayName("Should return vehicles for the current user")
        void getVehiclesByCurrentUser_Success() {
            // Arrange
            String token = "valid-token";
            String authHeader = "Bearer " + token;
            String username = "testuser";

            Page<Vehicle> vehiclePage = new PageImpl<>(Collections.singletonList(new Vehicle()));

            when(jwtService.isTokenValid(token)).thenReturn(true);
            when(jwtService.extractUsername(token)).thenReturn(username);
            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
            when(customerRepository.findByUser(user)).thenReturn(customer);
            when(vehicleRepository.findByCustomerCustomerId(eq(customerId), any(Pageable.class))).thenReturn(vehiclePage);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.getVehiclesByCurrentUser(authHeader, PageRequest.of(0, 10));

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(vehicleRepository).findByCustomerCustomerId(eq(customerId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw exception for invalid token")
        void getVehiclesByCurrentUser_InvalidToken_ThrowsException() {
            // Arrange
            String authHeader = "Bearer invalid-token";
            when(jwtService.isTokenValid("invalid-token")).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> vehicleService.getVehiclesByCurrentUser(authHeader, PageRequest.of(0, 10)));
            assertThat(exception.getMessage()).isEqualTo("Invalid or missing authorization token");
        }
    }

    @Nested
    @DisplayName("Get Vehicle By ID")
    class GetVehicleById {

        @Test
        @DisplayName("Should return vehicle when found")
        void getVehicleById_Found_ReturnsDTO() {
            // Arrange
            Long vehicleId = 1L;
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(vehicleId);
            vehicle.setVehicleVin("VIN123456789");
            vehicle.setCustomer(customer);

            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

            // Act
            VehicleResponseDTO result = vehicleService.getVehicleById(vehicleId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getVehicleId()).isEqualTo(vehicleId);
            assertThat(result.getVehicleVin()).isEqualTo("VIN123456789");
            verify(vehicleRepository).findById(vehicleId);
        }

        @Test
        @DisplayName("Should return null when vehicle not found")
        void getVehicleById_NotFound_ReturnsNull() {
            // Arrange
            Long vehicleId = 999L;
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

            // Act
            VehicleResponseDTO result = vehicleService.getVehicleById(vehicleId);

            // Assert
            assertThat(result).isNull();
            verify(vehicleRepository).findById(vehicleId);
        }
    }

    @Nested
    @DisplayName("Update Vehicle")
    class UpdateVehicle {

        @Test
        @DisplayName("Should update vehicle successfully")
        void updateVehicle_Success() {
            // Arrange
            Long vehicleId = 1L;
            Vehicle existingVehicle = new Vehicle();
            existingVehicle.setVehicleId(vehicleId);
            existingVehicle.setVehicleVin("VIN123456789");
            existingVehicle.setCustomer(customer);

            VehicleRequestDTO updateDTO = new VehicleRequestDTO();
            updateDTO.setCustomerId(customerId.toString()); // Add customerId
            updateDTO.setVehicleName("Updated Model S");
            updateDTO.setVehicleModel("Model S Updated");
            updateDTO.setVehicleYear(2024);
            updateDTO.setVehicleVin("VIN123456789"); // Add VIN
            updateDTO.setMileage(5000);

            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(existingVehicle));
            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
            when(vehicleRepository.findByVehicleVin("VIN123456789")).thenReturn(existingVehicle);
            when(vehicleRepository.save(any(Vehicle.class))).thenReturn(existingVehicle);

            // Act
            VehicleResponseDTO result = vehicleService.updateVehicle(vehicleId, updateDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getVehicleId()).isEqualTo(vehicleId);
            verify(vehicleRepository).findById(vehicleId);
            verify(customerRepository).findById(customerId);
            verify(vehicleRepository).save(any(Vehicle.class));
        }

        @Test
        @DisplayName("Should return null when vehicle not found")
        void updateVehicle_NotFound_ReturnsNull() {
            // Arrange
            Long vehicleId = 999L;
            VehicleRequestDTO updateDTO = new VehicleRequestDTO();

            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

            // Act
            VehicleResponseDTO result = vehicleService.updateVehicle(vehicleId, updateDTO);

            // Assert
            assertThat(result).isNull();
            verify(vehicleRepository).findById(vehicleId);
            verify(vehicleRepository, never()).save(any(Vehicle.class));
        }
    }

    @Nested
    @DisplayName("Delete Vehicle")
    class DeleteVehicle {

        @Test
        @DisplayName("Should return true when deleting existing vehicle")
        void deleteVehicle_Exists_ReturnsTrue() {
            // Arrange
            Long vehicleId = 1L;
            when(vehicleRepository.existsById(vehicleId)).thenReturn(true);
            doNothing().when(vehicleRepository).deleteById(vehicleId);

            // Act
            boolean result = vehicleService.deleteVehicle(vehicleId);

            // Assert
            assertThat(result).isTrue();
            verify(vehicleRepository).existsById(vehicleId);
            verify(vehicleRepository).deleteById(vehicleId);
        }

        @Test
        @DisplayName("Should return false when deleting non-existent vehicle")
        void deleteVehicle_NotExists_ReturnsFalse() {
            // Arrange
            Long vehicleId = 999L;
            when(vehicleRepository.existsById(vehicleId)).thenReturn(false);

            // Act
            boolean result = vehicleService.deleteVehicle(vehicleId);

            // Assert
            assertThat(result).isFalse();
            verify(vehicleRepository).existsById(vehicleId);
            verify(vehicleRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("Get All Vehicles With Pagination")
    class GetAllVehicles {

        @Test
        @DisplayName("Should get all vehicles without search")
        void getAllVehicles_NoSearch_ReturnsPagedResponse() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Vehicle vehicle1 = new Vehicle();
            vehicle1.setVehicleId(1L);
            vehicle1.setCustomer(customer);

            Vehicle vehicle2 = new Vehicle();
            vehicle2.setVehicleId(2L);
            vehicle2.setCustomer(customer);

            List<Vehicle> vehicles = List.of(vehicle1, vehicle2);
            Page<Vehicle> page = new PageImpl<>(vehicles, pageable, vehicles.size());

            when(vehicleRepository.findAll(pageable)).thenReturn(page);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.getAllVehiclesPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            verify(vehicleRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should search vehicles by keyword")
        void getAllVehicles_WithSearch_ReturnsFilteredResults() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            String search = "Tesla";
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            vehicle.setCustomer(customer);

            Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);

            when(vehicleRepository.findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(search, search, pageable))
                .thenReturn(page);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.getAllVehiclesPage(pageable, search);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(vehicleRepository).findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(search, search, pageable);
        }
    }

    @Nested
    @DisplayName("Search Vehicles By Model And Brand")
    class SearchVehicles {

        @Test
        @DisplayName("Should search vehicles by model and brand")
        void searchVehicles_Success() {
            // Arrange
            String model = "Model S";
            String brand = "Tesla";
            Pageable pageable = PageRequest.of(0, 10);
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            vehicle.setCustomer(customer);

            Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);

            when(vehicleRepository.findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(model, brand, pageable))
                .thenReturn(page);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.searchVehicles(model, brand, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(vehicleRepository).findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(model, brand, pageable);
        }
    }

    @Nested
    @DisplayName("Get Vehicles With Expiring Warranty")
    class GetVehiclesWithExpiringWarranty {

        @Test
        @DisplayName("Should get vehicles with warranty expiring soon")
        void getVehiclesWithExpiringWarranty_Success() {
            // Arrange
            int daysFromNow = 30;
            Pageable pageable = PageRequest.of(0, 10);
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            vehicle.setWarrantyEndDate(LocalDate.now().plusDays(15));
            vehicle.setCustomer(customer);

            Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);

            when(vehicleRepository.findByVehicleYearLessThanEqual(anyInt(), eq(pageable)))
                .thenReturn(page);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.getVehiclesWithExpiringWarranty(daysFromNow, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(vehicleRepository).findByVehicleYearLessThanEqual(anyInt(), eq(pageable));
        }
    }

    @Nested
    @DisplayName("Get Vehicles By Customer ID")
    class GetVehiclesByCustomerId {

        @Test
        @DisplayName("Should get vehicles for a specific customer")
        void getVehiclesByCustomerId_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            vehicle.setCustomer(customer);

            Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);

            when(vehicleRepository.findByCustomerCustomerId(customerId, pageable)).thenReturn(page);

            // Act
            PagedResponse<VehicleResponseDTO> result = vehicleService.getVehiclesByCustomerId(customerId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(vehicleRepository).findByCustomerCustomerId(customerId, pageable);
        }
    }

    @Nested
    @DisplayName("Get Vehicle By VIN")
    class GetVehicleByVin {

        @Test
        @DisplayName("Should return vehicle when VIN found")
        void getVehicleByVin_Found_ReturnsDTO() {
            // Arrange
            String vin = "VIN123456789";
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);
            vehicle.setVehicleVin(vin);
            vehicle.setCustomer(customer);

            when(vehicleRepository.findByVehicleVin(vin)).thenReturn(vehicle);

            // Act
            VehicleResponseDTO result = vehicleService.getVehicleByVin(vin);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getVehicleVin()).isEqualTo(vin);
            verify(vehicleRepository).findByVehicleVin(vin);
        }

        @Test
        @DisplayName("Should return null when VIN not found")
        void getVehicleByVin_NotFound_ReturnsNull() {
            // Arrange
            String vin = "INVALID_VIN";
            when(vehicleRepository.findByVehicleVin(vin)).thenReturn(null);

            // Act
            VehicleResponseDTO result = vehicleService.getVehicleByVin(vin);

            // Assert
            assertThat(result).isNull();
            verify(vehicleRepository).findByVehicleVin(vin);
        }
    }
}
