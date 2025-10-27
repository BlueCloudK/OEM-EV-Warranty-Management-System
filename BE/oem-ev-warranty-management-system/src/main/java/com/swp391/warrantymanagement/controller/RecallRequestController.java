package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.service.RecallRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recall-requests")
@RequiredArgsConstructor
public class RecallRequestController {
    private final RecallRequestService recallRequestService;

    // EVM tạo yêu cầu recall
    @PostMapping
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> createRecall(@Valid @RequestBody RecallRequestRequestDTO dto, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recallRequestService.createRecallRequest(dto, auth));
    }

    // ADMIN/STAFF duyệt yêu cầu recall
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> approveRecall(@PathVariable Long id, @RequestParam(required = false) String note, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recallRequestService.approveRecallRequest(id, note, auth));
    }

    // ADMIN/STAFF từ chối yêu cầu recall
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> rejectRecall(@PathVariable Long id, @RequestParam(required = false) String note, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recallRequestService.rejectRecallRequest(id, note, auth));
    }

    // Khách hàng xác nhận recall
    @PatchMapping("/{id}/customer-confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RecallRequestResponseDTO> customerConfirm(@PathVariable Long id, @Valid @RequestBody RecallCustomerResponseDTO dto, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recallRequestService.customerConfirmRecall(id, dto, auth));
    }

    // Lấy danh sách recall cho admin/staff
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<List<RecallRequestResponseDTO>> getForAdmin() {
        return ResponseEntity.ok(recallRequestService.getRecallRequestsForAdmin());
    }

    // Lấy danh sách recall cho khách hàng
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RecallRequestResponseDTO>> getForCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(recallRequestService.getRecallRequestsForCustomer(customerId));
    }
}

