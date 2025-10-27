package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.service.PartRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * PartRequestController - REST API endpoints cho part request management
 *
 * Flow:
 * 1. SC_TECHNICIAN tạo yêu cầu linh kiện khi phát hiện part lỗi
 * 2. EVM_STAFF xem xét và duyệt/từ chối yêu cầu
 * 3. EVM_STAFF cập nhật trạng thái vận chuyển
 * 4. SC_TECHNICIAN/SC_STAFF xác nhận đã nhận hàng
 */
@RestController
@RequestMapping("/api/part-requests")
@RequiredArgsConstructor
public class PartRequestController {

    private static final Logger logger = LoggerFactory.getLogger(PartRequestController.class);
    private final PartRequestService partRequestService;

    /**
     * SC_TECHNICIAN tạo yêu cầu linh kiện mới
     * POST /api/part-requests
     */
    @PostMapping
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> createPartRequest(
            @Valid @RequestBody PartRequestRequestDTO requestDTO,
            @RequestHeader("Authorization") String authorizationHeader) {
        logger.info("Create part request - Warranty Claim ID: {}", requestDTO.getWarrantyClaimId());
        PartRequestResponseDTO response = partRequestService.createPartRequest(requestDTO, authorizationHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy thông tin chi tiết một part request
     * GET /api/part-requests/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> getPartRequestById(@PathVariable Long id) {
        logger.info("Get part request by ID: {}", id);
        PartRequestResponseDTO response = partRequestService.getPartRequestById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tất cả part requests (ADMIN/EVM_STAFF)
     * GET /api/part-requests?page=0&size=10&sortBy=requestDate&sortDir=DESC
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getAllPartRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "requestDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        logger.info("Get all part requests - page: {}, size: {}", page, size);
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<PartRequestResponseDTO> response = partRequestService.getAllPartRequests(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy part requests đang chờ duyệt (EVM_STAFF)
     * GET /api/part-requests/pending?page=0&size=10
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get pending part requests - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").ascending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getPendingRequests(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy part requests đang vận chuyển
     * GET /api/part-requests/in-transit?page=0&size=10
     */
    @GetMapping("/in-transit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getInTransitRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get in-transit part requests - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("shippedDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getInTransitRequests(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy part requests theo status
     * GET /api/part-requests/by-status/{status}?page=0&size=10
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getPartRequestsByStatus(
            @PathVariable PartRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get part requests by status: {} - page: {}, size: {}", status, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getPartRequestsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy part requests của một warranty claim
     * GET /api/part-requests/by-claim/{claimId}?page=0&size=10
     */
    @GetMapping("/by-claim/{claimId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getPartRequestsByWarrantyClaim(
            @PathVariable Long claimId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get part requests for warranty claim: {} - page: {}, size: {}", claimId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getPartRequestsByWarrantyClaim(claimId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy part requests của một service center
     * GET /api/part-requests/by-service-center/{serviceCenterId}?page=0&size=10
     */
    @GetMapping("/by-service-center/{serviceCenterId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getPartRequestsByServiceCenter(
            @PathVariable Long serviceCenterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get part requests for service center: {} - page: {}, size: {}", serviceCenterId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getPartRequestsByServiceCenter(serviceCenterId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Technician xem các yêu cầu của mình
     * GET /api/part-requests/my-requests?page=0&size=10
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getMyPartRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Get my part requests - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getMyPartRequests(authorizationHeader, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * EVM_STAFF duyệt yêu cầu
     * PATCH /api/part-requests/{id}/approve
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> approvePartRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Approve part request: {}", id);
        PartRequestResponseDTO response = partRequestService.approvePartRequest(id, notes, authorizationHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * EVM_STAFF từ chối yêu cầu
     * PATCH /api/part-requests/{id}/reject
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> rejectPartRequest(
            @PathVariable Long id,
            @RequestParam String rejectionReason,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Reject part request: {}", id);
        PartRequestResponseDTO response = partRequestService.rejectPartRequest(id, rejectionReason, authorizationHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * EVM_STAFF cập nhật đã gửi hàng
     * PATCH /api/part-requests/{id}/ship
     */
    @PatchMapping("/{id}/ship")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> markAsShipped(
            @PathVariable Long id,
            @RequestParam(required = false) String trackingNumber,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Mark part request as shipped: {}", id);
        PartRequestResponseDTO response = partRequestService.markAsShipped(id, trackingNumber, authorizationHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * SC_TECHNICIAN/SC_STAFF xác nhận đã nhận hàng
     * PATCH /api/part-requests/{id}/deliver
     */
    @PatchMapping("/{id}/deliver")
    @PreAuthorize("hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> markAsDelivered(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Mark part request as delivered: {}", id);
        PartRequestResponseDTO response = partRequestService.markAsDelivered(id, authorizationHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * Technician hủy yêu cầu (chỉ khi PENDING)
     * PATCH /api/part-requests/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> cancelPartRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {

        logger.info("Cancel part request: {}", id);
        PartRequestResponseDTO response = partRequestService.cancelPartRequest(id, authorizationHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thống kê part requests theo status
     * GET /api/part-requests/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<Map<String, Long>> getPartRequestStatistics() {
        logger.info("Get part request statistics");

        Map<String, Long> statistics = new HashMap<>();
        statistics.put("pending", partRequestService.countByStatus(PartRequestStatus.PENDING));
        statistics.put("approved", partRequestService.countByStatus(PartRequestStatus.APPROVED));
        statistics.put("shipped", partRequestService.countByStatus(PartRequestStatus.SHIPPED));
        statistics.put("delivered", partRequestService.countByStatus(PartRequestStatus.DELIVERED));
        statistics.put("rejected", partRequestService.countByStatus(PartRequestStatus.REJECTED));
        statistics.put("cancelled", partRequestService.countByStatus(PartRequestStatus.CANCELLED));

        return ResponseEntity.ok(statistics);
    }
}

