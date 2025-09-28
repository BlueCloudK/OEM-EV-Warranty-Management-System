package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.WarrantyClaims;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface WarrantyClaimsService {
    public WarrantyClaims getById(int id);
    public WarrantyClaims createWarrantyClaim(WarrantyClaims warrantyClaim);
    public WarrantyClaims updateWarrantyClaim(WarrantyClaims warrantyClaim);
    public void deleteWarrantyClaim(int id);
    public List<WarrantyClaims> getWarrantyClaims();
}
