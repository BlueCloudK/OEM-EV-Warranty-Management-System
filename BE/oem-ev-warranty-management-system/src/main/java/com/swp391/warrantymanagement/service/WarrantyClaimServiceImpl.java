package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarrantyClaimServiceImpl implements WarrantyClaimService {

    @Autowired // nay là dùng reflection để tự động inject cái WarrantyClaimRepository vào đây
    private WarrantyClaimRepository warrantyClaimsRepository;

    @Override
    public WarrantyClaim getById(Long id) {
        return warrantyClaimsRepository.findById(id).orElse(null);
    }

    @Override
    public WarrantyClaim createWarrantyClaim(WarrantyClaim warrantyClaim) {
        return warrantyClaimsRepository.save(warrantyClaim);
    }

    @Override
    public WarrantyClaim updateWarrantyClaim(WarrantyClaim warrantyClaim) {
        WarrantyClaim existingClaim = warrantyClaimsRepository.findById(warrantyClaim.getWarrantyClaimId()).orElse(null);
        if (existingClaim != null) {
            return warrantyClaimsRepository.save(warrantyClaim);
        }
        return null;
    }

    @Override
    public void deleteWarrantyClaim(Long id) {
        warrantyClaimsRepository.deleteById(id);
    }

    @Override
    public List<WarrantyClaim> getWarrantyClaims() {
        return warrantyClaimsRepository.findAll();
    }
}
