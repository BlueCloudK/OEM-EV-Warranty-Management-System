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

    // custom method
//    WarrantyClaim addWarrantyClaim(WarrantyClaim claim);
//    WarrantyClaim editWarrantyClaim(WarrantyClaim claim);
//    WarrantyClaim removeWarrantyClaim(Long id);
//    List<WarrantyClaim> getByVehicleId(Long vehicleId);
}
