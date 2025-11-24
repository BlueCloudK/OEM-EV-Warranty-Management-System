package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.PartCategory;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.InstalledPartMapper;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.InstalledPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
     * Chỉ trả về những installed parts đang hoạt động (isActive = true).
     *
     * @param pageable pagination parameters
     * @return paged response of active installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getAllInstalledParts(Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByIsActiveTrue(pageable);
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

        // Validate part category limit (if part has category)
        validatePartCategoryLimit(vehicle.getVehicleId(), part);

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

        // Validate category limit nếu đổi part hoặc vehicle
        boolean isChangingPart = !existingInstalledPart.getPart().getPartId().equals(part.getPartId());
        boolean isChangingVehicle = !existingInstalledPart.getVehicle().getVehicleId().equals(vehicle.getVehicleId());

        if (isChangingPart || isChangingVehicle) {
            validatePartCategoryLimit(vehicle.getVehicleId(), part);
        }

        InstalledPartMapper.updateEntity(existingInstalledPart, requestDTO, part, vehicle);
        InstalledPart updatedInstalledPart = installedPartRepository.save(existingInstalledPart);

        return InstalledPartMapper.toResponseDTO(updatedInstalledPart);
    }

    /**
     * Xóa mềm (soft delete) installed part - đánh dấu là không hoạt động thay vì xóa thật.
     * <p>
     * <strong>Lý do dùng Soft Delete:</strong>
     * <ul>
     *     <li>Bảo toàn dữ liệu lịch sử và tính toàn vẹn của database</li>
     *     <li>Tránh lỗi foreign key constraint với WarrantyClaim và các bảng liên quan</li>
     *     <li>Cho phép khôi phục (restore) nếu cần</li>
     *     <li>InstalledPart bị soft delete sẽ không thể tạo warranty claim mới</li>
     * </ul>
     *
     * @param id installed part ID
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional
    public void deleteInstalledPart(Long id) {
        InstalledPart installedPart = installedPartRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", id));

        // Soft delete: đánh dấu là không hoạt động
        installedPart.setIsActive(false);
        installedPart.setRemovedAt(LocalDateTime.now());
        installedPartRepository.save(installedPart);
    }

    /**
     * Lấy installed parts theo vehicle ID (lịch sử parts của xe).
     * Chỉ trả về những installed parts đang hoạt động (isActive = true).
     *
     * @param vehicleId vehicle ID
     * @param pageable pagination parameters
     * @return paged response of active installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByVehicle(Long vehicleId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByVehicleVehicleIdAndIsActiveTrue(vehicleId, pageable);
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
     * Chỉ trả về những installed parts đang hoạt động (isActive = true).
     *
     * @param partId part ID
     * @param pageable pagination parameters
     * @return paged response of active installed parts
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByPart(Long partId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByPartPartIdAndIsActiveTrue(partId, pageable);
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
     * Chỉ trả về những installed parts đang hoạt động (isActive = true).
     *
     * @param daysFromNow số ngày từ hôm nay (0 = đã expired, 30 = hết hạn trong 30 ngày)
     * @param pageable pagination parameters
     * @return paged response of active parts với warranty sắp hết hạn
     */
    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsWithExpiringWarranty(
            int daysFromNow, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

        Page<InstalledPart> installedPartPage = installedPartRepository.findByWarrantyExpirationDateBetweenAndIsActiveTrue(
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

    /**
     * Validate giới hạn số lượng parts theo category trước khi lắp đặt.
     * <p>
     * <strong>Business Logic:</strong>
     * <ul>
     *     <li>Nếu part KHÔNG có category (partCategory = NULL) → Không giới hạn, cho phép thêm</li>
     *     <li>Nếu part CÓ category → Kiểm tra số lượng đã lắp đặt của category đó trên xe</li>
     *     <li>Nếu đã đạt giới hạn {@code maxQuantityPerVehicle} → Throw exception</li>
     * </ul>
     * <p>
     * <strong>Example:</strong>
     * <pre>
     * Category "Động cơ điện" có maxQuantity = 1
     * Xe đã lắp: Motor Type A (category = "Động cơ điện")
     * → Không thể lắp thêm Motor Type B (cùng category)
     * </pre>
     *
     * @param vehicleId ID của xe
     * @param part Part cần kiểm tra
     * @throws IllegalArgumentException nếu vượt quá giới hạn category
     */
    private void validatePartCategoryLimit(Long vehicleId, Part part) {
        PartCategory category = part.getPartCategory();

        // Nếu part không có category → không giới hạn số lượng
        if (category == null) {
            return;
        }

        // Kiểm tra category có active không
        if (!category.getIsActive()) {
            throw new IllegalArgumentException(
                String.format("Part category '%s' is not active and cannot be used",
                    category.getCategoryName())
            );
        }

        // Đếm số lượng parts cùng category đã lắp trên xe (chỉ đếm active parts)
        long currentCount = installedPartRepository.countByVehicleIdAndPartCategoryIdAndIsActiveTrue(
            vehicleId,
            category.getCategoryId()
        );

        // Kiểm tra giới hạn
        int maxQuantity = category.getMaxQuantityPerVehicle();
        if (currentCount >= maxQuantity) {
            throw new IllegalArgumentException(
                String.format("Xe đã đạt giới hạn cho loại phụ tùng '%s'. " +
                        "Số lượng tối đa: %d, Hiện tại: %d. " +
                        "Vui lòng xóa phụ tùng cũ trước khi lắp phụ tùng mới cùng loại.",
                    category.getCategoryName(),
                    maxQuantity,
                    currentCount)
            );
        }
    }
}
