package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Service History APIs.
 * Handles CRUD operations for service histories using DTOs only.
 */
@RestController
@RequestMapping("api/service-histories")
@CrossOrigin
public class ServiceHistoryController {
    @Autowired private ServiceHistoryService serviceHistoryService;

    // Get all service histories with pagination
    @GetMapping
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getAllServiceHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getAllServiceHistoriesPage(PageRequest.of(page, size));
        return ResponseEntity.ok(historiesPage);
    }

    // Get service history by ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceHistoryResponseDTO> getServiceHistoryById(@PathVariable Long id) {
        ServiceHistoryResponseDTO history = serviceHistoryService.getServiceHistoryById(id);
        if (history != null) {
            return ResponseEntity.ok(history);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new service history
    @PostMapping
    public ResponseEntity<ServiceHistoryResponseDTO> createServiceHistory(@Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        ServiceHistoryResponseDTO responseDTO = serviceHistoryService.createServiceHistory(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update service history
    @PutMapping("/{id}")
    public ResponseEntity<ServiceHistoryResponseDTO> updateServiceHistory(@PathVariable Long id,
                                                                        @Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        ServiceHistoryResponseDTO updatedHistory = serviceHistoryService.updateServiceHistory(id, requestDTO);
        if (updatedHistory != null) {
            return ResponseEntity.ok(updatedHistory);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete service history
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceHistory(@PathVariable Long id) {
        boolean deleted = serviceHistoryService.deleteServiceHistory(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
