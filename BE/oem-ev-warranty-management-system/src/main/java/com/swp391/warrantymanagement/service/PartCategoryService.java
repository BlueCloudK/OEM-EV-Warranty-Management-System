package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartCategoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartCategoryResponseDTO;

import java.util.List;

/**
 * Service interface cho quản lý Part Categories.
 */
public interface PartCategoryService {

    /**
     * Lấy danh sách tất cả categories (bao gồm cả inactive).
     *
     * @return danh sách tất cả categories
     */
    List<PartCategoryResponseDTO> getAllCategories();

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
