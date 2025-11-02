package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.WorkLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * WorkLogController - REST API for WorkLog management
 * Business Rules:
 * - EVM Staff logs work performed on warranty claims
 * - Work logs track time spent and actions taken on claims
 */
@RestController
@RequestMapping("api/work-logs")
@CrossOrigin
public class WorkLogController {
    private static final Logger logger = LoggerFactory.getLogger(WorkLogController.class);
    @Autowired
    private WorkLogService workLogService;

    // Get all work logs (ADMIN/EVM_STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getAllWorkLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all work logs request: page={}, size={}", page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getAllWorkLogs(PageRequest.of(page, size));
        logger.info("Get all work logs success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    // Get work log by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<WorkLogResponseDTO> getWorkLogById(@PathVariable Long id) {
        logger.info("Get work log by id: {}", id);
        WorkLogResponseDTO workLog = workLogService.getWorkLogById(id);
        if (workLog != null) {
            logger.info("Work log found: {}", id);
            return ResponseEntity.ok(workLog);
        }
        logger.warn("Work log not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new work log (EVM Staff logs work on claim)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<WorkLogResponseDTO> createWorkLog(
            @Valid @RequestBody WorkLogRequestDTO requestDTO,
            Authentication authentication) {
        logger.info("Create work log request: {}", requestDTO);
        try {
            // Get current user ID from authentication
            Long userId = getCurrentUserId(authentication);

            WorkLogResponseDTO responseDTO = workLogService.createWorkLog(requestDTO, userId);
            logger.info("Work log created: {}", responseDTO.getWorkLogId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            logger.error("Create work log failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update work log
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<WorkLogResponseDTO> updateWorkLog(
            @PathVariable Long id,
            @Valid @RequestBody WorkLogRequestDTO requestDTO,
            Authentication authentication) {
        logger.info("Update work log request: id={}, data={}", id, requestDTO);
        try {
            // Get current user ID from authentication
            Long userId = getCurrentUserId(authentication);

            WorkLogResponseDTO updatedWorkLog = workLogService.updateWorkLog(id, requestDTO, userId);
            if (updatedWorkLog != null) {
                logger.info("Work log updated: {}", id);
                return ResponseEntity.ok(updatedWorkLog);
            }
            logger.warn("Work log not found for update: {}", id);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            logger.error("Update work log failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete work log
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkLog(@PathVariable Long id) {
        logger.info("Delete work log request: {}", id);
        boolean deleted = workLogService.deleteWorkLog(id);
        if (deleted) {
            logger.info("Work log deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Work log not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Get work logs by warranty claim ID
    @GetMapping("/by-claim/{claimId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getWorkLogsByWarrantyClaim(
            @PathVariable Long claimId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get work logs by claimId: {}, page={}, size={}", claimId, page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getWorkLogsByWarrantyClaim(claimId, PageRequest.of(page, size));
        logger.info("Get work logs by claimId success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    // Get work logs by user ID (my work logs)
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getWorkLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get work logs by userId: {}, page={}, size={}", userId, page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getWorkLogsByUser(userId, PageRequest.of(page, size));
        logger.info("Get work logs by userId success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    // Helper method to get current user ID from authentication
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            // Extract user ID from UserDetails username
            String username = ((UserDetails) principal).getUsername();

            // Try to parse username as Long (if username is the user ID)
            try {
                return Long.parseLong(username);
            } catch (NumberFormatException e) {
                // If username is not a number, return a default test ID for now
                // In production, you should fetch user from database by username
                logger.warn("Could not parse username as ID: {}, using default ID 1", username);
                return 1L; // Default user ID for testing
            }
        }

        throw new RuntimeException("Invalid authentication principal");
    }
}
