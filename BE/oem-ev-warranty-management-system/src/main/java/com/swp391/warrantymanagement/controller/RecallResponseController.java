package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.RecallResponseConfirmDTO;
import com.swp391.warrantymanagement.dto.response.RecallResponseResponseDTO;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.service.RecallResponseService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP requests liên quan đến RecallResponse.
 * <p>
 * <strong>Endpoints:</strong>
 * <ul>
 *   <li>PATCH /api/recall-responses/{id}/confirm - Customer xác nhận (chấp nhận/từ chối)</li>
 *   <li>GET /api/recall-responses/my-responses - Customer xem responses của mình</li>
 *   <li>GET /api/recall-responses - Admin xem tất cả responses</li>
 *   <li>GET /api/recall-responses/campaign/{recallRequestId} - Xem responses của một campaign</li>
 *   <li>GET /api/recall-responses/{id} - Xem chi tiết một response</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/recall-responses")
@RequiredArgsConstructor
public class RecallResponseController {

    private final RecallResponseService recallResponseService;

    /**
     * Cho phép khách hàng xác nhận (chấp nhận hoặc từ chối) một RecallResponse.
     * <p>
     * <strong>Flow:</strong>
     * <pre>
     * 1. Customer nhận thông báo về recall
     * 2. Customer gọi API này với accepted=true/false
     * 3. Nếu accepted=true → Hệ thống tự động tạo WarrantyClaim
     * </pre>
     *
     * @param id ID của RecallResponse
     * @param dto DTO chứa accepted (true/false) và customerNote
     * @return RecallResponseResponseDTO đã được cập nhật
     */
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RecallResponseResponseDTO> confirmRecallResponse(
            @PathVariable Long id,
            @Valid @RequestBody RecallResponseConfirmDTO dto) {

        String customerUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to confirm a recall response"));

        return ResponseEntity.ok(recallResponseService.customerConfirmResponse(id, dto, customerUsername));
    }

    /**
     * Cho phép khách hàng xem danh sách tất cả RecallResponse của xe mình.
     * <p>
     * <strong>Use case:</strong> Customer đăng nhập và xem xe nào đang bị recall.
     *
     * @return Danh sách RecallResponse của customer
     */
    @GetMapping("/my-responses")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RecallResponseResponseDTO>> getMyRecallResponses() {
        String customerUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view your recall responses"));

        return ResponseEntity.ok(recallResponseService.getMyRecallResponses(customerUsername));
    }

    /**
     * Cho phép Admin/Staff xem tất cả RecallResponse trong hệ thống.
     *
     * @return Danh sách tất cả RecallResponse
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<List<RecallResponseResponseDTO>> getAllRecallResponses() {
        return ResponseEntity.ok(recallResponseService.getAllRecallResponses());
    }

    /**
     * Cho phép Admin/Staff xem tất cả RecallResponse của một chiến dịch recall cụ thể.
     * <p>
     * <strong>Use case:</strong> Dashboard hiển thị "50/100 xe đã chấp nhận recall campaign #123".
     *
     * @param recallRequestId ID của chiến dịch recall
     * @return Danh sách RecallResponse của campaign đó
     */
    @GetMapping("/campaign/{recallRequestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<List<RecallResponseResponseDTO>> getResponsesByRecallRequest(
            @PathVariable Long recallRequestId) {
        return ResponseEntity.ok(recallResponseService.getResponsesByRecallRequest(recallRequestId));
    }

    /**
     * Lấy chi tiết một RecallResponse theo ID.
     *
     * @param id ID của RecallResponse
     * @return RecallResponseResponseDTO
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'CUSTOMER')")
    public ResponseEntity<RecallResponseResponseDTO> getRecallResponseById(@PathVariable Long id) {
        return ResponseEntity.ok(recallResponseService.getRecallResponseById(id));
    }
}
