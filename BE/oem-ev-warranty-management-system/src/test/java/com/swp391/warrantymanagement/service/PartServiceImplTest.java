package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.service.impl.PartServiceImpl;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartService Unit Tests")
class PartServiceImplTest {

    @Mock
    private PartRepository partRepository;

    @InjectMocks
    private PartServiceImpl partService;

    private PartRequestDTO partRequestDTO;
    private Part part;

    @BeforeEach
    void setUp() {
        partRequestDTO = new PartRequestDTO();
        partRequestDTO.setPartName("Test Part");
        partRequestDTO.setPartNumber("PN-12345");
        partRequestDTO.setManufacturer("TestCorp");
        partRequestDTO.setPrice(new BigDecimal("99.99"));

        part = new Part();
        part.setPartId(1L);
        part.setPartName(partRequestDTO.getPartName());
        part.setPartNumber(partRequestDTO.getPartNumber());
        part.setManufacturer(partRequestDTO.getManufacturer());
        part.setPrice(partRequestDTO.getPrice());
    }

    @Nested
    @DisplayName("Create Part")
    class CreatePart {

        @Test
        @DisplayName("Should create part successfully when part number is unique")
        void createPart_Success() {
            // Arrange
            when(partRepository.findByPartNumber(partRequestDTO.getPartNumber())).thenReturn(null);
            when(partRepository.save(any(Part.class))).thenReturn(part);

            // Act
            PartResponseDTO result = partService.createPart(partRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPartId()).isEqualTo(part.getPartId());
            assertThat(result.getPartNumber()).isEqualTo(partRequestDTO.getPartNumber());
            verify(partRepository).findByPartNumber(partRequestDTO.getPartNumber());
            verify(partRepository).save(any(Part.class));
        }

        @Test
        @DisplayName("Should throw exception when part number already exists")
        void createPart_DuplicatePartNumber_ThrowsException() {
            // Arrange
            when(partRepository.findByPartNumber(partRequestDTO.getPartNumber())).thenReturn(part);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> partService.createPart(partRequestDTO));
            assertThat(exception.getMessage()).isEqualTo("Part number already exists: " + partRequestDTO.getPartNumber());
            verify(partRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Update Part")
    class UpdatePart {

        @Test
        @DisplayName("Should update part successfully")
        void updatePart_Success() {
            // Arrange
            Long partId = 1L;
            PartRequestDTO updateRequest = new PartRequestDTO();
            updateRequest.setPartName("Updated Name");
            updateRequest.setPartNumber("PN-12345"); // Same part number
            updateRequest.setPrice(new BigDecimal("120.00"));

            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(partRepository.save(any(Part.class))).thenReturn(part);

            // Act
            PartResponseDTO result = partService.updatePart(partId, updateRequest);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPartName()).isEqualTo(updateRequest.getPartName());
            assertThat(result.getPrice()).isEqualTo(updateRequest.getPrice());
            verify(partRepository).findById(partId);
            verify(partRepository).save(part);
        }

        @Test
        @DisplayName("Should throw exception when updating to a duplicate part number")
        void updatePart_DuplicatePartNumber_ThrowsException() {
            // Arrange
            Long partId = 1L;
            PartRequestDTO updateRequest = new PartRequestDTO();
            updateRequest.setPartNumber("PN-67890"); // Different part number

            Part existingPartWithNewNumber = new Part();
            existingPartWithNewNumber.setPartId(2L);
            existingPartWithNewNumber.setPartNumber("PN-67890");

            when(partRepository.findById(partId)).thenReturn(Optional.of(part));
            when(partRepository.findByPartNumber(updateRequest.getPartNumber())).thenReturn(existingPartWithNewNumber);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> partService.updatePart(partId, updateRequest));
            assertThat(exception.getMessage()).isEqualTo("Part number already exists: " + updateRequest.getPartNumber());
            verify(partRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when part to update is not found")
        void updatePart_NotFound_ThrowsException() {
            // Arrange
            Long nonExistentId = 999L;
            when(partRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> partService.updatePart(nonExistentId, partRequestDTO));
        }
    }

    @Nested
    @DisplayName("Get Part")
    class GetPart {
        @Test
        @DisplayName("Should return part when found by ID")
        void getPartById_Found() {
            // Arrange
            Long partId = 1L;
            when(partRepository.findById(partId)).thenReturn(Optional.of(part));

            // Act
            PartResponseDTO result = partService.getPartById(partId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPartId()).isEqualTo(partId);
        }

        @Test
        @DisplayName("Should throw exception when not found by ID")
        void getPartById_NotFound_ThrowsException() {
            // Arrange
            Long nonExistentId = 999L;
            when(partRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> partService.getPartById(nonExistentId));
        }
    }

    @Nested
    @DisplayName("Delete Part")
    class DeletePart {

        @Test
        @DisplayName("Should delete part successfully when exists")
        void deletePart_Exists_ReturnsTrue() {
            // Arrange
            Long partId = 1L;
            when(partRepository.existsById(partId)).thenReturn(true);
            doNothing().when(partRepository).deleteById(partId);

            // Act
            boolean result = partService.deletePart(partId);

            // Assert
            assertThat(result).isTrue();
            verify(partRepository).existsById(partId);
            verify(partRepository).deleteById(partId);
        }

        @Test
        @DisplayName("Should return false when part does not exist")
        void deletePart_NotExists_ReturnsFalse() {
            // Arrange
            Long nonExistentId = 999L;
            when(partRepository.existsById(nonExistentId)).thenReturn(false);

            // Act
            boolean result = partService.deletePart(nonExistentId);

            // Assert
            assertThat(result).isFalse();
            verify(partRepository).existsById(nonExistentId);
            verify(partRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Get All Parts Page")
    class GetAllPartsPage {

        @Test
        @DisplayName("Should return paginated parts without search")
        void getAllPartsPage_NoSearch_ReturnsPaginatedParts() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Part> parts = new ArrayList<>();
            Part part1 = new Part();
            part1.setPartId(1L);
            part1.setPartName("Part 1");
            part1.setPartNumber("PN-001");
            part1.setManufacturer("TestCorp");
            part1.setPrice(new BigDecimal("99.99"));
            parts.add(part1);

            Part part2 = new Part();
            part2.setPartId(2L);
            part2.setPartName("Part 2");
            part2.setPartNumber("PN-002");
            part2.setManufacturer("AnotherCorp");
            part2.setPrice(new BigDecimal("149.99"));
            parts.add(part2);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 2);
            when(partRepository.findAll(pageable)).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getAllPartsPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getTotalPages()).isEqualTo(1);
            verify(partRepository).findAll(pageable);
            verify(partRepository, never()).findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(any(), any(), any());
        }

        @Test
        @DisplayName("Should return paginated parts with search")
        void getAllPartsPage_WithSearch_ReturnsFilteredParts() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            String searchTerm = "Tesla";

            List<Part> parts = new ArrayList<>();
            Part part1 = new Part();
            part1.setPartId(1L);
            part1.setPartName("Tesla Battery");
            part1.setPartNumber("PN-TESLA-001");
            part1.setManufacturer("Tesla");
            part1.setPrice(new BigDecimal("999.99"));
            parts.add(part1);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 1);
            when(partRepository.findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
                eq(searchTerm), eq(searchTerm), eq(pageable))).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getAllPartsPage(pageable, searchTerm);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getPartName()).contains("Tesla");
            verify(partRepository).findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
                searchTerm, searchTerm, pageable);
            verify(partRepository, never()).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no parts found")
        void getAllPartsPage_NoPartsFound_ReturnsEmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Part> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(partRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getAllPartsPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should handle empty search string as no search")
        void getAllPartsPage_EmptySearch_TreatedAsNoSearch() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Part> parts = new ArrayList<>();
            parts.add(part);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 1);
            when(partRepository.findAll(pageable)).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getAllPartsPage(pageable, "   ");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(partRepository).findAll(pageable);
            verify(partRepository, never()).findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(any(), any(), any());
        }
    }

    @Nested
    @DisplayName("Get Parts By Manufacturer")
    class GetPartsByManufacturer {

        @Test
        @DisplayName("Should return parts for specific manufacturer")
        void getPartsByManufacturer_Success() {
            // Arrange
            String manufacturer = "TestCorp";
            Pageable pageable = PageRequest.of(0, 10);

            List<Part> parts = new ArrayList<>();
            Part part1 = new Part();
            part1.setPartId(1L);
            part1.setPartName("Part 1");
            part1.setPartNumber("PN-001");
            part1.setManufacturer(manufacturer);
            part1.setPrice(new BigDecimal("99.99"));
            parts.add(part1);

            Part part2 = new Part();
            part2.setPartId(2L);
            part2.setPartName("Part 2");
            part2.setPartNumber("PN-002");
            part2.setManufacturer(manufacturer);
            part2.setPrice(new BigDecimal("149.99"));
            parts.add(part2);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 2);
            when(partRepository.findByManufacturerContainingIgnoreCase(manufacturer, pageable)).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getPartsByManufacturer(manufacturer, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).allMatch(p -> p.getManufacturer().equals(manufacturer));
            verify(partRepository).findByManufacturerContainingIgnoreCase(manufacturer, pageable);
        }

        @Test
        @DisplayName("Should return empty page when no parts found for manufacturer")
        void getPartsByManufacturer_NoPartsFound_ReturnsEmptyPage() {
            // Arrange
            String manufacturer = "NonExistentCorp";
            Pageable pageable = PageRequest.of(0, 10);
            Page<Part> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

            when(partRepository.findByManufacturerContainingIgnoreCase(manufacturer, pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getPartsByManufacturer(manufacturer, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should perform case-insensitive search for manufacturer")
        void getPartsByManufacturer_CaseInsensitive() {
            // Arrange
            String manufacturer = "testcorp";
            Pageable pageable = PageRequest.of(0, 10);

            List<Part> parts = new ArrayList<>();
            Part part1 = new Part();
            part1.setPartId(1L);
            part1.setPartName("Part 1");
            part1.setManufacturer("TestCorp");
            parts.add(part1);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 1);
            when(partRepository.findByManufacturerContainingIgnoreCase(manufacturer, pageable)).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getPartsByManufacturer(manufacturer, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(partRepository).findByManufacturerContainingIgnoreCase(manufacturer, pageable);
        }

        @Test
        @DisplayName("Should support partial manufacturer name matching")
        void getPartsByManufacturer_PartialMatch() {
            // Arrange
            String partialName = "Corp";
            Pageable pageable = PageRequest.of(0, 10);

            List<Part> parts = new ArrayList<>();
            Part part1 = new Part();
            part1.setPartId(1L);
            part1.setManufacturer("TestCorp");
            parts.add(part1);

            Part part2 = new Part();
            part2.setPartId(2L);
            part2.setManufacturer("AnotherCorp");
            parts.add(part2);

            Page<Part> partPage = new PageImpl<>(parts, pageable, 2);
            when(partRepository.findByManufacturerContainingIgnoreCase(partialName, pageable)).thenReturn(partPage);

            // Act
            PagedResponse<PartResponseDTO> result = partService.getPartsByManufacturer(partialName, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(p -> p.getManufacturer().contains("Corp"));
        }
    }
}
