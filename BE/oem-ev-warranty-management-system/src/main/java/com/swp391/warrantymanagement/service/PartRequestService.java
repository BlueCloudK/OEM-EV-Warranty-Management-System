package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import org.springframework.data.domain.Pageable;

/**
 * Service interface cho Part Request operations
 */
public interface PartRequestService {

    // ============= CRUD Operations =============

    /**
     * Technician tạo yêu cầu linh kiện mới
     */
    PartRequestResponseDTO createPartRequest(PartRequestDTO requestDTO, String authorizationHeader);

    /**
     * Lấy thông tin chi tiết một part request
     */
    PartRequestResponseDTO getPartRequestById(Long requestId);

    /**
     * Lấy tất cả part requests (cho ADMIN/EVM_STAFF)
     */
    PagedResponse<PartRequestResponseDTO> getAllPartRequests(Pageable pageable);

    /**
     * Lấy part requests theo status
     */
    PagedResponse<PartRequestResponseDTO> getPartRequestsByStatus(PartRequestStatus status, Pageable pageable);

    // ============= Status Transitions (EVM_STAFF) =============

    /**
     * EVM_STAFF duyệt yêu cầu
     */
    PartRequestResponseDTO approvePartRequest(Long requestId, String notes, String authorizationHeader);

    /**
     * EVM_STAFF từ chối yêu cầu
     */
    PartRequestResponseDTO rejectPartRequest(Long requestId, String rejectionReason, String authorizationHeader);

    /**
     * EVM_STAFF cập nhật trạng thái đã gửi hàng
     */
    PartRequestResponseDTO markAsShipped(Long requestId, String trackingNumber, String authorizationHeader);

    /**
     * SC_TECHNICIAN/SC_STAFF xác nhận đã nhận hàng
     */
    PartRequestResponseDTO markAsDelivered(Long requestId, String authorizationHeader);

    // ============= Query Operations =============

    /**
     * Lấy part requests đang chờ duyệt (cho EVM_STAFF)
     */
    PagedResponse<PartRequestResponseDTO> getPendingRequests(Pageable pageable);

    /**
     * Lấy part requests đang vận chuyển
     */
    PagedResponse<PartRequestResponseDTO> getInTransitRequests(Pageable pageable);

    /**
     * Lấy part requests của một warranty claim
     */
    PagedResponse<PartRequestResponseDTO> getPartRequestsByWarrantyClaim(Long warrantyClaimId, Pageable pageable);

    /**
     * Lấy part requests của một service center
     */
    PagedResponse<PartRequestResponseDTO> getPartRequestsByServiceCenter(Long serviceCenterId, Pageable pageable);

    /**
     * Technician xem các yêu cầu của mình
     */
    PagedResponse<PartRequestResponseDTO> getMyPartRequests(String authorizationHeader, Pageable pageable);

    /**
     * Technician hủy yêu cầu của mình (chỉ khi status = PENDING)
     */
    PartRequestResponseDTO cancelPartRequest(Long requestId, String authorizationHeader);

    // ============= Statistics =============

    /**
     * Đếm số lượng requests theo status
     */
    Long countByStatus(PartRequestStatus status);
}

