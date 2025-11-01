package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.impl.InstalledPartServiceImpl;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InstalledPartService Unit Tests")
class InstalledPartServiceImplTest {

    @Mock
    private InstalledPartRepository installedPartRepository;
    @Mock
    private PartRepository partRepository;
    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private InstalledPartServiceImpl installedPartService;

    private InstalledPartRequestDTO requestDTO;
    private Part part;
    private Vehicle vehicle;
    private Long partId = 1L;
    private Long vehicleId = 1L;

    @BeforeEach
    void setUp() {
        part = new Part();
        part.setPartId(partId);

        vehicle = new Vehicle();
        vehicle.setVehicleId(vehicleId);

        requestDTO = new InstalledPartRequestDTO();
        requestDTO.setPartId(partId);
        requestDTO.setVehicleId(vehicleId);
        requestDTO.setInstallationDate(LocalDate.of(2023, 1, 1));
        requestDTO.setWarrantyExpirationDate(LocalDate.of(2025, 1, 1));
    }

    @Nested
    @DisplayName("Create InstalledPart")
    class CreateInstalledPart {

        @Test
        @DisplayName("Should create InstalledPart successfully")
        void createInstalledPart_Success() {
            // Arrange
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.save(any(InstalledPart.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            InstalledPartResponseDTO result = installedPartService.createInstalledPart(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPartId()).isEqualTo(partId);
            assertThat(result.getVehicleId()).isEqualTo(vehicleId);
            verify(installedPartRepository).save(any(InstalledPart.class));
        }

        @Test
        @DisplayName("Should throw exception if Part not found")
        void createInstalledPart_PartNotFound_ThrowsException() {
            // Arrange
            when(partRepository.findById(partId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.createInstalledPart(requestDTO));
        }

        @Test
        @DisplayName("Should throw exception if Vehicle not found")
        void createInstalledPart_VehicleNotFound_ThrowsException() {
            // Arrange
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.createInstalledPart(requestDTO));
        }

        @Test
        @DisplayName("Should throw exception if warranty expiration is before installation date")
        void createInstalledPart_InvalidWarrantyDate_ThrowsException() {
            // Arrange
            requestDTO.setWarrantyExpirationDate(LocalDate.of(2022, 12, 31)); // Date before installation
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> installedPartService.createInstalledPart(requestDTO));
            assertThat(exception.getMessage()).isEqualTo("Warranty expiration date must be after installation date");
        }
    }

    @Nested
    @DisplayName("Get All Installed Parts")
    class GetAllInstalledParts {

        @Test
        @DisplayName("Should return paginated installed parts")
        void getAllInstalledParts_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<InstalledPart> installedParts = new ArrayList<>();
            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setPart(part);
            installedPart.setVehicle(vehicle);
            installedParts.add(installedPart);

            Page<InstalledPart> installedPartPage = new PageImpl<>(installedParts, pageable, 1);
            when(installedPartRepository.findAll(pageable)).thenReturn(installedPartPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getAllInstalledParts(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(installedPartRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return empty page when no installed parts")
        void getAllInstalledParts_EmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<InstalledPart> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(installedPartRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getAllInstalledParts(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Installed Part By ID")
    class GetInstalledPartById {

        @Test
        @DisplayName("Should return installed part when found")
        void getInstalledPartById_Found_ReturnsInstalledPart() {
            // Arrange
            Long installedPartId = 1L;
            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(installedPartId);
            installedPart.setPart(part);
            installedPart.setVehicle(vehicle);
            installedPart.setInstallationDate(LocalDate.of(2023, 1, 1));

            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.of(installedPart));

            // Act
            InstalledPartResponseDTO result = installedPartService.getInstalledPartById(installedPartId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getInstalledPartId()).isEqualTo(installedPartId);
            verify(installedPartRepository).findById(installedPartId);
        }

        @Test
        @DisplayName("Should throw exception when installed part not found")
        void getInstalledPartById_NotFound_ThrowsException() {
            // Arrange
            Long installedPartId = 999L;
            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.getInstalledPartById(installedPartId));
        }
    }

    @Nested
    @DisplayName("Update Installed Part")
    class UpdateInstalledPart {

        @Test
        @DisplayName("Should update installed part successfully")
        void updateInstalledPart_Success() {
            // Arrange
            Long installedPartId = 1L;
            InstalledPart existingInstalledPart = new InstalledPart();
            existingInstalledPart.setInstalledPartId(installedPartId);
            existingInstalledPart.setPart(part);
            existingInstalledPart.setVehicle(vehicle);

            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.of(existingInstalledPart));
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
            when(installedPartRepository.save(any(InstalledPart.class))).thenReturn(existingInstalledPart);

            // Act
            InstalledPartResponseDTO result = installedPartService.updateInstalledPart(installedPartId, requestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(installedPartRepository).save(any(InstalledPart.class));
        }

        @Test
        @DisplayName("Should throw exception when installed part not found")
        void updateInstalledPart_NotFound_ThrowsException() {
            // Arrange
            Long installedPartId = 999L;
            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.updateInstalledPart(installedPartId, requestDTO));
        }

        @Test
        @DisplayName("Should throw exception if part not found during update")
        void updateInstalledPart_PartNotFound_ThrowsException() {
            // Arrange
            Long installedPartId = 1L;
            InstalledPart existingInstalledPart = new InstalledPart();
            existingInstalledPart.setInstalledPartId(installedPartId);

            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.of(existingInstalledPart));
            when(partRepository.findById(partId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.updateInstalledPart(installedPartId, requestDTO));
        }

        @Test
        @DisplayName("Should throw exception if vehicle not found during update")
        void updateInstalledPart_VehicleNotFound_ThrowsException() {
            // Arrange
            Long installedPartId = 1L;
            InstalledPart existingInstalledPart = new InstalledPart();
            existingInstalledPart.setInstalledPartId(installedPartId);

            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.of(existingInstalledPart));
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> installedPartService.updateInstalledPart(installedPartId, requestDTO));
        }

        @Test
        @DisplayName("Should throw exception if warranty date is invalid during update")
        void updateInstalledPart_InvalidWarrantyDate_ThrowsException() {
            // Arrange
            Long installedPartId = 1L;
            requestDTO.setWarrantyExpirationDate(LocalDate.of(2022, 12, 31));

            InstalledPart existingInstalledPart = new InstalledPart();
            existingInstalledPart.setInstalledPartId(installedPartId);

            when(installedPartRepository.findById(installedPartId)).thenReturn(Optional.of(existingInstalledPart));
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> installedPartService.updateInstalledPart(installedPartId, requestDTO));
            assertThat(exception.getMessage()).isEqualTo("Warranty expiration date must be after installation date");
        }
    }

    @Nested
    @DisplayName("Delete Installed Part")
    class DeleteInstalledPart {

        @Test
        @DisplayName("Should delete installed part successfully when exists")
        void deleteInstalledPart_Exists_ReturnsTrue() {
            // Arrange
            Long installedPartId = 1L;
            when(installedPartRepository.existsById(installedPartId)).thenReturn(true);
            doNothing().when(installedPartRepository).deleteById(installedPartId);

            // Act
            boolean result = installedPartService.deleteInstalledPart(installedPartId);

            // Assert
            assertThat(result).isTrue();
            verify(installedPartRepository).deleteById(installedPartId);
        }

        @Test
        @DisplayName("Should return false when installed part does not exist")
        void deleteInstalledPart_NotExists_ReturnsFalse() {
            // Arrange
            Long installedPartId = 999L;
            when(installedPartRepository.existsById(installedPartId)).thenReturn(false);

            // Act
            boolean result = installedPartService.deleteInstalledPart(installedPartId);

            // Assert
            assertThat(result).isFalse();
            verify(installedPartRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Get Installed Parts By Vehicle")
    class GetInstalledPartsByVehicle {

        @Test
        @DisplayName("Should return installed parts for vehicle")
        void getInstalledPartsByVehicle_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<InstalledPart> installedParts = new ArrayList<>();
            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setPart(part);
            installedPart.setVehicle(vehicle);
            installedParts.add(installedPart);

            Page<InstalledPart> installedPartPage = new PageImpl<>(installedParts, pageable, 1);
            when(installedPartRepository.findByVehicleVehicleId(vehicleId, pageable)).thenReturn(installedPartPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getInstalledPartsByVehicle(vehicleId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(installedPartRepository).findByVehicleVehicleId(vehicleId, pageable);
        }

        @Test
        @DisplayName("Should return empty page when vehicle has no installed parts")
        void getInstalledPartsByVehicle_EmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<InstalledPart> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(installedPartRepository.findByVehicleVehicleId(vehicleId, pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getInstalledPartsByVehicle(vehicleId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Installed Parts By Part")
    class GetInstalledPartsByPart {

        @Test
        @DisplayName("Should return installations for part")
        void getInstalledPartsByPart_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<InstalledPart> installedParts = new ArrayList<>();
            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setPart(part);
            installedPart.setVehicle(vehicle);
            installedParts.add(installedPart);

            Page<InstalledPart> installedPartPage = new PageImpl<>(installedParts, pageable, 1);
            when(installedPartRepository.findByPartPartId(partId, pageable)).thenReturn(installedPartPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getInstalledPartsByPart(partId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(installedPartRepository).findByPartPartId(partId, pageable);
        }

        @Test
        @DisplayName("Should return empty page when part has no installations")
        void getInstalledPartsByPart_EmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<InstalledPart> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(installedPartRepository.findByPartPartId(partId, pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result = installedPartService.getInstalledPartsByPart(partId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Installed Parts With Expiring Warranty")
    class GetInstalledPartsWithExpiringWarranty {

        @Test
        @DisplayName("Should return parts with warranty expiring within specified days")
        void getInstalledPartsWithExpiringWarranty_Success() {
            // Arrange
            int daysFromNow = 30;
            Pageable pageable = PageRequest.of(0, 10);
            LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

            List<InstalledPart> installedParts = new ArrayList<>();
            InstalledPart installedPart = new InstalledPart();
            installedPart.setInstalledPartId(1L);
            installedPart.setPart(part);
            installedPart.setVehicle(vehicle);
            installedPart.setWarrantyExpirationDate(LocalDate.now().plusDays(15));
            installedParts.add(installedPart);

            Page<InstalledPart> installedPartPage = new PageImpl<>(installedParts, pageable, 1);
            when(installedPartRepository.findByWarrantyExpirationDateBefore(cutoffDate, pageable))
                .thenReturn(installedPartPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result =
                installedPartService.getInstalledPartsWithExpiringWarranty(daysFromNow, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(installedPartRepository).findByWarrantyExpirationDateBefore(cutoffDate, pageable);
        }

        @Test
        @DisplayName("Should return empty page when no warranties expiring")
        void getInstalledPartsWithExpiringWarranty_EmptyPage() {
            // Arrange
            int daysFromNow = 30;
            Pageable pageable = PageRequest.of(0, 10);
            LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

            Page<InstalledPart> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(installedPartRepository.findByWarrantyExpirationDateBefore(cutoffDate, pageable))
                .thenReturn(emptyPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result =
                installedPartService.getInstalledPartsWithExpiringWarranty(daysFromNow, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should work with different day ranges")
        void getInstalledPartsWithExpiringWarranty_DifferentDayRanges() {
            // Arrange
            int daysFromNow = 7; // 1 week
            Pageable pageable = PageRequest.of(0, 10);
            LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

            Page<InstalledPart> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(installedPartRepository.findByWarrantyExpirationDateBefore(cutoffDate, pageable))
                .thenReturn(emptyPage);

            // Act
            PagedResponse<InstalledPartResponseDTO> result =
                installedPartService.getInstalledPartsWithExpiringWarranty(daysFromNow, pageable);

            // Assert
            assertThat(result).isNotNull();
            verify(installedPartRepository).findByWarrantyExpirationDateBefore(cutoffDate, pageable);
        }
    }
}
