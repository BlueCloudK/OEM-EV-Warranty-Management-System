package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
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
import java.util.List;
import java.util.UUID;
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
        logger.info("Creating recall request for installed part: {}", dto.getInstalledPartId());

        // BƯỚC 1: Lấy User từ username đã được xác thực
        // REFACTOR: Xóa bỏ logic xử lý token. Service chỉ nhận username từ Controller.
        User createdBy = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // BƯỚC 2: Validate InstalledPart tồn tại
        // Thiết kế: Service chịu trách nhiệm xác thực sự tồn tại của tất cả các tài nguyên cần thiết.
        InstalledPart installedPart = installedPartRepository.findById(dto.getInstalledPartId()).orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", dto.getInstalledPartId()));

        // BƯỚC 3: Tạo RecallRequest entity
        RecallRequest recall = new RecallRequest();
        recall.setInstalledPart(installedPart); // Link to specific installed part
        recall.setReason(dto.getReason()); // Explain why recall (safety/quality issue)
        recall.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL); // Initial status

        // BƯỚC 4: Set metadata
        recall.setCreatedBy(createdBy); // Track WHO created recall
        recall.setCreatedAt(LocalDateTime.now()); // Track WHEN created
        recall.setUpdatedAt(LocalDateTime.now());

        // BƯỚC 5: Save và return
        RecallRequest savedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request created successfully with ID: {}", savedRecall.getRecallRequestId());

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
     * Lấy danh sách các yêu cầu triệu hồi của một khách hàng cụ thể.
     * <p>
     * <strong>Thiết kế & Hiệu năng:</strong>
     * <ul>
     *     <li>Logic lọc được thực hiện trong bộ nhớ (in-memory) bằng Stream API sau khi lấy tất cả các bản ghi.</li>
     *     <li><b>Lưu ý về hiệu năng:</b> Cách tiếp cận này có thể không hiệu quả với tập dữ liệu lớn do phải tải toàn bộ bảng {@code recall_requests}.
     *     Một giải pháp tối ưu hơn là tạo một phương thức truy vấn tùy chỉnh trong {@link RecallRequestRepository} sử dụng JOIN để lọc ở cấp độ database.</li>
     * </ul>
     * @param customerId UUID của khách hàng.
     * @return Một danh sách các yêu cầu triệu hồi của khách hàng đó.
     */
    @Override
    @Transactional(readOnly = true)
    public List<RecallRequestResponseDTO> getRecallRequestsForCustomer(UUID customerId) {
        logger.info("Getting recall requests for customer: {}", customerId);

        // STREAM API với filter chain
        return recallRequestRepository.findAll().stream() // Lấy tất cả
                .filter(r -> r.getInstalledPart() != null && // NULL SAFETY: Check installedPart
                        r.getInstalledPart().getVehicle() != null && // Check vehicle
                        r.getInstalledPart().getVehicle().getCustomer() != null && // Check customer
                        r.getInstalledPart().getVehicle().getCustomer().getCustomerId().equals(customerId)) // Filter by customerId
                .map(RecallRequestMapper::toResponseDTO) // Entity → DTO
                .collect(Collectors.toList()); // Collect to List
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
        recall.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM); // Next state
        recall.setAdminNote(adminNote); // Optional explanation
        recall.setApprovedBy(approvedBy); // Track WHO approved
        recall.setUpdatedAt(LocalDateTime.now());

        // BƯỚC 6: Save
        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request approved: {} - Now waiting for customer confirmation", recallRequestId);

        // BƯỚC 7: TODO - Send notification to customer
        // Customer của vehicle bị ảnh hưởng
        // notificationService.sendRecallNotification(recall);
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
     * Xử lý phản hồi của khách hàng đối với một yêu cầu triệu hồi.
     * Đây là một phương thức nghiệp vụ quan trọng với hai luồng xử lý chính.
     * <p>
     * <strong>Quy trình nghiệp vụ & Bảo mật:</strong>
     * <ol>
     *     <li><b>Xác thực quyền sở hữu:</b> Kiểm tra để đảm bảo người dùng đang thực hiện hành động này
     *     chính là chủ sở hữu của chiếc xe liên quan đến yêu cầu triệu hồi. Nếu không, ném ra {@link AccessDeniedException}.</li>
     *     <li><b>Xác thực trạng thái:</b> Chỉ cho phép xác nhận các yêu cầu đang ở trạng thái {@code WAITING_CUSTOMER_CONFIRM}.</li>
     *     <li><b>Luồng 1: Khách hàng chấp nhận (Accepted = true)</b>
     *         <ul>
     *             <li>Tự động tạo một {@link WarrantyClaim} mới với trạng thái {@code PROCESSING} (bỏ qua bước duyệt của quản lý).</li>
     *             <li>Liên kết yêu cầu triệu hồi và yêu cầu bảo hành với nhau.</li>
     *             <li>Cập nhật trạng thái của yêu cầu triệu hồi thành {@code CLAIM_CREATED}.</li>
     *         </ul>
     *     </li>
     *     <li><b>Luồng 2: Khách hàng từ chối (Accepted = false)</b>
     *         <ul>
     *             <li>Cập nhật trạng thái của yêu cầu triệu hồi thành {@code REJECTED_BY_CUSTOMER}.</li>
     *             <li>Ghi log cảnh báo về rủi ro an toàn.</li>
     *         </ul>
     *     </li>
     * </ol>
     * @param recallRequestId ID của yêu cầu triệu hồi.
     * @param dto DTO chứa phản hồi của khách hàng.
     * @param customerUsername Username của khách hàng.
     * @return Yêu cầu đã được cập nhật.
     */
    @Override
    public RecallRequestResponseDTO customerConfirmRecall(Long recallRequestId, RecallCustomerResponseDTO dto, String customerUsername) {
        logger.info("Customer confirming recall request: {} - Accepted: {}", recallRequestId, dto.getAccepted());

        // BƯỚC 1: Lấy User (khách hàng) từ username đã được xác thực
        User customerUser = userRepository.findByUsername(customerUsername).orElseThrow(() -> new ResourceNotFoundException("User", "username", customerUsername));

        // BƯỚC 2: Tìm RecallRequest
        RecallRequest recall = recallRequestRepository.findById(recallRequestId).orElseThrow(() -> new ResourceNotFoundException("RecallRequest", "id", recallRequestId));

        // BƯỚC 3: Validate ownership - AUTHORIZATION CHECK
        // Thiết kế bảo mật: Đây là bước kiểm tra quyền sở hữu ở tầng nghiệp vụ, đảm bảo một người dùng không thể thực hiện hành động trên dữ liệu của người dùng khác.
        if (!recall.getInstalledPart().getVehicle().getCustomer().getUser().getUserId().equals(customerUser.getUserId())) {
            throw new AccessDeniedException("You can only confirm recall requests for your own vehicles");
        }

        // BƯỚC 4: Validate state transition
        // CHỈ confirm khi status = WAITING_CUSTOMER_CONFIRM
        if (recall.getStatus() != RecallRequestStatus.WAITING_CUSTOMER_CONFIRM) {
            throw new IllegalStateException("Can only confirm recall requests with status WAITING_CUSTOMER_CONFIRM. Current status: " + recall.getStatus());
        }

        // Set customer note (optional explanation)
        recall.setCustomerNote(dto.getCustomerNote());
        recall.setUpdatedAt(LocalDateTime.now());

        if (dto.getAccepted()) {
            // ===== CASE A: CUSTOMER ACCEPT - AUTO-CREATE WARRANTY CLAIM =====
            logger.info("Customer accepted recall - Creating warranty claim automatically");
            // Thiết kế: Tự động hóa việc tạo claim giúp giảm thiểu các bước thủ công cho khách hàng và nhân viên, đồng thời ưu tiên xử lý các vấn đề triệu hồi.
            // Create WarrantyClaim entity
            WarrantyClaim claim = new WarrantyClaim();
            claim.setVehicle(recall.getInstalledPart().getVehicle()); // Xe bị ảnh hưởng
            claim.setInstalledPart(recall.getInstalledPart()); // Part cần thay
            claim.setDescription("RECALL: " + recall.getReason()); // Prefix để identify
            claim.setStatus(WarrantyClaimStatus.PROCESSING); // BYPASS MANAGER_REVIEW (ưu tiên cao)
            claim.setClaimDate(LocalDateTime.now());
            claim.setServiceCenter(recall.getInstalledPart().getVehicle().getCustomer().getUser().getServiceCenter()); // SC gần customer
            claim.setRecallRequest(recall); // Link back to recall (bidirectional)

            // TODO: Auto-assign technician tại service center
            // User technician = findAvailableTechnician(claim.getServiceCenter());
            // claim.setAssignedTo(technician);
            // SMART ASSIGNMENT: Technician có skills phù hợp với part type

            // Save WarrantyClaim
            WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
            logger.info("Warranty claim created automatically from recall: Claim ID = {}", savedClaim.getWarrantyClaimId());

            // Update RecallRequest status và link
            recall.setStatus(RecallRequestStatus.CLAIM_CREATED); // Success state
            recall.setWarrantyClaim(savedClaim); // Bidirectional link

        } else {
            // ===== CASE B: CUSTOMER REJECT - SAFETY WARNING =====
            logger.warn("Customer rejected recall request: {} - Reason: {}", recallRequestId, dto.getCustomerNote());

            // Update status - REJECTED_BY_CUSTOMER là concern state
            recall.setStatus(RecallRequestStatus.REJECTED_BY_CUSTOMER);

            // TODO: Send warning notification to admin
            // notificationService.sendCustomerRejectionWarning(recall);
            // Legal team may need to document this rejection
            // Customer aware of safety risk but declined recall
        }

        // BƯỚC 6: Save updated RecallRequest
        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request updated with customer response: {}", recallRequestId);

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    /**
     * Lấy danh sách các yêu cầu triệu hồi của người dùng đang đăng nhập.
     * @param username Username của người dùng.
     * @return Một danh sách các yêu cầu triệu hồi của người dùng đó.
     */
    @Override
    public List<RecallRequestResponseDTO> getMyRecallRequests(String username) {
        // BƯỚC 1: Lấy User (khách hàng) từ username đã được xác thực
        User customerUser = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // BƯỚC 2: Validate user là customer
        // Thiết kế: Đảm bảo rằng chỉ những người dùng có hồ sơ khách hàng mới có thể thực hiện hành động này.
        Customer customer = customerUser.getCustomer();
        if (customer == null) {
            throw new IllegalStateException("The current user does not have a customer profile.");
        }

        // BƯỚC 3: Get customerId
        UUID customerId = customer.getCustomerId();
        logger.info("Getting recall requests for customer ID: {} (user: {})", customerId, username);

        // BƯỚC 4: Filter recalls theo customerId
        // Thiết kế: Lọc trong bộ nhớ. Xem xét tối ưu hóa bằng cách tạo query tùy chỉnh trong repository nếu cần.
        List<RecallRequest> recalls = recallRequestRepository.findAll().stream()
                .filter(r -> r.getInstalledPart() != null
                        && r.getInstalledPart().getVehicle() != null
                        && r.getInstalledPart().getVehicle().getCustomer() != null
                        && r.getInstalledPart().getVehicle().getCustomer().getCustomerId().equals(customerId))
                .collect(Collectors.toList());

        logger.info("Found {} recall requests for customer {}", recalls.size(), customerId);

        // BƯỚC 5: Convert và return
        return recalls.stream()
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
