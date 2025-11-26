package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartCategoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartCategoryResponseDTO;
import com.swp391.warrantymanagement.entity.PartCategory;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.PartCategoryMapper;
import com.swp391.warrantymanagement.repository.PartCategoryRepository;
import com.swp391.warrantymanagement.service.PartCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation của PartCategoryService - Quản lý Part Categories.
 */
@Service
@RequiredArgsConstructor
public class PartCategoryServiceImpl implements PartCategoryService {

    private final PartCategoryRepository partCategoryRepository;

    /**
     * Lấy danh sách tất cả categories (active + inactive) với pagination và sort.
     *
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return Page chứa danh sách categories
     */
    @Override
    public org.springframework.data.domain.Page<PartCategoryResponseDTO> getAllCategories(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<PartCategory> categoryPage = partCategoryRepository.findAll(pageable);
        return categoryPage.map(PartCategoryMapper::toResponseDTO);
    }

    /**
     * Lấy danh sách categories đang hoạt động, sắp xếp theo tên.
     *
     * @return danh sách active categories
     */
    @Override
    public List<PartCategoryResponseDTO> getActiveCategories() {
        List<PartCategory> categories = partCategoryRepository.findByIsActiveTrueOrderByCategoryNameAsc();
        return PartCategoryMapper.toResponseDTOList(categories);
    }

    /**
     * Lấy category theo ID.
     *
     * @param id category ID
     * @return category response DTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    public PartCategoryResponseDTO getCategoryById(Long id) {
        PartCategory category = partCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartCategory", "id", id));
        return PartCategoryMapper.toResponseDTO(category);
    }

    /**
     * Tạo category mới.
     * Kiểm tra tên category không trùng lặp (case-insensitive).
     *
     * @param requestDTO category data
     * @return created category
     * @throws IllegalArgumentException nếu category name đã tồn tại
     */
    @Override
    @Transactional
    public PartCategoryResponseDTO createCategory(PartCategoryRequestDTO requestDTO) {
        // Kiểm tra tên category đã tồn tại chưa (case-insensitive)
        if (partCategoryRepository.existsByCategoryNameIgnoreCase(requestDTO.getCategoryName())) {
            throw new IllegalArgumentException(
                    String.format("Category name '%s' already exists", requestDTO.getCategoryName())
            );
        }

        PartCategory category = PartCategoryMapper.toEntity(requestDTO);
        PartCategory savedCategory = partCategoryRepository.save(category);

        return PartCategoryMapper.toResponseDTO(savedCategory);
    }

    /**
     * Cập nhật category.
     * Kiểm tra tên category không trùng với category khác (case-insensitive).
     *
     * @param id category ID
     * @param requestDTO updated category data
     * @return updated category
     * @throws ResourceNotFoundException nếu không tìm thấy category
     * @throws IllegalArgumentException nếu category name đã tồn tại
     */
    @Override
    @Transactional
    public PartCategoryResponseDTO updateCategory(Long id, PartCategoryRequestDTO requestDTO) {
        PartCategory existingCategory = partCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartCategory", "id", id));

        // Kiểm tra tên category mới có trùng với category khác không
        partCategoryRepository.findByCategoryNameIgnoreCase(requestDTO.getCategoryName())
                .ifPresent(category -> {
                    if (!category.getCategoryId().equals(id)) {
                        throw new IllegalArgumentException(
                                String.format("Category name '%s' already exists", requestDTO.getCategoryName())
                        );
                    }
                });

        PartCategoryMapper.updateEntity(existingCategory, requestDTO);
        PartCategory updatedCategory = partCategoryRepository.save(existingCategory);

        return PartCategoryMapper.toResponseDTO(updatedCategory);
    }

    /**
     * Soft delete category - đánh dấu isActive = false.
     * KHÔNG xóa thật để bảo toàn data integrity với các parts đã gán category này.
     *
     * @param id category ID
     * @throws ResourceNotFoundException nếu không tìm thấy category
     */
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        PartCategory category = partCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PartCategory", "id", id));

        category.setIsActive(false);
        partCategoryRepository.save(category);
    }
}
