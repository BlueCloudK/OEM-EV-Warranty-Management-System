package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.WorkLogMapper;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.WorkLogRepository;
import com.swp391.warrantymanagement.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service quản lý work logs (nhật ký công việc technician).
 * Theo dõi thời gian và công việc thực hiện cho warranty claims.
 */
@Service
@RequiredArgsConstructor
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final UserRepository userRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;

    /**
     * Lấy tất cả work logs với pagination.
     *
     * @param pageable pagination parameters
     * @return PagedResponse với work logs
     */
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

    /**
     * Lấy work log theo ID.
     *
     * @param id work log ID
     * @return WorkLogResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    public WorkLogResponseDTO getWorkLogById(Long id) {
        WorkLog workLog = workLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkLog", "id", id));

        return WorkLogMapper.toResponseDTO(workLog);
    }

    /**
     * Tạo work log mới với time validation.
     *
     * @param requestDTO thông tin work log
     * @param username username của technician
     * @return WorkLogResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy user hoặc claim
     * @throws IllegalArgumentException nếu endTime trước startTime
     */
    @Override
    @Transactional
    public WorkLogResponseDTO createWorkLog(WorkLogRequestDTO requestDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", requestDTO.getWarrantyClaimId()));

        if (requestDTO.getEndTime() != null && requestDTO.getStartTime() != null &&
            requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        WorkLog workLog = WorkLogMapper.toEntity(requestDTO, user, warrantyClaim);
        WorkLog savedWorkLog = workLogRepository.save(workLog);

        return WorkLogMapper.toResponseDTO(savedWorkLog);
    }

    /**
     * Cập nhật work log với time validation.
     *
     * @param id work log ID
     * @param requestDTO thông tin mới
     * @param username username của technician
     * @return WorkLogResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy work log, user hoặc claim
     * @throws IllegalArgumentException nếu endTime trước startTime
     */
    @Override
    @Transactional
    public WorkLogResponseDTO updateWorkLog(Long id, WorkLogRequestDTO requestDTO, String username) {
        WorkLog existingWorkLog = workLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkLog", "id", id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", requestDTO.getWarrantyClaimId()));

        if (requestDTO.getEndTime() != null && requestDTO.getStartTime() != null &&
            requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        WorkLogMapper.updateEntity(existingWorkLog, requestDTO, user, warrantyClaim);
        WorkLog updatedWorkLog = workLogRepository.save(existingWorkLog);

        return WorkLogMapper.toResponseDTO(updatedWorkLog);
    }

    /**
     * Xóa work log.
     *
     * @param id work log ID
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional
    public void deleteWorkLog(Long id) {
        if (!workLogRepository.existsById(id)) {
            throw new ResourceNotFoundException("WorkLog", "id", id);
        }

        workLogRepository.deleteById(id);
    }

    /**
     * Lấy work logs theo warranty claim.
     *
     * @param claimId warranty claim ID
     * @param pageable pagination parameters
     * @return PagedResponse với work logs của claim
     */
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

    /**
     * Lấy work logs theo user (technician).
     *
     * @param userId user ID
     * @param pageable pagination parameters
     * @return PagedResponse với work logs của technician
     */
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

    /**
     * Lấy work logs theo username.
     *
     * @param username username
     * @param pageable pagination parameters
     * @return PagedResponse với work logs của user
     * @throws ResourceNotFoundException nếu không tìm thấy user
     */
    @Override
    public PagedResponse<WorkLogResponseDTO> getWorkLogsByUsername(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return getWorkLogsByUser(user.getUserId(), pageable);
    }
}
