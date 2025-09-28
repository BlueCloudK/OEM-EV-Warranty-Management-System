package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.WarrantyClaims;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarrantyClaimsRepository extends JpaRepository<WarrantyClaims, Integer> {
}
