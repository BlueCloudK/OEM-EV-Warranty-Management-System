package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartCategoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartCategoryResponseDTO;
import com.swp391.warrantymanagement.service.PartCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho quản lý Part Categories.
 * <p>
 * <strong>Endpoints:</strong>
 * <ul>
 *     <li>GET /api/part-categories - Lấy tất cả categories</li>
 *     <li>GET /api/part-categories/active - Lấy categories đang hoạt động</li>
 *     <li>GET /api/part-categories/{id} - Lấy category theo ID</li>
 *     <li>POST /api/part-categories - Tạo category mới (Admin)</li>
 *     <li>PUT /api/part-categories/{id} - Cập nhật category (Admin)</li>
 *     <li>DELETE /api/part-categories/{id} - Soft delete category (Admin)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/part-categories")
@RequiredArgsConstructor
public class PartCategoryController {

    private final PartCategoryService partCategoryService;

    /**
     * Lấy danh sách tất cả part categories (bao gồm cả inactive).
     * <p>
     * <strong>Use case:</strong> Admin xem tất cả categories để quản lý
     *
     * @return danh sách tất cả categories
     */
    @GetMapping
    public ResponseEntity<List<PartCategoryResponseDTO>> getAllCategories() {
        List<PartCategoryResponseDTO> categories = partCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Lấy danh sách part categories đang hoạt động (isActive = true).
     * <p>
     * <strong>Use case:</strong> Dropdown/select khi tạo/cập nhật Part
     *
     * @return danh sách active categories
     */
    @GetMapping("/active")
    public ResponseEntity<List<PartCategoryResponseDTO>> getActiveCategories() {
        List<PartCategoryResponseDTO> categories = partCategoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Lấy part category theo ID.
     *
     * @param id category ID
     * @return category details
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartCategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        PartCategoryResponseDTO category = partCategoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Tạo part category mới.
     * <p>
     * <strong>Access:</strong> Admin only
     * <p>
     * <strong>Validation:</strong>
     * - Category name không được trùng (case-insensitive)
     * - Max quantity >= 1
     *
     * @param requestDTO category data
     * @return created category
     */
    @PostMapping
    public ResponseEntity<PartCategoryResponseDTO> createCategory(
            @Valid @RequestBody PartCategoryRequestDTO requestDTO) {
        PartCategoryResponseDTO createdCategory = partCategoryService.createCategory(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    /**
     * Cập nhật part category.
     * <p>
     * <strong>Access:</strong> Admin only
     * <p>
     * <strong>Note:</strong> Việc thay đổi maxQuantityPerVehicle sẽ ảnh hưởng đến
     * validation khi lắp part mới, nhưng KHÔNG ảnh hưởng đến parts đã lắp.
     *
     * @param id category ID
     * @param requestDTO updated category data
     * @return updated category
     */
    @PutMapping("/{id}")
    public ResponseEntity<PartCategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody PartCategoryRequestDTO requestDTO) {
        PartCategoryResponseDTO updatedCategory = partCategoryService.updateCategory(id, requestDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * Soft delete part category (set isActive = false).
     * <p>
     * <strong>Access:</strong> Admin only
     * <p>
     * <strong>Note:</strong> Soft delete để bảo toàn data integrity.
     * Parts đã gán category này vẫn giữ nguyên reference.
     *
     * @param id category ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        partCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
