package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.exception.DuplicateResourceException;
import com.swp391.warrantymanagement.exception.ResourceInUseException;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.PartMapper;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.service.PartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartServiceImpl implements PartService {

    private final PartRepository partRepository;
    private final InstalledPartRepository installedPartRepository;

    /**
     * Lấy danh sách parts với pagination và search
     *
     * @param pageable thông tin phân trang
     * @param search từ khóa tìm kiếm theo tên hoặc manufacturer (optional)
     * @return PagedResponse với danh sách PartResponseDTO
     */
    @Override
    public PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search) {
        Page<Part> partPage;

        if (search != null && !search.trim().isEmpty()) {
            partPage = partRepository.findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
                search, search, pageable);
        } else {
            partPage = partRepository.findAll(pageable);
        }

        List<PartResponseDTO> responseDTOs = PartMapper.toResponseDTOList(partPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            partPage.getNumber(),
            partPage.getSize(),
            partPage.getTotalElements(),
            partPage.getTotalPages(),
            partPage.isFirst(),
            partPage.isLast()
        );
    }

    /**
     * Lấy part theo ID
     *
     * @param id ID của part
     * @return PartResponseDTO
     * @throws ResourceNotFoundException nếu part không tồn tại
     */
    @Override
    public PartResponseDTO getPartById(Long id) {
        Part part = partRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id.toString()));
        return PartMapper.toResponseDTO(part);
    }

    /**
     * Tạo part mới
     *
     * @param requestDTO chứa thông tin part
     * @return PartResponseDTO
     * @throws DuplicateResourceException nếu partNumber đã tồn tại
     */
    @Override
    @Transactional
    public PartResponseDTO createPart(PartRequestDTO requestDTO) {
        partRepository.findByPartNumber(requestDTO.getPartNumber()).ifPresent(part -> {
            throw new DuplicateResourceException("Part", "partNumber", requestDTO.getPartNumber());
        });

        Part part = PartMapper.toEntity(requestDTO);
        Part savedPart = partRepository.save(part);

        return PartMapper.toResponseDTO(savedPart);
    }

    /**
     * Cập nhật part
     *
     * @param id ID của part
     * @param requestDTO chứa thông tin cập nhật
     * @return PartResponseDTO
     * @throws ResourceNotFoundException nếu part không tồn tại
     * @throws DuplicateResourceException nếu partNumber mới đã được sử dụng
     */
    @Override
    @Transactional
    public PartResponseDTO updatePart(Long id, PartRequestDTO requestDTO) {
        Part existingPart = partRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id.toString()));

        if (!existingPart.getPartNumber().equals(requestDTO.getPartNumber())) {
            partRepository.findByPartNumber(requestDTO.getPartNumber()).ifPresent(part -> {
                throw new DuplicateResourceException("Part", "partNumber", requestDTO.getPartNumber());
            });
        }

        PartMapper.updateEntity(existingPart, requestDTO);
        Part updatedPart = partRepository.save(existingPart);

        return PartMapper.toResponseDTO(updatedPart);
    }

    /**
     * Xóa part
     *
     * @param id ID của part
     * @throws ResourceNotFoundException nếu part không tồn tại
     * @throws ResourceInUseException nếu part đang được sử dụng trong InstalledPart
     */
    @Override
    @Transactional
    public void deletePart(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id.toString()));

        boolean isInUse = installedPartRepository.existsByPart_PartId(id);
        if (isInUse) {
            throw new ResourceInUseException(
                String.format("Cannot delete Part with ID %d because it is currently in use by one or more installed parts.", id)
            );
        }

        partRepository.delete(part);
    }

    /**
     * Lấy danh sách parts theo manufacturer với pagination
     *
     * @param manufacturer tên manufacturer (case-insensitive)
     * @param pageable thông tin phân trang
     * @return PagedResponse với danh sách PartResponseDTO
     */
    @Override
    public PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable) {
        Page<Part> partPage = partRepository.findByManufacturerContainingIgnoreCase(manufacturer, pageable);

        List<PartResponseDTO> responseDTOs = PartMapper.toResponseDTOList(partPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            partPage.getNumber(),
            partPage.getSize(),
            partPage.getTotalElements(),
            partPage.getTotalPages(),
            partPage.isFirst(),
            partPage.isLast()
        );
    }
}
