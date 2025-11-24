package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.PartCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho {@link PartCategory}.
 * <p>
 * Cung cấp các phương thức truy vấn danh mục phụ tùng.
 */
@Repository
public interface PartCategoryRepository extends JpaRepository<PartCategory, Long> {

    /**
     * Tìm category theo tên (case-insensitive).
     *
     * @param categoryName tên category cần tìm
     * @return Optional chứa category nếu tìm thấy
     */
    Optional<PartCategory> findByCategoryNameIgnoreCase(String categoryName);

    /**
     * Kiểm tra xem category name đã tồn tại chưa (case-insensitive).
     *
     * @param categoryName tên category cần kiểm tra
     * @return true nếu đã tồn tại, false nếu chưa
     */
    boolean existsByCategoryNameIgnoreCase(String categoryName);

    /**
     * Lấy danh sách tất cả categories đang hoạt động.
     *
     * @return danh sách categories có isActive = true
     */
    List<PartCategory> findByIsActiveTrueOrderByCategoryNameAsc();

    /**
     * Lấy tất cả categories (cả active và inactive).
     *
     * @return danh sách tất cả categories
     */
    @Query("SELECT pc FROM PartCategory pc ORDER BY pc.isActive DESC, pc.categoryName ASC")
    List<PartCategory> findAllOrderedByActiveAndName();
}
