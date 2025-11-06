package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.mapper.RecallRequestMapper;
import com.swp391.warrantymanagement.service.JwtService;
import com.swp391.warrantymanagement.service.RecallRequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
/**
 * Service chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ cho quy trình Yêu cầu Triệu hồi (Recall Request).
 * <p>
 * <strong>Thiết kế & Trách nhiệm:</strong>
 * <ul>
 *     <li><b>Quản lý Vòng đời (State Machine):</b> Quản lý và xác thực các bước chuyển trạng thái của một yêu cầu triệu hồi,
 *     tuân theo quy trình: {@code PENDING_ADMIN_APPROVAL -> WAITING_CUSTOMER_CONFIRM -> CLAIM_CREATED/REJECTED_BY_CUSTOMER}.
 *     Việc chuyển trạng thái không hợp lệ sẽ ném ra {@link IllegalStateException}.</li>
 *     <li><b>Tự động tạo Yêu cầu Bảo hành:</b> Khi khách hàng chấp nhận một yêu cầu triệu hồi,
 *     service này sẽ tự động tạo ra một {@link WarrantyClaim} tương ứng với trạng thái {@code PROCESSING},
 *     bỏ qua các bước duyệt thông thường để ưu tiên xử lý.</li>
 *     <li><b>Xác thực Quyền sở hữu:</b> Thực hiện các kiểm tra bảo mật ở tầng nghiệp vụ để đảm bảo
 *     khách hàng chỉ có thể xác nhận yêu cầu triệu hồi cho xe của chính họ, và nhân viên chỉ có thể xóa yêu cầu do chính họ tạo.</li>
 *     <li><b>Tách biệt Trách nhiệm:</b> Lớp này hoàn toàn không biết về các chi tiết của tầng Web.
 *     Nó chỉ nhận các định danh đã được xác thực (ví dụ: {@code username}) từ Controller.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RecallRequestServiceImpl implements RecallRequestService {

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với các trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc, giúp code dễ test và đảm bảo các dependency là bất biến.
     */
    private static final Logger logger = LoggerFactory.getLogger(RecallRequestServiceImpl.class);

    private final RecallRequestRepository recallRequestRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final UserRepository userRepository;
    private final InstalledPartRepository installedPartRepository;
    private final RecallResponseRepository recallResponseRepository;
    private final PartRepository partRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Tạo một yêu cầu triệu hồi mới.
     * <p>
     * <strong>Quy trình nghiệp vụ:</strong>
     * <ol>
     *     <li>Xác thực sự tồn tại của {@link User} (người tạo) và {@link InstalledPart} (linh kiện bị ảnh hưởng).</li>
     *     <li>Tạo một thực thể {@link RecallRequest} với trạng thái ban đầu là {@code PENDING_ADMIN_APPROVAL}.</li>
     *     <li>Lưu vào cơ sở dữ liệu và trả về DTO tương ứng.</li>
     * </ol>
     *
     * @param dto DTO chứa thông tin yêu cầu.
     * @param username Username của EVM_STAFF đang tạo yêu cầu.
     * @return Yêu cầu đã được tạo.
     */
    @Override
    public RecallRequestResponseDTO createRecallRequest(RecallRequestRequestDTO dto, String username) {
        logger.info("Creating recall campaign for part: {}", dto.getPartId());

        // BƯỚC 1: Lấy User từ username đã được xác thực
        User createdBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // BƯỚC 2: Validate Part tồn tại
        // Thiết kế: Tạo recall campaign cho loại linh kiện bị lỗi (Part), không phải installed part cụ thể
        Part part = partRepository.findById(dto.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", dto.getPartId()));

        // BƯỚC 3: Tạo RecallRequest entity (Chiến dịch triệu hồi)
        RecallRequest recall = new RecallRequest();
        recall.setPart(part); // Link to part type (ví dụ: "Pin Model X v1.2")
        recall.setReason(dto.getReason()); // Lý do triệu hồi (safety/quality issue)
        recall.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL); // Chờ Admin duyệt

        // BƯỚC 4: Set metadata
        recall.setCreatedBy(createdBy); // Track WHO created recall campaign
        recall.setCreatedAt(LocalDateTime.now());
        recall.setUpdatedAt(LocalDateTime.now());

        // BƯỚC 5: Save và return
        RecallRequest savedRecall = recallRequestRepository.save(recall);
        logger.info("Recall campaign created successfully with ID: {} for part: {}",
                savedRecall.getRecallRequestId(), part.getPartName());

        return RecallRequestMapper.toResponseDTO(savedRecall);
    }

    /**
     * Lấy danh sách tất cả các yêu cầu triệu hồi trong hệ thống.
     * Thường được sử dụng cho dashboard của Admin.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code @Transactional(readOnly = true)} để tối ưu hiệu năng cho các truy vấn chỉ đọc.
     * @return Một danh sách các yêu cầu triệu hồi.
     */
    @Override
    @Transactional(readOnly = true)
    public List<RecallRequestResponseDTO> getRecallRequestsForAdmin() {
        logger.info("Getting all recall requests for admin");
        return recallRequestRepository.findAll().stream()
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách các chiến dịch triệu hồi ảnh hưởng đến một khách hàng cụ thể.
     * <p>
     * <strong>Thay đổi logic:</strong> Vì RecallRequest giờ không link trực tiếp với customer,
     * cần query qua RecallResponse để tìm các campaign ảnh hưởng đến xe của customer.
     *
     * @param customerId UUID của khách hàng.
     * @return Một danh sách các yêu cầu triệu hồi ảnh hưởng đến customer đó.
     */
    @Override
    @Transactional(readOnly = true)
    public List<RecallRequestResponseDTO> getRecallRequestsForCustomer(UUID customerId) {
        logger.info("Getting recall requests affecting customer: {}", customerId);

        // Tìm tất cả RecallResponse của customer
        List<RecallResponse> responses = recallResponseRepository.findByCustomerId(customerId);

        // Lấy danh sách unique RecallRequest từ responses
        Set<RecallRequest> recallRequests = responses.stream()
                .map(RecallResponse::getRecallRequest)
                .collect(Collectors.toSet());

        logger.info("Found {} recall campaigns affecting customer {}", recallRequests.size(), customerId);

        return recallRequests.stream()
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Duyệt một yêu cầu triệu hồi.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code PENDING_ADMIN_APPROVAL}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code WAITING_CUSTOMER_CONFIRM}, ghi lại người duyệt và thời gian.
     *     Sau bước này, hệ thống sẽ gửi thông báo cho khách hàng.</li>
     * </ul>
     * @param recallRequestId ID của yêu cầu cần duyệt.
     * @param adminNote Ghi chú (tùy chọn) từ người duyệt.
     * @param approverUsername Username của người đang duyệt.
     * @return Yêu cầu đã được cập nhật trạng thái.
     */
    @Override
    public RecallRequestResponseDTO approveRecallRequest(Long recallRequestId, String adminNote, String approverUsername) {
        logger.info("Approving recall request: {}", recallRequestId);

        // BƯỚC 1: Lấy User (người duyệt) từ username đã được xác thực
        User approvedBy = userRepository.findByUsername(approverUsername).orElseThrow(() -> new ResourceNotFoundException("User", "username", approverUsername));

        // BƯỚC 2: Tìm RecallRequest
        RecallRequest recall = recallRequestRepository.findById(recallRequestId).orElseThrow(() -> new ResourceNotFoundException("RecallRequest", "id", recallRequestId));

        // BƯỚC 3: Validate state transition - STATE MACHINE ENFORCEMENT
        // Thiết kế: Kiểm tra trạng thái hiện tại là một bước cực kỳ quan trọng để đảm bảo tính toàn vẹn của quy trình.
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only approve recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // BƯỚC 4-5: Update status và metadata
        recall.setStatus(RecallRequestStatus.APPROVED_BY_ADMIN); // Admin đã duyệt
        recall.setAdminNote(adminNote); // Optional explanation
        recall.setApprovedBy(approvedBy); // Track WHO approved
        recall.setUpdatedAt(LocalDateTime.now());

        // BƯỚC 6: Save RecallRequest với status APPROVED
        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall campaign approved: {} - Finding affected vehicles...", recallRequestId);

        // ===== BƯỚC 7: TỰ ĐỘNG TÌM TẤT CẢ XE BỊ ẢNH HƯỞNG VÀ TẠO RECALL RESPONSE =====
        // Tìm tất cả InstalledPart có Part bị lỗi
        List<InstalledPart> affectedParts = installedPartRepository.findByPart_PartId(recall.getPart().getPartId());

        // Lấy danh sách unique vehicles từ installed parts
        Set<Vehicle> affectedVehicles = affectedParts.stream()
                .map(InstalledPart::getVehicle)
                .collect(Collectors.toSet());

        logger.info("Found {} affected vehicles for recall campaign {}",
                affectedVehicles.size(), recallRequestId);

        // Tạo RecallResponse cho mỗi xe bị ảnh hưởng
        int createdResponsesCount = 0;
        for (Vehicle vehicle : affectedVehicles) {
            // Kiểm tra xem xe này đã có response cho campaign này chưa (tránh duplicate)
            Optional<RecallResponse> existingResponse = recallResponseRepository
                    .findByRecallRequest_RecallRequestIdAndVehicle_VehicleId(
                            recallRequestId, vehicle.getVehicleId());

            if (existingResponse.isEmpty()) {
                RecallResponse response = new RecallResponse();
                response.setRecallRequest(updatedRecall);
                response.setVehicle(vehicle);
                response.setStatus(RecallResponseStatus.PENDING); // Chờ customer xác nhận
                response.setCreatedAt(LocalDateTime.now());

                recallResponseRepository.save(response);
                createdResponsesCount++;
                logger.info("Created RecallResponse for vehicle VIN: {}", vehicle.getVehicleVin());
            }
        }

        // BƯỚC 8: Chuyển RecallRequest sang WAITING_CUSTOMER_CONFIRM nếu có RecallResponse được tạo
        if (createdResponsesCount > 0 || !affectedVehicles.isEmpty()) {
            updatedRecall.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);
            updatedRecall = recallRequestRepository.save(updatedRecall);
            logger.info("RecallRequest status changed to WAITING_CUSTOMER_CONFIRM. " +
                    "Created {} RecallResponses for {} affected vehicles.",
                    createdResponsesCount, affectedVehicles.size());
        }

        // BƯỚC 9: TODO - Send notification to affected customers
        // notificationService.sendRecallNotifications(affectedVehicles);
        // Email/SMS: "URGENT: Safety recall for your vehicle"

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    /**
     * Từ chối một yêu cầu triệu hồi.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code PENDING_ADMIN_APPROVAL}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code REJECTED_BY_ADMIN} (trạng thái cuối cùng),
     *     ghi lại người từ chối và lý do.</li>
     * </ul>
     * @param recallRequestId ID của yêu cầu cần từ chối.
     * @param adminNote Lý do từ chối.
     * @param rejectorUsername Username của người đang từ chối.
     * @return Yêu cầu đã được cập nhật trạng thái.
     */
    @Override
    public RecallRequestResponseDTO rejectRecallRequest(Long recallRequestId, String adminNote, String rejectorUsername) {
        logger.info("Rejecting recall request: {}", recallRequestId);

        // BƯỚC 1: Lấy User (người từ chối) từ username đã được xác thực
        User rejectedBy = userRepository.findByUsername(rejectorUsername).orElseThrow(() -> new ResourceNotFoundException("User", "username", rejectorUsername));

        // BƯỚC 2: Tìm RecallRequest
        RecallRequest recall = recallRequestRepository.findById(recallRequestId).orElseThrow(() -> new ResourceNotFoundException("RecallRequest", "id", recallRequestId));

        // BƯỚC 3: Validate state transition
        // Thiết kế: Tương tự như approve, việc kiểm tra trạng thái là bắt buộc.
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only reject recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // BƯỚC 4-5: Update status - REJECTED_BY_ADMIN là final state
        recall.setStatus(RecallRequestStatus.REJECTED_BY_ADMIN);
        recall.setAdminNote(adminNote); // REQUIRED - explain why reject
        recall.setApprovedBy(rejectedBy); // Track WHO rejected
        recall.setUpdatedAt(LocalDateTime.now());

        // BƯỚC 6: Save
        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request rejected by admin: {}", recallRequestId);

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    /**
     * DEPRECATED: Method này đã lỗi thời sau khi chuyển sang model RecallResponse mới.
     * <p>
     * <strong>Migration Guide:</strong>
     * <ul>
     *   <li><b>Old flow:</b> RecallRequest (1 campaign cho 1 xe) → Customer confirm → Tạo WarrantyClaim</li>
     *   <li><b>New flow:</b> RecallRequest (1 campaign cho nhiều xe) → RecallResponse (từng xe) → Customer confirm RecallResponse → Tạo WarrantyClaim</li>
     * </ul>
     * <p>
     * <strong>Thay thế:</strong> Sử dụng {@link RecallResponseService#customerConfirmResponse(Long, RecallResponseConfirmDTO, String)}
     * <p>
     * Method này giữ lại để tương thích ngược nhưng sẽ bị xóa trong tương lai.
     *
     * @deprecated Sử dụng {@link RecallResponseService#customerConfirmResponse} thay thế.
     * @param recallRequestId ID của yêu cầu triệu hồi (không còn dùng)
     * @param dto DTO chứa phản hồi của khách hàng
     * @param customerUsername Username của khách hàng
     * @return RecallRequestResponseDTO
     * @throws UnsupportedOperationException Method này không còn được hỗ trợ
     */
    @Deprecated
    @Override
    public RecallRequestResponseDTO customerConfirmRecall(Long recallRequestId, RecallCustomerResponseDTO dto, String customerUsername) {
        throw new UnsupportedOperationException(
                "customerConfirmRecall() is deprecated. " +
                "Please use RecallResponseService.customerConfirmResponse() instead. " +
                "Migration: Instead of confirming a RecallRequest, customers now confirm individual RecallResponse for each of their vehicles."
        );
    }

    /**
     * Lấy danh sách các chiến dịch triệu hồi ảnh hưởng đến người dùng đang đăng nhập.
     * <p>
     * <strong>Thay đổi logic:</strong> Query qua RecallResponse để tìm campaigns ảnh hưởng đến xe của customer.
     *
     * @param username Username của người dùng.
     * @return Một danh sách các yêu cầu triệu hồi ảnh hưởng đến customer.
     */
    @Override
    public List<RecallRequestResponseDTO> getMyRecallRequests(String username) {
        // BƯỚC 1: Lấy User (khách hàng) từ username đã được xác thực
        User customerUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // BƯỚC 2: Validate user là customer
        Customer customer = customerUser.getCustomer();
        if (customer == null) {
            throw new IllegalStateException("The current user does not have a customer profile.");
        }

        // BƯỚC 3: Get customerId
        UUID customerId = customer.getCustomerId();
        logger.info("Getting recall campaigns affecting customer ID: {} (user: {})", customerId, username);

        // BƯỚC 4: Tìm tất cả RecallResponse của customer
        List<RecallResponse> responses = recallResponseRepository.findByCustomerId(customerId);

        // BƯỚC 5: Lấy danh sách unique RecallRequest từ responses
        Set<RecallRequest> recallRequests = responses.stream()
                .map(RecallResponse::getRecallRequest)
                .collect(Collectors.toSet());

        logger.info("Found {} recall campaigns affecting customer {}", recallRequests.size(), customerId);

        return recallRequests.stream()
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Xóa một yêu cầu triệu hồi.
     * <p>
     * <strong>Quy trình nghiệp vụ & Bảo mật:</strong>
     * <ol>
     *     <li><b>Xác thực trạng thái:</b> Chỉ cho phép xóa các yêu cầu đang ở trạng thái {@code PENDING_ADMIN_APPROVAL}.
     *     Nếu yêu cầu đã được xử lý, ném ra {@link IllegalStateException}.</li>
     *     <li><b>Xác thực quyền sở hữu:</b> Kiểm tra để đảm bảo người dùng đang thực hiện hành động này
     *     chính là người đã tạo ra yêu cầu. Nếu không, ném ra {@link AccessDeniedException}.</li>
     * </ol>
     * @param recallRequestId ID của yêu cầu cần xóa.
     * @param username Username của người thực hiện việc xóa.
     */
    @Override
    public void deleteRecallRequest(Long recallRequestId, String username) {
        logger.info("Deleting recall request: {}", recallRequestId);

        // BƯỚC 1: Lấy User (người xóa) từ username đã được xác thực
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // BƯỚC 2: Tìm RecallRequest
        RecallRequest recall = recallRequestRepository.findById(recallRequestId).orElseThrow(() -> new ResourceNotFoundException("RecallRequest", "id", recallRequestId));

        // BƯỚC 3: Validate status - CHỈ xóa PENDING_ADMIN_APPROVAL
        // Thiết kế: Ngăn chặn việc xóa các yêu cầu đã đi vào luồng xử lý để bảo toàn lịch sử.
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only delete recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // BƯỚC 4: Validate ownership - AUTHORIZATION CHECK
        // Thiết kế bảo mật: Đảm bảo một nhân viên không thể xóa yêu cầu của đồng nghiệp.
        if (!recall.getCreatedBy().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("You can only delete recall requests that you created");
        }

        // BƯỚC 5: Delete từ database
        recallRequestRepository.delete(recall);
        logger.info("Recall request deleted successfully: {}", recallRequestId);
    }
}
