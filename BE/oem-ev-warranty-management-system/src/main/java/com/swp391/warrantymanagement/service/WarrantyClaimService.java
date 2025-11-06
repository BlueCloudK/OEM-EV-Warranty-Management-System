package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service xử lý business logic cho WarrantyClaim (TRUNG TÂM hệ thống)
 * - CRUD: Tạo, đọc, cập nhật, xóa claim
 * - Workflow: SUBMITTED → APPROVED → IN_PROGRESS → RESOLVED
 * - Role-based: Customer tạo, Staff duyệt, Technician sửa
 * - Tracking: Status, work logs, part requests
 */
public interface WarrantyClaimService {
    // Lấy danh sách tất cả claim (admin/staff)
    PagedResponse<WarrantyClaimResponseDTO> getAllClaimsPage(Pageable pageable);

    // Lấy chi tiết claim theo ID
    WarrantyClaimResponseDTO getClaimById(Long id);

    // Customer tạo claim mới (status: SUBMITTED)
    WarrantyClaimResponseDTO createClaim(WarrantyClaimRequestDTO requestDTO);

    // Cập nhật thông tin claim
    WarrantyClaimResponseDTO updateClaim(Long id, WarrantyClaimRequestDTO requestDTO);

    // Cập nhật status claim (workflow transition)
    WarrantyClaimResponseDTO updateClaimStatus(Long id, WarrantyClaimStatusUpdateRequestDTO requestDTO);

    /**
     * Xóa một yêu cầu bảo hành.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID,
     * hoặc ResourceInUseException nếu claim đang ở trạng thái không thể xóa.
     */
    void deleteClaim(Long id);

    // ========== WORKFLOW METHODS ==========

    // SC_STAFF tạo claim cho customer (tại service center)
    WarrantyClaimResponseDTO createClaimBySCStaff(WarrantyClaimRequestDTO requestDTO);

    // Admin chấp nhận claim (SUBMITTED → MANAGER_REVIEW)
    WarrantyClaimResponseDTO adminAcceptClaim(Long claimId, String note);

    // Admin từ chối claim (SUBMITTED → REJECTED)
    WarrantyClaimResponseDTO adminRejectClaim(Long claimId, String reason);

    // Technician bắt đầu xử lý (MANAGER_REVIEW → PROCESSING)
    WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note);

    /**
     * Technician hoàn tất xử lý claim (PROCESSING → COMPLETED)
     */
    WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote);

    /**
     * Lấy claims theo status với pagination
     */
    PagedResponse<WarrantyClaimResponseDTO> getClaimsByStatus(String status, Pageable pageable);

    /**
     * Lấy claims cần Technician xử lý (MANAGER_REVIEW hoặc PROCESSING)
     */
    PagedResponse<WarrantyClaimResponseDTO> getTechPendingClaims(Pageable pageable);

    /**
     * Admin nhận claim để xử lý (assign to themselves)
     * REFACTOR: Thay thế userId bằng username để tăng cường bảo mật.
     * @param claimId ID của claim cần gán.
     * @param username Username của Admin đang thực hiện (lấy từ Security Context).
     */
    WarrantyClaimResponseDTO assignClaimToMe(Long claimId, String username);

    /**
     * Lấy claims đã được assign cho Admin cụ thể
     * REFACTOR: Thay thế userId bằng username.
     * @param username Username của Admin.
     * @param pageable Thông tin phân trang.
     */
    PagedResponse<WarrantyClaimResponseDTO> getMyAssignedClaims(String username, Pageable pageable);

    /**
     * Customer xem tất cả warranty claims của mình (qua vehicles)
     * REFACTOR: Thêm username để xác định đúng khách hàng.
     * @param username Username của khách hàng (lấy từ Security Context).
     * @param pageable Thông tin phân trang.
     */
    PagedResponse<WarrantyClaimResponseDTO> getMyWarrantyClaims(String username, Pageable pageable);

    /**
     * Customer xem chi tiết 1 warranty claim của mình
     * REFACTOR: Thêm username để thực hiện kiểm tra quyền sở hữu.
     * @param claimId ID của claim cần xem.
     * @param username Username của khách hàng (lấy từ Security Context).
     */
    WarrantyClaimResponseDTO getMyWarrantyClaimById(Long claimId, String username);
}
