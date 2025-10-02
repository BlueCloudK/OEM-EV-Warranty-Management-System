package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class WarrantyClaimServiceImpl implements WarrantyClaimService {
    @Autowired
    private WarrantyClaimRepository warrantyClaimsRepository;

    @Override
    public WarrantyClaim getById(Long id) {
        return warrantyClaimsRepository.findById(id).orElse(null);
    }

    @Override
    public WarrantyClaim save(WarrantyClaim warrantyClaim) {
        return warrantyClaimsRepository.save(warrantyClaim);
    }

    @Override
    public void deleteById(Long id) {
        warrantyClaimsRepository.deleteById(id);
    }

    @Override
    public List<WarrantyClaim> getAll() {
        return warrantyClaimsRepository.findAll();
    }

    @Override
    public boolean existsById(Long id) {
        return warrantyClaimsRepository.existsById(id);
    }

    @Override
    public List<WarrantyClaim> getClaimsByStatus(WarrantyClaimStatus status) {
        return warrantyClaimsRepository.findByStatus(status);
    }

    @Override
    public List<WarrantyClaim> getClaimsByVehicleId(Long vehicleId) {
        return warrantyClaimsRepository.findByVehicleVehicleId(vehicleId);
    }

    @Override
    public WarrantyClaim updateClaimStatus(Long id, WarrantyClaimStatus status) {
        WarrantyClaim existingClaim = warrantyClaimsRepository.findById(id).orElse(null);
        if (existingClaim != null) {
            existingClaim.setStatus(status);
            if (status == WarrantyClaimStatus.COMPLETED) {
                existingClaim.setResolutionDate(new Date());
            }
            return warrantyClaimsRepository.save(existingClaim);
        }
        return null;
    }
}
