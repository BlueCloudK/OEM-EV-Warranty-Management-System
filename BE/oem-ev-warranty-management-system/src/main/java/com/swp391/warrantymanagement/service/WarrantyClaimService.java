package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface WarrantyClaimService {
    // Core CRUD operations
    WarrantyClaim getById(Long id);
    WarrantyClaim save(WarrantyClaim warrantyClaim);
    void deleteById(Long id);
    List<WarrantyClaim> getAll();
    boolean existsById(Long id);

    // Business logic methods
    List<WarrantyClaim> getClaimsByStatus(WarrantyClaimStatus status);
    List<WarrantyClaim> getClaimsByVehicleId(Long vehicleId);
    WarrantyClaim updateClaimStatus(Long id, WarrantyClaimStatus status);
}
