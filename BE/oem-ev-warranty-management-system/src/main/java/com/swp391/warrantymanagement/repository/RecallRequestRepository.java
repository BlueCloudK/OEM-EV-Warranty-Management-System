package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.RecallRequest;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository để quản lý RecallRequest
 * - Thông báo triệu hồi từ EVM khi phát hiện lỗi hàng loạt
 * - Tự động tạo warranty claim cho các xe bị ảnh hưởng
 */
@Repository
public interface RecallRequestRepository extends JpaRepository<RecallRequest, Long> {
    // CRUD operations được cung cấp sẵn bởi JpaRepository
    // Có thể bổ sung custom queries nếu cần

    /**
     * Count recall campaigns by status.
     * Used for dashboard statistics.
     *
     * @param status The status to count
     * @return Number of campaigns with the given status
     */
    long countByStatus(RecallRequestStatus status);
}

