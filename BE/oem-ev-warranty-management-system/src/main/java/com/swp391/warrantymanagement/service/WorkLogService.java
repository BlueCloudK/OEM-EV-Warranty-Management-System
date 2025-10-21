package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * WorkLogService - Business logic for WorkLog management
 * EVM Staff logs work performed on warranty claims
 */
public interface WorkLogService {
    // ============= CRUD Operations =============
    WorkLogResponseDTO getWorkLogById(Long id);
    WorkLogResponseDTO createWorkLog(WorkLogRequestDTO requestDTO, Long userId);
    WorkLogResponseDTO updateWorkLog(Long id, WorkLogRequestDTO requestDTO, Long userId);
    boolean deleteWorkLog(Long id);

    // ============= Search Operations with Pagination =============
    PagedResponse<WorkLogResponseDTO> getAllWorkLogs(Pageable pageable);
    PagedResponse<WorkLogResponseDTO> getWorkLogsByWarrantyClaim(Long claimId, Pageable pageable);
    PagedResponse<WorkLogResponseDTO> getWorkLogsByUser(Long userId, Pageable pageable);
}
