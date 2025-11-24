package com.swp391.warrantymanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho response Part Category.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartCategoryResponseDTO {

    /**
     * ID của category.
     */
    private Long categoryId;

    /**
     * Tên danh mục phụ tùng.
     */
    private String categoryName;

    /**
     * Số lượng tối đa phụ tùng thuộc category này trên một xe.
     */
    private Integer maxQuantityPerVehicle;

    /**
     * Mô tả chi tiết về category.
     */
    private String description;

    /**
     * Trạng thái hoạt động của category.
     */
    private Boolean isActive;

    /**
     * Số lượng parts hiện đang thuộc category này.
     * <p>
     * Dùng để hiển thị thông tin thống kê cho admin.
     */
    private Long partCount;
}
