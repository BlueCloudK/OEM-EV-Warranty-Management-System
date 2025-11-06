package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.InstalledPartMapper;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.InstalledPartService;import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation của InstalledPartService - Quản lý lắp đặt phụ tùng trên vehicle và theo dõi warranty.
 * <p>
 * <strong>Đặc điểm chính:</strong>
 * <ul>
 *     <li>Tạo / cập nhật / xóa / truy vấn InstalledPart</li>
 *     <li>Validate ngày bảo hành và liên kết Part ↔ Vehicle</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class InstalledPartServiceImpl implements InstalledPartService {
    private final InstalledPartRepository installedPartRepository;
    private final PartRepository partRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Lấy tất cả installed parts với pagination.
     *
     * @param pageable pagination parameters
     * @return paged response of installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getAllInstalledParts(Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findAll(pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    /**
     * Lấy installed part theo ID.
     *
     * @param id installed part ID
     * @return installed part response DTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    public InstalledPartResponseDTO getInstalledPartById(Long id) {
        InstalledPart installedPart = installedPartRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", id));
        return InstalledPartMapper.toResponseDTO(installedPart);
    }

    /**
     * Tạo installed part mới khi lắp đặt part vào vehicle.
     * Warranty expiration date phải sau installation date.
     *
     * @param requestDTO installed part request data
     * @return created installed part
     * @throws ResourceNotFoundException nếu part hoặc vehicle không tồn tại
     * @throws IllegalArgumentException nếu warranty expiration date không hợp lệ
     */
    @Override
    @Transactional
    public InstalledPartResponseDTO createInstalledPart(InstalledPartRequestDTO requestDTO) {
        Part part = partRepository.findById(requestDTO.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", requestDTO.getPartId()));

        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        // Warranty expiration date phải sau installation date
        if (!requestDTO.getWarrantyExpirationDate().isAfter(requestDTO.getInstallationDate())) {
            throw new IllegalArgumentException("Warranty expiration date must be after installation date");
        }

        InstalledPart installedPart = InstalledPartMapper.toEntity(requestDTO, part, vehicle);
        InstalledPart savedInstalledPart = installedPartRepository.save(installedPart);

        return InstalledPartMapper.toResponseDTO(savedInstalledPart);
    }

    /**
     * Cập nhật installed part (có thể đổi part, vehicle, hoặc dates).
     *
     * @param id installed part ID
     * @param requestDTO updated data
     * @return updated installed part
     * @throws ResourceNotFoundException nếu installed part, part hoặc vehicle không tồn tại
     * @throws IllegalArgumentException nếu warranty expiration date không hợp lệ
     */
    @Override
    @Transactional
    public InstalledPartResponseDTO updateInstalledPart(Long id, InstalledPartRequestDTO requestDTO) {
        InstalledPart existingInstalledPart = installedPartRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", id));

        Part part = partRepository.findById(requestDTO.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", requestDTO.getPartId()));

        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        if (!requestDTO.getWarrantyExpirationDate().isAfter(requestDTO.getInstallationDate())) {
            throw new IllegalArgumentException("Warranty expiration date must be after installation date");
        }

        InstalledPartMapper.updateEntity(existingInstalledPart, requestDTO, part, vehicle);
        InstalledPart updatedInstalledPart = installedPartRepository.save(existingInstalledPart);

        return InstalledPartMapper.toResponseDTO(updatedInstalledPart);
    }

    /**
     * Xóa installed part record (hard delete).
     *
     * @param id installed part ID
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional
    public void deleteInstalledPart(Long id) {
        if (!installedPartRepository.existsById(id)) {
            throw new ResourceNotFoundException("InstalledPart", "id", id);
        }
        installedPartRepository.deleteById(id);
    }

    /**
     * Lấy installed parts theo vehicle ID (lịch sử parts của xe).
     *
     * @param vehicleId vehicle ID
     * @param pageable pagination parameters
     * @return paged response of installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByVehicle(Long vehicleId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByVehicleVehicleId(vehicleId, pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    /**
     * Lấy installed parts theo part ID (tracking installations của part type).
     * Use case: Quality control, recall management, inventory analysis.
     *
     * @param partId part ID
     * @param pageable pagination parameters
     * @return paged response of installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByPart(Long partId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByPartPartId(partId, pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    /**
     * Lấy installed parts có warranty sắp hết hạn trong N ngày.
     * Use case: Proactive notification, expired warranty tracking, dashboard metrics.
     *
     * @param daysFromNow số ngày từ hôm nay (0 = đã expired, 30 = hết hạn trong 30 ngày)
     * @param pageable pagination parameters
     * @return paged response of parts với warranty sắp hết hạn
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsWithExpiringWarranty(
            int daysFromNow, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

        Page<InstalledPart> installedPartPage = installedPartRepository.findByWarrantyExpirationDateBetween(
            today, cutoffDate, pageable);

        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }
}
