package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.WarrantyClaims;
import com.swp391.warrantymanagement.service.WarrantyClaimsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimsController {
    @Autowired
    private WarrantyClaimsService warrantyClaimsService;

    @GetMapping("/")
    public ResponseEntity<List<WarrantyClaims>> getWarrantyClaims() {
        return ResponseEntity.ok(warrantyClaimsService.getWarrantyClaims());
    }

    @GetMapping("/warrantyClaimId")
    public ResponseEntity<WarrantyClaims> getWarrantyClaimById(@PathVariable int id) {
        WarrantyClaims warrantyClaim = warrantyClaimsService.getById(id);
        if (warrantyClaim != null) {
            return ResponseEntity.ok(warrantyClaim);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<WarrantyClaims> createWarrantyClaim(@RequestBody WarrantyClaims warrantyClaim) {
        return ResponseEntity.ok(warrantyClaimsService.createWarrantyClaim(warrantyClaim));
    }

    @DeleteMapping("/warrantyClaimId")
    public ResponseEntity<Void> deleteWarrantyClaim(@PathVariable int id) {
        warrantyClaimsService.deleteWarrantyClaim(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<WarrantyClaims> updateWarrantyClaim(@RequestBody WarrantyClaims warrantyClaim) {
        return ResponseEntity.ok(warrantyClaimsService.updateWarrantyClaim(warrantyClaim));
    }
}
