package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    @Autowired
    private WarrantyClaimService warrantyClaimService;

    // Lấy tất cả yêu cầu bảo hành
    @GetMapping
    public ResponseEntity<List<WarrantyClaim>> getAllClaims() {
        List<WarrantyClaim> claims = warrantyClaimService.getAll();
        return ResponseEntity.ok(claims);
    }

    // Lấy yêu cầu bảo hành theo ID
    @GetMapping("/{id}")
    public ResponseEntity<WarrantyClaim> getClaimById(@PathVariable("id") Long id) {
        WarrantyClaim claim = warrantyClaimService.getById(id);
        if (claim != null) {
            return ResponseEntity.ok(claim);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo yêu cầu bảo hành mới từ người dùng
    @PostMapping
    public ResponseEntity<WarrantyClaim> createClaim(@Valid @RequestBody WarrantyClaim warrantyClaim) {
        // Thiết lập trạng thái ban đầu và ngày tạo
        warrantyClaim.setStatus(WarrantyClaimStatus.SUBMITTED);
        warrantyClaim.setClaimDate(new Date());
        warrantyClaim.setWarrantyClaimId(null); // Đảm bảo ID null để tạo mới

        WarrantyClaim savedClaim = warrantyClaimService.save(warrantyClaim);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClaim);
    }

    // Cập nhật yêu cầu bảo hành
    @PutMapping("/{id}")
    public ResponseEntity<WarrantyClaim> updateClaim(@PathVariable("id") Long id, @Valid @RequestBody WarrantyClaim warrantyClaim) {
        if (!warrantyClaimService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        warrantyClaim.setWarrantyClaimId(id);
        WarrantyClaim updatedClaim = warrantyClaimService.save(warrantyClaim);
        return ResponseEntity.ok(updatedClaim);
    }

    // SC Staff xem xét xe (lần 1) - chuyển từ SUBMITTED sang SC_REVIEW
    @PatchMapping("/{id}/sc-review")
    public ResponseEntity<WarrantyClaim> scReviewClaim(@PathVariable("id") Long id,
                                                       @RequestParam(required = false) String reviewNote) {
        WarrantyClaim updatedClaim = warrantyClaimService.updateClaimStatus(id, WarrantyClaimStatus.SC_REVIEW);
        if (updatedClaim != null) {
            return ResponseEntity.ok(updatedClaim);
        }
        return ResponseEntity.notFound().build();
    }

    // SC Staff phê duyệt - chuyển từ SC_REVIEW sang EVM_REVIEW
    @PatchMapping("/{id}/sc-approve")
    public ResponseEntity<WarrantyClaim> scApproveClaim(@PathVariable("id") Long id) {
        WarrantyClaim claim = warrantyClaimService.getById(id);
        if (claim == null) {
            return ResponseEntity.notFound().build();
        }

        if (claim.getStatus() != WarrantyClaimStatus.SC_REVIEW) {
            return ResponseEntity.badRequest().build();
        }

        WarrantyClaim updatedClaim = warrantyClaimService.updateClaimStatus(id, WarrantyClaimStatus.EVM_REVIEW);
        return ResponseEntity.ok(updatedClaim);
    }

    // EVM Staff xem xét part (lần 2) và phê duyệt
    @PatchMapping("/{id}/evm-review")
    public ResponseEntity<WarrantyClaim> evmReviewClaim(@PathVariable("id") Long id,
                                                        @RequestParam WarrantyClaimStatus finalStatus) {
        WarrantyClaim claim = warrantyClaimService.getById(id);
        if (claim == null) {
            return ResponseEntity.notFound().build();
        }

        if (claim.getStatus() != WarrantyClaimStatus.EVM_REVIEW) {
            return ResponseEntity.badRequest().build();
        }

        // EVM có thể chuyển sang PROCESSING, COMPLETED hoặc REJECTED
        if (finalStatus == WarrantyClaimStatus.PROCESSING ||
            finalStatus == WarrantyClaimStatus.COMPLETED ||
            finalStatus == WarrantyClaimStatus.REJECTED) {

            WarrantyClaim updatedClaim = warrantyClaimService.updateClaimStatus(id, finalStatus);
            return ResponseEntity.ok(updatedClaim);
        }

        return ResponseEntity.badRequest().build();
    }

    // Từ chối claim (SC hoặc EVM có thể dùng)
    @PatchMapping("/{id}/reject")
    public ResponseEntity<WarrantyClaim> rejectClaim(@PathVariable("id") Long id,
                                                     @RequestParam(required = false) String rejectReason) {
        WarrantyClaim updatedClaim = warrantyClaimService.updateClaimStatus(id, WarrantyClaimStatus.REJECTED);
        if (updatedClaim != null) {
            return ResponseEntity.ok(updatedClaim);
        }
        return ResponseEntity.notFound().build();
    }

    // Lấy claims đang chờ SC review
    @GetMapping("/pending-sc-review")
    public ResponseEntity<List<WarrantyClaim>> getClaimsPendingScReview() {
        List<WarrantyClaim> claims = warrantyClaimService.getClaimsByStatus(WarrantyClaimStatus.SUBMITTED);
        return ResponseEntity.ok(claims);
    }

    // Lấy claims đang trong SC review
    @GetMapping("/sc-reviewing")
    public ResponseEntity<List<WarrantyClaim>> getClaimsInScReview() {
        List<WarrantyClaim> claims = warrantyClaimService.getClaimsByStatus(WarrantyClaimStatus.SC_REVIEW);
        return ResponseEntity.ok(claims);
    }

    // Lấy claims đang chờ EVM review
    @GetMapping("/pending-evm-review")
    public ResponseEntity<List<WarrantyClaim>> getClaimsPendingEvmReview() {
        List<WarrantyClaim> claims = warrantyClaimService.getClaimsByStatus(WarrantyClaimStatus.EVM_REVIEW);
        return ResponseEntity.ok(claims);
    }

    // Lấy yêu cầu bảo hành theo trạng thái
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WarrantyClaim>> getClaimsByStatus(@PathVariable("status") WarrantyClaimStatus status) {
        List<WarrantyClaim> claims = warrantyClaimService.getClaimsByStatus(status);
        return ResponseEntity.ok(claims);
    }

    // Lấy yêu cầu bảo hành theo vehicle ID
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<WarrantyClaim>> getClaimsByVehicleId(@PathVariable("vehicleId") Long vehicleId) {
        List<WarrantyClaim> claims = warrantyClaimService.getClaimsByVehicleId(vehicleId);
        return ResponseEntity.ok(claims);
    }

    // Xóa yêu cầu bảo hành
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable("id") Long id) {
        if (!warrantyClaimService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        warrantyClaimService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Lấy tất cả trạng thái có thể có
    @GetMapping("/statuses")
    public ResponseEntity<WarrantyClaimStatus[]> getAllStatuses() {
        return ResponseEntity.ok(WarrantyClaimStatus.values());
    }
}
