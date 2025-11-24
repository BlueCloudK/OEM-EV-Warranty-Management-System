package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request tạo/cập nhật Part Category.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartCategoryRequestDTO {

    /**
     * Tên danh mục phụ tùng.
     * <p>
     * Required, unique, 1-100 ký tự.
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 100, message = "Category name must be between 1 and 100 characters")
    private String categoryName;

    /**
     * Số lượng tối đa phụ tùng thuộc category này trên một xe.
     * <p>
     * Required, >= 1.
     */
    @NotNull(message = "Max quantity per vehicle is required")
    @Min(value = 1, message = "Max quantity must be at least 1")
    private Integer maxQuantityPerVehicle;

    /**
     * Mô tả chi tiết về category.
     * <p>
     * Optional, tối đa 500 ký tự.
     */
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    /**
     * Trạng thái hoạt động của category.
     * <p>
     * Default = true nếu không được cung cấp.
     */
    private Boolean isActive = true;
}
