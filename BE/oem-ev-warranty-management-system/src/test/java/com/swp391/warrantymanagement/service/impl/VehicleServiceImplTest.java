package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VehicleServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private Vehicle testVehicle;
    private Customer testCustomer;
    private VehicleRequestDTO testRequestDTO;
    private Long testVehicleId;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        testVehicleId = 1L;
        testCustomerId = UUID.randomUUID();

        testCustomer = new Customer();
        testCustomer.setCustomerId(testCustomerId);
        testCustomer.setName("Test Customer");

        testVehicle = new Vehicle();
        testVehicle.setVehicleId(testVehicleId);
        testVehicle.setVehicleVin("29-MĐ-123.45");
        testVehicle.setVehicleName("Tesla Model 3");
        testVehicle.setVehicleModel("Model 3");
        testVehicle.setVehicleYear(2023);
        testVehicle.setCustomer(testCustomer);

        testRequestDTO = new VehicleRequestDTO();
        testRequestDTO.setCustomerId(testCustomerId.toString());
        testRequestDTO.setVehicleVin("29-MĐ-123.45");
        testRequestDTO.setVehicleName("Tesla Model 3");
        testRequestDTO.setVehicleModel("Model 3");
        testRequestDTO.setVehicleYear(2023);
    }

    @Test
    void getVehicleById_WhenVehicleExists_ShouldReturnVehicle() {
        // Arrange
        when(vehicleRepository.findById(testVehicleId)).thenReturn(Optional.of(testVehicle));

        // Act
        VehicleResponseDTO result = vehicleService.getVehicleById(testVehicleId);

        // Assert
        assertNotNull(result);
        assertEquals(testVehicleId, result.getVehicleId());
        assertEquals("29-MĐ-123.45", result.getVehicleVin());
        assertEquals("Tesla Model 3", result.getVehicleName());
        assertEquals("Model 3", result.getVehicleModel());
        verify(vehicleRepository, times(1)).findById(testVehicleId);
    }

    @Test
    void getVehicleById_WhenVehicleNotExists_ShouldReturnNull() {
        // Arrange
        Long nonExistentId = 999L;
        when(vehicleRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        VehicleResponseDTO result = vehicleService.getVehicleById(nonExistentId);

        // Assert
        assertNull(result);
        verify(vehicleRepository, times(1)).findById(nonExistentId);
    }

    @Test
    void getAllVehiclesPage_WithoutSearch_ShouldReturnPagedVehicles() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicles = Arrays.asList(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicles, pageable, 1);

        when(vehicleRepository.findAll(pageable)).thenReturn(vehiclePage);

        // Act
        PagedResponse<VehicleResponseDTO> result = vehicleService.getAllVehiclesPage(pageable, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("Tesla Model 3", result.getContent().get(0).getVehicleName());
        verify(vehicleRepository, times(1)).findAll(pageable);
    }

    @Test
    void createVehicle_WhenCustomerExists_ShouldCreateAndReturnVehicle() {
        // Arrange
        when(customerRepository.findById(testCustomerId)).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        VehicleResponseDTO result = vehicleService.createVehicle(testRequestDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Tesla Model 3", result.getVehicleName());
        assertEquals("Model 3", result.getVehicleModel());
        verify(customerRepository, times(1)).findById(testCustomerId);
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void createVehicle_WhenCustomerNotExists_ShouldThrowException() {
        // Arrange
        when(customerRepository.findById(testCustomerId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.createVehicle(testRequestDTO);
        });

        assertTrue(exception.getMessage().contains("Customer not found"));
        verify(customerRepository, times(1)).findById(testCustomerId);
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_WhenVehicleExists_ShouldUpdateAndReturnVehicle() {
        // Arrange
        when(vehicleRepository.findById(testVehicleId)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        VehicleRequestDTO updateDTO = new VehicleRequestDTO();
        updateDTO.setVehicleName("Tesla Model S");
        updateDTO.setVehicleModel("Model S");
        updateDTO.setVehicleYear(2024);
        updateDTO.setVehicleVin("29-MĐ-987.65");

        // Act
        VehicleResponseDTO result = vehicleService.updateVehicle(testVehicleId, updateDTO);

        // Assert
        assertNotNull(result);
        verify(vehicleRepository, times(1)).findById(testVehicleId);
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_WhenVehicleNotExists_ShouldReturnNull() {
        // Arrange
        Long nonExistentId = 999L;
        when(vehicleRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        VehicleResponseDTO result = vehicleService.updateVehicle(nonExistentId, testRequestDTO);

        // Assert
        assertNull(result);
        verify(vehicleRepository, times(1)).findById(nonExistentId);
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void deleteVehicle_WhenVehicleExists_ShouldReturnTrue() {
        // Arrange
        when(vehicleRepository.existsById(testVehicleId)).thenReturn(true);
        doNothing().when(vehicleRepository).deleteById(testVehicleId);

        // Act
        boolean result = vehicleService.deleteVehicle(testVehicleId);

        // Assert
        assertTrue(result);
        verify(vehicleRepository, times(1)).existsById(testVehicleId);
        verify(vehicleRepository, times(1)).deleteById(testVehicleId);
    }

    @Test
    void deleteVehicle_WhenVehicleNotExists_ShouldReturnFalse() {
        // Arrange
        Long nonExistentId = 999L;
        when(vehicleRepository.existsById(nonExistentId)).thenReturn(false);

        // Act
        boolean result = vehicleService.deleteVehicle(nonExistentId);

        // Assert
        assertFalse(result);
        verify(vehicleRepository, times(1)).existsById(nonExistentId);
        verify(vehicleRepository, never()).deleteById(any());
    }

    @Test
    void getVehicleByVin_WhenVehicleExists_ShouldReturnVehicle() {
        // Arrange
        String vin = "29-MĐ-123.45";
        when(vehicleRepository.findByVehicleVin(vin)).thenReturn(testVehicle);

        // Act
        VehicleResponseDTO result = vehicleService.getVehicleByVin(vin);

        // Assert
        assertNotNull(result);
        assertEquals(vin, result.getVehicleVin());
        verify(vehicleRepository, times(1)).findByVehicleVin(vin);
    }

    @Test
    void getVehicleByVin_WhenVehicleNotExists_ShouldReturnNull() {
        // Arrange
        String vin = "99-MĐ-999.99";
        when(vehicleRepository.findByVehicleVin(vin)).thenReturn(null);

        // Act
        VehicleResponseDTO result = vehicleService.getVehicleByVin(vin);

        // Assert
        assertNull(result);
        verify(vehicleRepository, times(1)).findByVehicleVin(vin);
    }

    @Test
    void getVehiclesByCustomerId_ShouldReturnCustomerVehicles() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicles = Arrays.asList(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicles, pageable, 1);

        when(vehicleRepository.findByCustomerCustomerId(testCustomerId, pageable))
                .thenReturn(vehiclePage);

        // Act
        PagedResponse<VehicleResponseDTO> result = vehicleService.getVehiclesByCustomerId(testCustomerId, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(vehicleRepository, times(1)).findByCustomerCustomerId(testCustomerId, pageable);
    }
}
