package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.RecallResponseConfirmDTO;
import com.swp391.warrantymanagement.dto.response.RecallResponseResponseDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service xử lý business logic cho RecallResponse.
 * <p>
 * <strong>Trách nhiệm:</strong>
 * <ul>
 *   <li>Xử lý phản hồi của khách hàng (chấp nhận/từ chối recall)</li>
 *   <li>Tự động tạo WarrantyClaim khi customer chấp nhận</li>
 *   <li>Cập nhật trạng thái RecallResponse khi claim hoàn thành</li>
 *   <li>Cung cấp API cho customer/admin xem danh sách responses</li>
 * </ul>
 */
public interface RecallResponseService {

    /**
     * Khách hàng xác nhận (chấp nhận hoặc từ chối) một RecallResponse.
     * <p>
     * <strong>Flow:</strong>
     * <pre>
     * 1. Validate ownership: Chỉ customer sở hữu xe mới được xác nhận
     * 2. Validate status: Chỉ PENDING mới có thể confirm
     * 3. Nếu ACCEPTED:
     *    - Tạo WarrantyClaim tự động (status: PROCESSING)
     *    - Update RecallResponse status → IN_PROGRESS
     * 4. Nếu DECLINED:
     *    - Update RecallResponse status → DECLINED
     * </pre>
     *
     * @param recallResponseId ID của RecallResponse
     * @param dto DTO chứa accepted (true/false) và customerNote
     * @param customerUsername Username của customer
     * @return RecallResponseResponseDTO đã được cập nhật
     */
    RecallResponseResponseDTO customerConfirmResponse(Long recallResponseId, RecallResponseConfirmDTO dto, String customerUsername);

    /**
     * Customer xem danh sách tất cả RecallResponse của xe mình.
     * <p>
     * <strong>Use case:</strong> Customer đăng nhập và xem xe nào của mình đang bị recall.
     *
     * @param customerUsername Username của customer
     * @return Danh sách RecallResponse của tất cả xe customer sở hữu
     */
    List<RecallResponseResponseDTO> getMyRecallResponses(String customerUsername);

    /**
     * Admin/Staff xem tất cả RecallResponse của một chiến dịch recall.
     * <p>
     * <strong>Use case:</strong> Dashboard hiển thị "50/100 xe đã chấp nhận recall".
     *
     * @param recallRequestId ID của chiến dịch recall
     * @return Danh sách tất cả responses trong campaign đó
     */
    List<RecallResponseResponseDTO> getResponsesByRecallRequest(Long recallRequestId);

    /**
     * Admin/Staff xem tất cả RecallResponse trong hệ thống.
     *
     * @return Danh sách tất cả RecallResponse
     */
    List<RecallResponseResponseDTO> getAllRecallResponses();

    /**
     * Lấy chi tiết một RecallResponse theo ID.
     *
     * @param recallResponseId ID của RecallResponse
     * @return RecallResponseResponseDTO
     */
    RecallResponseResponseDTO getRecallResponseById(Long recallResponseId);

    /**
     * Cập nhật status của RecallResponse khi WarrantyClaim hoàn thành.
     * <p>
     * <strong>Use case:</strong> Khi technician complete claim, tự động update response → COMPLETED.
     * <p>
     * Method này được gọi từ WarrantyClaimService khi claim status = RESOLVED.
     *
     * @param warrantyClaimId ID của WarrantyClaim đã hoàn thành
     */
    void markRecallResponseCompleted(Long warrantyClaimId);
}
