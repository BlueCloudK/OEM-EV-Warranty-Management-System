package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * PublicController - Public endpoints không cần authentication
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final ServiceCenterService serviceCenterService;

    /**
     * Get all service centers (PUBLIC - không cần login)
     * GET /api/public/service-centers?page=0&size=10&sortBy=serviceCenterName&sortDir=ASC
     */
    @GetMapping("/service-centers")
    public ResponseEntity<PagedResponse<ServiceCenterResponseDTO>> getAllServiceCenters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceCenterId") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceCenterResponseDTO> response = serviceCenterService.getAllServiceCenters(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get service center by ID (PUBLIC - không cần login)
     * GET /api/public/service-centers/{id}
     */
    @GetMapping("/service-centers/{id}")
    public ResponseEntity<ServiceCenterResponseDTO> getServiceCenterById(@PathVariable Long id) {
        ServiceCenterResponseDTO response = serviceCenterService.getServiceCenterById(id);
        return ResponseEntity.ok(response);
    }
}
