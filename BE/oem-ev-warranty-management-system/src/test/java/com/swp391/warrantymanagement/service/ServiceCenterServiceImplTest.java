package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceCenter;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.FeedbackRepository;
import com.swp391.warrantymanagement.repository.ServiceCenterRepository;
import com.swp391.warrantymanagement.service.impl.ServiceCenterServiceImpl;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServiceCenterService Unit Tests")
class ServiceCenterServiceImplTest {

    @Mock
    private ServiceCenterRepository serviceCenterRepository;
    @Mock
    private FeedbackRepository feedbackRepository;

    @InjectMocks
    private ServiceCenterServiceImpl serviceCenterService;

    private ServiceCenterRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new ServiceCenterRequestDTO();
        requestDTO.setServiceCenterName("Test Center"); // Corrected method
        requestDTO.setAddress("123 Test Street");
        requestDTO.setPhone("1234567890");
        requestDTO.setLatitude(BigDecimal.valueOf(10.0));
        requestDTO.setLongitude(BigDecimal.valueOf(106.0));
        requestDTO.setOpeningHours("9-5");
    }

    @Nested
    @DisplayName("Create Service Center")
    class CreateServiceCenter {

        @Test
        @DisplayName("Should create service center successfully")
        void createServiceCenter_Success() {
            // Arrange
            when(serviceCenterRepository.existsByPhone(anyString())).thenReturn(false);
            when(serviceCenterRepository.save(any(ServiceCenter.class))).thenAnswer(inv -> {
                ServiceCenter sc = inv.getArgument(0);
                sc.setServiceCenterId(1L);
                return sc;
            });
            // Mock the statistics calls
            when(serviceCenterRepository.countStaffByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(anyLong())).thenReturn(null);

            // Act
            ServiceCenterResponseDTO result = serviceCenterService.createServiceCenter(requestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getServiceCenterName()).isEqualTo("Test Center"); // Corrected method
            assertThat(result.getTotalStaff()).isZero(); // Corrected method
            verify(serviceCenterRepository).save(any(ServiceCenter.class));
        }

        @Test
        @DisplayName("Should throw exception if phone number already exists")
        void createServiceCenter_PhoneExists_ThrowsException() {
            // Arrange
            when(serviceCenterRepository.existsByPhone("1234567890")).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> serviceCenterService.createServiceCenter(requestDTO));
            assertThat(exception.getMessage()).isEqualTo("Phone number already exists: 1234567890");
        }
    }

    @Nested
    @DisplayName("Get Service Center By ID")
    class GetServiceCenterById {

        @Test
        @DisplayName("Should get service center by ID successfully")
        void getServiceCenterById_Success() {
            // Arrange
            Long centerId = 1L;
            ServiceCenter serviceCenter = new ServiceCenter();
            serviceCenter.setServiceCenterId(centerId);
            serviceCenter.setName("Test Center");
            serviceCenter.setAddress("123 Test Street");
            serviceCenter.setPhone("1234567890");

            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.of(serviceCenter));
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(5L);
            when(serviceCenterRepository.countClaimsByServiceCenter(centerId)).thenReturn(10L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(centerId)).thenReturn(3L);
            when(feedbackRepository.getAverageRatingByServiceCenter(centerId)).thenReturn(4.5);

            // Act
            ServiceCenterResponseDTO result = serviceCenterService.getServiceCenterById(centerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getServiceCenterName()).isEqualTo("Test Center");
            assertThat(result.getTotalStaff()).isEqualTo(5L);
            assertThat(result.getTotalClaims()).isEqualTo(10L);
            assertThat(result.getActiveClaims()).isEqualTo(3L);
            assertThat(result.getAverageRating()).isEqualTo(4.5);
        }

        @Test
        @DisplayName("Should throw exception when service center not found")
        void getServiceCenterById_NotFound_ThrowsException() {
            // Arrange
            Long centerId = 999L;
            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> serviceCenterService.getServiceCenterById(centerId));
            assertThat(exception.getMessage()).contains("Service center not found");
        }
    }

    @Nested
    @DisplayName("Get All Service Centers")
    class GetAllServiceCenters {

        @Test
        @DisplayName("Should get all service centers with pagination")
        void getAllServiceCenters_Success() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            ServiceCenter sc1 = new ServiceCenter();
            sc1.setServiceCenterId(1L);
            sc1.setName("Center 1");

            ServiceCenter sc2 = new ServiceCenter();
            sc2.setServiceCenterId(2L);
            sc2.setName("Center 2");

            List<ServiceCenter> centers = List.of(sc1, sc2);
            Page<ServiceCenter> page = new PageImpl<>(centers, pageable, centers.size());

            when(serviceCenterRepository.findAll(pageable)).thenReturn(page);
            when(serviceCenterRepository.countStaffByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(anyLong())).thenReturn(null);

            // Act
            PagedResponse<ServiceCenterResponseDTO> result = serviceCenterService.getAllServiceCenters(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getTotalPages()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Update Service Center")
    class UpdateServiceCenter {

        @Test
        @DisplayName("Should update service center successfully")
        void updateServiceCenter_Success() {
            // Arrange
            Long centerId = 1L;
            ServiceCenter existingCenter = new ServiceCenter();
            existingCenter.setServiceCenterId(centerId);
            existingCenter.setName("Old Name");
            existingCenter.setPhone("1234567890");

            ServiceCenterRequestDTO updateDTO = new ServiceCenterRequestDTO();
            updateDTO.setServiceCenterName("New Name");
            updateDTO.setAddress("456 New Street");
            updateDTO.setPhone("0987654321");
            updateDTO.setLatitude(BigDecimal.valueOf(11.0));
            updateDTO.setLongitude(BigDecimal.valueOf(107.0));
            updateDTO.setOpeningHours("8-6");

            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.of(existingCenter));
            when(serviceCenterRepository.existsByPhoneAndIdNot("0987654321", centerId)).thenReturn(false);
            when(serviceCenterRepository.save(any(ServiceCenter.class))).thenReturn(existingCenter);
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(centerId)).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(centerId)).thenReturn(null);

            // Act
            ServiceCenterResponseDTO result = serviceCenterService.updateServiceCenter(centerId, updateDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(serviceCenterRepository).save(any(ServiceCenter.class));
        }

        @Test
        @DisplayName("Should throw exception when updating with existing phone number")
        void updateServiceCenter_PhoneExists_ThrowsException() {
            // Arrange
            Long centerId = 1L;
            ServiceCenter existingCenter = new ServiceCenter();
            existingCenter.setServiceCenterId(centerId);
            existingCenter.setPhone("1234567890");

            ServiceCenterRequestDTO updateDTO = new ServiceCenterRequestDTO();
            updateDTO.setPhone("0987654321");

            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.of(existingCenter));
            when(serviceCenterRepository.existsByPhoneAndIdNot("0987654321", centerId)).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> serviceCenterService.updateServiceCenter(centerId, updateDTO));
            assertThat(exception.getMessage()).contains("Phone number already exists");
        }
    }

    @Nested
    @DisplayName("Search Service Centers")
    class SearchServiceCenters {

        @Test
        @DisplayName("Should search service centers by keyword")
        void searchServiceCenters_Success() {
            // Arrange
            String keyword = "Test";
            Pageable pageable = PageRequest.of(0, 10);
            ServiceCenter sc = new ServiceCenter();
            sc.setServiceCenterId(1L);
            sc.setName("Test Center");

            Page<ServiceCenter> page = new PageImpl<>(List.of(sc), pageable, 1);

            when(serviceCenterRepository.searchByNameOrAddress(keyword, pageable)).thenReturn(page);
            when(serviceCenterRepository.countStaffByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(anyLong())).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(anyLong())).thenReturn(null);

            // Act
            PagedResponse<ServiceCenterResponseDTO> result = serviceCenterService.searchServiceCenters(keyword, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getServiceCenterName()).isEqualTo("Test Center");
        }
    }

    @Nested
    @DisplayName("Find Service Centers Near Location")
    class FindServiceCentersNearLocation {

        @Test
        @DisplayName("Should find service centers within radius")
        void findServiceCentersNearLocation_Success() {
            // Arrange
            BigDecimal latitude = BigDecimal.valueOf(10.0);
            BigDecimal longitude = BigDecimal.valueOf(106.0);
            double radius = 10.0;

            ServiceCenter sc = new ServiceCenter();
            sc.setServiceCenterId(1L);
            sc.setName("Nearby Center");
            sc.setLatitude(BigDecimal.valueOf(10.01));
            sc.setLongitude(BigDecimal.valueOf(106.01));

            when(serviceCenterRepository.findServiceCentersNearLocation(latitude, longitude, radius))
                .thenReturn(List.of(sc));
            when(serviceCenterRepository.countStaffByServiceCenter(1L)).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(1L)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(1L)).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(1L)).thenReturn(null);

            // Act
            List<ServiceCenterResponseDTO> result = serviceCenterService.findServiceCentersNearLocation(latitude, longitude, radius);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getServiceCenterName()).isEqualTo("Nearby Center");
        }
    }

    @Nested
    @DisplayName("Find All Ordered By Distance")
    class FindAllOrderedByDistance {

        @Test
        @DisplayName("Should find all service centers ordered by distance")
        void findAllOrderedByDistanceFrom_Success() {
            // Arrange
            BigDecimal latitude = BigDecimal.valueOf(10.0);
            BigDecimal longitude = BigDecimal.valueOf(106.0);

            ServiceCenter sc1 = new ServiceCenter();
            sc1.setServiceCenterId(1L);
            sc1.setName("Center 1");
            sc1.setLatitude(BigDecimal.valueOf(10.5));
            sc1.setLongitude(BigDecimal.valueOf(106.5));

            ServiceCenter sc2 = new ServiceCenter();
            sc2.setServiceCenterId(2L);
            sc2.setName("Center 2");
            sc2.setLatitude(BigDecimal.valueOf(10.1));
            sc2.setLongitude(BigDecimal.valueOf(106.1));

            // Mock repository to return Object[] with ServiceCenter and distance
            Object[] result1 = new Object[]{sc1, 50.0}; // Center 1 with distance
            Object[] result2 = new Object[]{sc2, 10.0}; // Center 2 with distance

            when(serviceCenterRepository.findAllOrderedByDistanceFrom(latitude, longitude))
                .thenReturn(List.of(result2, result1)); // Ordered by distance (closer first)
            when(serviceCenterRepository.countStaffByServiceCenter(1L)).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(1L)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(1L)).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(1L)).thenReturn(null);
            when(serviceCenterRepository.countStaffByServiceCenter(2L)).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(2L)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(2L)).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(2L)).thenReturn(null);

            // Act
            List<ServiceCenterResponseDTO> result = serviceCenterService.findAllOrderedByDistanceFrom(latitude, longitude);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getServiceCenterName()).isEqualTo("Center 2"); // Closer one first
            assertThat(result.get(1).getServiceCenterName()).isEqualTo("Center 1");
        }
    }

    @Nested
    @DisplayName("Update Service Center Location")
    class UpdateServiceCenterLocation {

        @Test
        @DisplayName("Should update service center location successfully")
        void updateServiceCenterLocation_Success() {
            // Arrange
            Long centerId = 1L;
            BigDecimal newLat = BigDecimal.valueOf(11.0);
            BigDecimal newLon = BigDecimal.valueOf(107.0);

            ServiceCenter existingCenter = new ServiceCenter();
            existingCenter.setServiceCenterId(centerId);
            existingCenter.setName("Test Center");
            existingCenter.setLatitude(BigDecimal.valueOf(10.0));
            existingCenter.setLongitude(BigDecimal.valueOf(106.0));

            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.of(existingCenter));
            when(serviceCenterRepository.save(any(ServiceCenter.class))).thenReturn(existingCenter);
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countClaimsByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(centerId)).thenReturn(0L);
            when(feedbackRepository.getAverageRatingByServiceCenter(centerId)).thenReturn(null);

            // Act
            ServiceCenterResponseDTO result = serviceCenterService.updateServiceCenterLocation(centerId, newLat, newLon);

            // Assert
            assertThat(result).isNotNull();
            verify(serviceCenterRepository).save(any(ServiceCenter.class));
        }

        @Test
        @DisplayName("Should throw exception when service center not found")
        void updateServiceCenterLocation_NotFound_ThrowsException() {
            // Arrange
            Long centerId = 999L;
            when(serviceCenterRepository.findById(centerId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> serviceCenterService.updateServiceCenterLocation(centerId, BigDecimal.TEN, BigDecimal.TEN));
            assertThat(exception.getMessage()).contains("Service center not found");
        }
    }

    @Nested
    @DisplayName("Delete Service Center")
    class DeleteServiceCenter {

        @Test
        @DisplayName("Should delete service center successfully if no staff or active claims")
        void deleteServiceCenter_Success() {
            // Arrange
            Long centerId = 1L;
            when(serviceCenterRepository.existsById(centerId)).thenReturn(true);
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(centerId)).thenReturn(0L);
            doNothing().when(serviceCenterRepository).deleteById(centerId);

            // Act
            serviceCenterService.deleteServiceCenter(centerId);

            // Assert
            verify(serviceCenterRepository).deleteById(centerId);
        }

        @Test
        @DisplayName("Should throw exception if staff are assigned to the center")
        void deleteServiceCenter_WithStaff_ThrowsException() {
            // Arrange
            Long centerId = 1L;
            when(serviceCenterRepository.existsById(centerId)).thenReturn(true);
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(5L);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> serviceCenterService.deleteServiceCenter(centerId));
            assertThat(exception.getMessage()).contains("Cannot delete service center. There are 5 staff members assigned");
        }

        @Test
        @DisplayName("Should throw exception if active claims are assigned to the center")
        void deleteServiceCenter_WithActiveClaims_ThrowsException() {
            // Arrange
            Long centerId = 1L;
            when(serviceCenterRepository.existsById(centerId)).thenReturn(true);
            when(serviceCenterRepository.countStaffByServiceCenter(centerId)).thenReturn(0L);
            when(serviceCenterRepository.countActiveClaimsByServiceCenter(centerId)).thenReturn(3L);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> serviceCenterService.deleteServiceCenter(centerId));
            assertThat(exception.getMessage()).contains("Cannot delete service center. There are 3 active claims");
        }
    }
}
