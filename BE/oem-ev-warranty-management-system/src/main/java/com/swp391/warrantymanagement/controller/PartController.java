package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.PartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Part APIs.
 * Handles CRUD operations for parts using DTOs only.
 */
@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    @Autowired private PartService partService;

    // Get all parts with pagination
    @GetMapping
    public ResponseEntity<PagedResponse<PartResponseDTO>> getAllParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PartResponseDTO> partsPage = partService.getAllPartsPage(PageRequest.of(page, size));
        return ResponseEntity.ok(partsPage);
    }

    // Get part by ID
    @GetMapping("/{id}")
    public ResponseEntity<PartResponseDTO> getPartById(@PathVariable String id) {
        PartResponseDTO part = partService.getPartById(id);
        if (part != null) {
            return ResponseEntity.ok(part);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new part
    @PostMapping
    public ResponseEntity<PartResponseDTO> createPart(@Valid @RequestBody PartRequestDTO requestDTO) {
        PartResponseDTO responseDTO = partService.createPart(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update part
    @PutMapping("/{id}")
    public ResponseEntity<PartResponseDTO> updatePart(@PathVariable String id,
                                                     @Valid @RequestBody PartRequestDTO requestDTO) {
        PartResponseDTO updatedPart = partService.updatePart(id, requestDTO);
        if (updatedPart != null) {
            return ResponseEntity.ok(updatedPart);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete part
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable String id) {
        boolean deleted = partService.deletePart(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
