package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.WarrantyClaims;
import com.swp391.warrantymanagement.repository.WarrantyClaimsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarrantyClaimsServiceImpl implements WarrantyClaimsService {

    @Autowired // nay là dùng reflection để tự động inject cái WarrantyClaimsRepository vào đây
    private WarrantyClaimsRepository warrantyClaimsRepository;

    @Override
    public WarrantyClaims getById(int id) {
        return warrantyClaimsRepository.findById(id).orElse(null);
    }

    @Override
    public WarrantyClaims createWarrantyClaim(WarrantyClaims warrantyClaim) {
        return warrantyClaimsRepository.save(warrantyClaim);
    }

    @Override
    public WarrantyClaims updateWarrantyClaim(WarrantyClaims warrantyClaim) {
        WarrantyClaims existingClaim = warrantyClaimsRepository.findById(warrantyClaim.getWarrantyClaimId()).orElse(null);
        if (existingClaim != null) {
            return warrantyClaimsRepository.save(warrantyClaim);
        }
        return null;
    }

    @Override
    public void deleteWarrantyClaim(int id) {
        warrantyClaimsRepository.deleteById(id);
    }

    @Override
    public List<WarrantyClaims> getWarrantyClaims() {
        return warrantyClaimsRepository.findAll();
    }
}
