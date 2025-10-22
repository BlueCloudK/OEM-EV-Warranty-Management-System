package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;
import com.swp391.warrantymanagement.mapper.WorkLogMapper;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.WorkLogRepository;
import com.swp391.warrantymanagement.service.WorkLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * WorkLogServiceImpl - Implementation of WorkLogService
 * Handles work log management for warranty claim processing
 */
@Service
public class WorkLogServiceImpl implements WorkLogService {
    @Autowired
    private WorkLogRepository workLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarrantyClaimRepository warrantyClaimRepository;

    @Override
    public PagedResponse<WorkLogResponseDTO> getAllWorkLogs(Pageable pageable) {
        Page<WorkLog> workLogPage = workLogRepository.findAll(pageable);
        List<WorkLogResponseDTO> responseDTOs = WorkLogMapper.toResponseDTOList(
            workLogPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            workLogPage.getNumber(),
            workLogPage.getSize(),
            workLogPage.getTotalElements(),
            workLogPage.getTotalPages(),
            workLogPage.isFirst(),
            workLogPage.isLast()
        );
    }

    @Override
    public WorkLogResponseDTO getWorkLogById(Long id) {
        WorkLog workLog = workLogRepository.findById(id).orElse(null);
        return WorkLogMapper.toResponseDTO(workLog);
    }

    @Override
    @Transactional
    public WorkLogResponseDTO createWorkLog(WorkLogRequestDTO requestDTO, Long userId) {
        // Validate User exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate Warranty Claim exists
        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
            .orElseThrow(() -> new RuntimeException("Warranty claim not found with id: " + requestDTO.getWarrantyClaimId()));

        // Validate end time is after start time
        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Convert DTO to Entity
        WorkLog workLog = WorkLogMapper.toEntity(requestDTO, user, warrantyClaim);

        // Save entity
        WorkLog savedWorkLog = workLogRepository.save(workLog);

        // Convert entity back to response DTO
        return WorkLogMapper.toResponseDTO(savedWorkLog);
    }

    @Override
    @Transactional
    public WorkLogResponseDTO updateWorkLog(Long id, WorkLogRequestDTO requestDTO, Long userId) {
        WorkLog existingWorkLog = workLogRepository.findById(id).orElse(null);
        if (existingWorkLog == null) {
            return null;
        }

        // Validate User exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate Warranty Claim exists
        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
            .orElseThrow(() -> new RuntimeException("Warranty claim not found with id: " + requestDTO.getWarrantyClaimId()));

        // Validate end time is after start time
        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Update entity from DTO
        WorkLogMapper.updateEntity(existingWorkLog, requestDTO, user, warrantyClaim);

        // Save updated entity
        WorkLog updatedWorkLog = workLogRepository.save(existingWorkLog);

        // Convert entity back to response DTO
        return WorkLogMapper.toResponseDTO(updatedWorkLog);
    }

    @Override
    @Transactional
    public boolean deleteWorkLog(Long id) {
        if (!workLogRepository.existsById(id)) {
            return false;
        }
        workLogRepository.deleteById(id);
        return true;
    }

    @Override
    public PagedResponse<WorkLogResponseDTO> getWorkLogsByWarrantyClaim(Long claimId, Pageable pageable) {
        Page<WorkLog> workLogPage = workLogRepository.findByWarrantyClaimWarrantyClaimId(claimId, pageable);
        List<WorkLogResponseDTO> responseDTOs = WorkLogMapper.toResponseDTOList(
            workLogPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            workLogPage.getNumber(),
            workLogPage.getSize(),
            workLogPage.getTotalElements(),
            workLogPage.getTotalPages(),
            workLogPage.isFirst(),
            workLogPage.isLast()
        );
    }

    @Override
    public PagedResponse<WorkLogResponseDTO> getWorkLogsByUser(Long userId, Pageable pageable) {
        Page<WorkLog> workLogPage = workLogRepository.findByUserUserId(userId, pageable);
        List<WorkLogResponseDTO> responseDTOs = WorkLogMapper.toResponseDTOList(
            workLogPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            workLogPage.getNumber(),
            workLogPage.getSize(),
            workLogPage.getTotalElements(),
            workLogPage.getTotalPages(),
            workLogPage.isFirst(),
            workLogPage.isLast()
        );
    }
}
