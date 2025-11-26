package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartCategoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartCategoryResponseDTO;

import java.util.List;

/**
 * Service interface cho quản lý Part Categories.
 */
public interface PartCategoryService {

    /**
     * Lấy danh sách tất cả categories (bao gồm cả inactive) với pagination và sort.
     *
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return Page chứa danh sách categories
     */
    org.springframework.data.domain.Page<PartCategoryResponseDTO> getAllCategories(org.springframework.data.domain.Pageable pageable);

    /**
     * Lấy danh sách categories đang hoạt động (isActive = true).
     *
     * @return danh sách active categories
     */
    List<PartCategoryResponseDTO> getActiveCategories();

    /**
     * Lấy category theo ID.
     *
     * @param id category ID
     * @return category response DTO
     */
    PartCategoryResponseDTO getCategoryById(Long id);

    /**
     * Tạo category mới.
     *
     * @param requestDTO category data
     * @return created category
     */
    PartCategoryResponseDTO createCategory(PartCategoryRequestDTO requestDTO);

    /**
     * Cập nhật category.
     *
     * @param id category ID
     * @param requestDTO updated category data
     * @return updated category
     */
    PartCategoryResponseDTO updateCategory(Long id, PartCategoryRequestDTO requestDTO);

    /**
     * Soft delete category (set isActive = false).
     *
     * @param id category ID
     */
    void deleteCategory(Long id);
}
