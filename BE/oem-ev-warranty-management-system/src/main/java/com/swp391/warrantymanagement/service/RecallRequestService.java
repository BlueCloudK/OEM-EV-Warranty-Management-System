package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service xử lý business logic cho RecallRequest
 * - EVM tạo recall khi phát hiện lỗi hàng loạt
 * - Admin duyệt recall
 * - Customer nhận thông báo và xác nhận
 * - Tự động tạo warranty claim cho xe bị ảnh hưởng
 */
public interface RecallRequestService {
    /**
     * EVM_STAFF tạo một yêu cầu triệu hồi mới.
     * REFACTOR: Thay thế authorizationHeader bằng username để tách biệt Service khỏi tầng Web.
     * @param dto Dữ liệu yêu cầu.
     * @param username Username của EVM_STAFF đang tạo yêu cầu (lấy từ Security Context).
     * @return Yêu cầu đã được tạo.
     */
    RecallRequestResponseDTO createRecallRequest(RecallRequestRequestDTO dto, String username);

    /**
     * Admin/Staff duyệt một yêu cầu triệu hồi.
     * @param recallRequestId ID của yêu cầu.
     * @param adminNote Ghi chú từ người duyệt.
     * @param approverUsername Username của người đang duyệt (lấy từ Security Context).
     */
    RecallRequestResponseDTO approveRecallRequest(Long recallRequestId, String adminNote, String approverUsername);

    /**
     * Admin/Staff từ chối một yêu cầu triệu hồi.
     * @param recallRequestId ID của yêu cầu.
     * @param adminNote Lý do từ chối.
     * @param rejectorUsername Username của người đang từ chối (lấy từ Security Context).
     */
    RecallRequestResponseDTO rejectRecallRequest(Long recallRequestId, String adminNote, String rejectorUsername);

    /**
     * Khách hàng xác nhận hoặc từ chối yêu cầu triệu hồi.
     * @param recallRequestId ID của yêu cầu.
     * @param dto Dữ liệu xác nhận từ khách hàng.
     * @param customerUsername Username của khách hàng đang thực hiện (lấy từ Security Context).
     */
    RecallRequestResponseDTO customerConfirmRecall(Long recallRequestId, RecallCustomerResponseDTO dto, String customerUsername);

    // Admin xem tất cả recall requests
    List<RecallRequestResponseDTO> getRecallRequestsForAdmin();

    // Lấy recall requests của customer cụ thể
    List<RecallRequestResponseDTO> getRecallRequestsForCustomer(UUID customerId);

    /**
     * Khách hàng xem danh sách các yêu cầu triệu hồi của chính mình.
     * @param username Username của khách hàng (lấy từ Security Context).
     */
    List<RecallRequestResponseDTO> getMyRecallRequests(String username);

    /**
     * EVM_STAFF xóa một yêu cầu triệu hồi (chỉ khi ở trạng thái PENDING).
     * @param recallRequestId ID của yêu cầu.
     * @param username Username của người đang thực hiện (lấy từ Security Context).
     */
    void deleteRecallRequest(Long recallRequestId, String username);
}
