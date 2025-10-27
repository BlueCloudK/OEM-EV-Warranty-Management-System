package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.RecallRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecallRequestRepository extends JpaRepository<RecallRequest, Long> {
    // Có thể bổ sung các hàm truy vấn tùy ý
}

