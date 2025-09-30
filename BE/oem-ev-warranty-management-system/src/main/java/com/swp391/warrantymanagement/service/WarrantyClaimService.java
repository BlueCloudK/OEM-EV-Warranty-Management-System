package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface WarrantyClaimService {
    WarrantyClaim getById(Long id);
    WarrantyClaim createWarrantyClaim(WarrantyClaim warrantyClaim);
    WarrantyClaim updateWarrantyClaim(WarrantyClaim warrantyClaim);
    void deleteWarrantyClaim(Long id);
    List<WarrantyClaim> getWarrantyClaims();
    void deleteWarrantyClaim(WarrantyClaim warrantyClaim);
    void saveWarrantyClaim(WarrantyClaim warrantyClaim);
    boolean existsById(Long id);
}
