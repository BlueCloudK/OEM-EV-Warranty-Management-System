package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository để quản lý Customer
 * - Customer ID dùng UUID (bảo mật)
 * - Tìm theo tên, phone, userId
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    // Tìm customer theo tên (hỗ trợ tìm kiếm không phân biệt hoa thường)
    List<Customer> findByNameContainingIgnoreCase(String name);
    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Tìm customer theo số điện thoại (unique)
    Optional<Customer> findByPhone(String phone);

    // Tìm customer theo userId (1-1 relationship với User)
    Page<Customer> findByUserUserId(Long userId, Pageable pageable);

    // Kiểm tra User đã có Customer record chưa (1 User chỉ có 1 Customer)
    boolean existsByUserUserId(Long userId);

    // Custom query để tìm kiếm customer theo nhiều tiêu chí
    // Email không còn trong Customer entity, giờ email trong User entity
    @Query("SELECT c FROM Customer c WHERE " +
           "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Customer> findByName(@Param("name") String name);

    // Find customer by User entity (required for VehicleService)
    Customer findByUser(User user);

    /**
     * Tìm kiếm chung customer theo name, phone, hoặc email (case-insensitive).
     * Email được lấy từ User entity thông qua join.
     * Sử dụng COALESCE để xử lý null values an toàn.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param pageable Thông tin phân trang.
     * @return Một trang các Customer thỏa mãn điều kiện.
     */
    @Query("SELECT c FROM Customer c LEFT JOIN c.user u WHERE " +
            "LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Customer> searchCustomersGeneral(@Param("searchTerm") String searchTerm, Pageable pageable);
}
