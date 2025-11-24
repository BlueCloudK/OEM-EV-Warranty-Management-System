package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho Danh mục Phụ tùng (Part Category).
 * <p>
 * <strong>Mục đích & Thiết kế:</strong>
 * <ul>
 *     <li>Quản lý phân loại các loại phụ tùng theo chức năng/vị trí (VD: Động cơ, Pin, Bánh xe, ...)</li>
 *     <li>Định nghĩa giới hạn số lượng tối đa cho mỗi loại phụ tùng trên một xe</li>
 *     <li>Cho phép admin tự do thêm/sửa/xóa mềm các category qua UI mà không cần sửa code</li>
 *     <li>Hỗ trợ kiểm soát nghiệp vụ: ngăn chặn việc lắp đặt quá nhiều phụ tùng cùng loại</li>
 * </ul>
 * <p>
 * <strong>Business Logic:</strong>
 * <ul>
 *     <li>Nếu {@code Part.partCategory = NULL} → Không giới hạn số lượng</li>
 *     <li>Nếu {@code Part.partCategory != NULL} → Kiểm tra {@code maxQuantityPerVehicle}</li>
 * </ul>
 */
@Entity
@Table(name = "part_categories")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"parts"})
public class PartCategory {

    /**
     * Khóa chính của danh mục phụ tùng.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    @EqualsAndHashCode.Include
    private Long categoryId;

    /**
     * Tên danh mục phụ tùng.
     * <p>
     * <strong>Ví dụ:</strong> "Động cơ điện", "Pin/Ắc quy", "Bánh xe", "Hệ thống phanh"
     * <p>
     * <strong>Unique constraint:</strong> Đảm bảo không có category trùng tên
     */
    @Column(name = "category_name", nullable = false, length = 100, unique = true, columnDefinition = "nvarchar(100)")
    private String categoryName;

    /**
     * Số lượng tối đa phụ tùng thuộc category này được phép lắp trên một xe.
     * <p>
     * <strong>Ví dụ:</strong>
     * <ul>
     *     <li>Động cơ điện: 1</li>
     *     <li>Pin: 1</li>
     *     <li>Bánh xe: 4</li>
     *     <li>Má phanh: 4</li>
     *     <li>Đèn pha: 2</li>
     * </ul>
     * <p>
     * <strong>Default = 1:</strong> Hầu hết các phụ tùng quan trọng chỉ có 1 trên xe
     */
    @Column(name = "max_quantity_per_vehicle", nullable = false)
    private Integer maxQuantityPerVehicle = 1;

    /**
     * Mô tả chi tiết về danh mục.
     * <p>
     * <strong>Ví dụ:</strong> "Bao gồm các loại động cơ điện chính của xe, không bao gồm động cơ phụ trợ"
     */
    @Column(name = "description", length = 500, columnDefinition = "nvarchar(500)")
    private String description;

    /**
     * Trạng thái hoạt động của category (soft delete).
     * <p>
     * <strong>Business Logic:</strong>
     * <ul>
     *     <li>{@code true}: Category đang hoạt động, có thể gán cho parts mới</li>
     *     <li>{@code false}: Category đã bị vô hiệu hóa (soft delete), không hiển thị trong UI nhưng vẫn giữ data cũ</li>
     * </ul>
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Danh sách các phụ tùng thuộc category này.
     * <p>
     * <strong>Thiết kế an toàn:</strong> Không sử dụng {@code CascadeType.REMOVE}.
     * Khi xóa category (soft delete), các parts hiện có vẫn giữ nguyên (chỉ set category = NULL nếu cần).
     */
    @OneToMany(mappedBy = "partCategory")
    private List<Part> parts = new ArrayList<>();
}
