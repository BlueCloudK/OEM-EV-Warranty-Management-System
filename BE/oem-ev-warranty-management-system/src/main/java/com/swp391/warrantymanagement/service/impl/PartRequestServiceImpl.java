package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.PartRequestMapper;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.service.JwtService;
import com.swp391.warrantymanagement.service.PartRequestService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ cho quy trình Yêu cầu Linh kiện (Part Request).
 * <p>
 * <strong>Thiết kế & Trách nhiệm:</strong>
 * <ul>
 *     <li><b>Quản lý Vòng đời (State Machine):</b> Quản lý và xác thực các bước chuyển trạng thái của một yêu cầu,
 *     tuân theo quy trình: {@code PENDING -> APPROVED -> SHIPPED -> DELIVERED}.
 *     Việc chuyển trạng thái không hợp lệ sẽ ném ra {@link IllegalStateException}.</li>
 *     <li><b>Tách biệt Trách nhiệm:</b> Lớp này hoàn toàn không biết về các chi tiết của tầng Web (ví dụ: HTTP Header, JWT token).
 *     Nó chỉ nhận các định danh đã được xác thực (ví dụ: {@code username}) từ Controller.</li>
 *     <li><b>Xử lý Lỗi:</b> Sử dụng các exception có ngữ nghĩa rõ ràng ({@link ResourceNotFoundException}, {@link IllegalStateException}, {@link AccessDeniedException})
 *     để báo hiệu các lỗi nghiệp vụ. Các lỗi này sẽ được {@code GlobalExceptionHandler} xử lý một cách tập trung.</li>
 *     <li><b>Tính toàn vẹn Dữ liệu:</b> Sử dụng {@code @Transactional} để đảm bảo các thao tác ghi vào database
 *     diễn ra một cách nguyên tử (atomic).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PartRequestServiceImpl implements PartRequestService {

    private static final Logger logger = LoggerFactory.getLogger(PartRequestServiceImpl.class);

    // REFACTOR: Chuyển sang Constructor Injection.
    // - @RequiredArgsConstructor sẽ tự động tạo constructor cho các trường `final`.
    // - Đây là cách được khuyến khích để tiêm phụ thuộc, giúp code dễ test và đảm bảo các dependency là bất biến.
    private final PartRequestRepository partRequestRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;
    private final ServiceCenterRepository serviceCenterRepository;

    /**
     * Tạo một yêu cầu linh kiện mới.
     * <p>
     * <strong>Quy trình nghiệp vụ:</strong>
     * <ol>
     *     <li>Xác thực sự tồn tại của các tài nguyên liên quan (User, WarrantyClaim, Part, ServiceCenter).</li>
     *     <li>Tạo một thực thể {@link PartRequest} với trạng thái ban đầu là {@code PENDING}.</li>
     *     <li>Lưu vào cơ sở dữ liệu và trả về DTO tương ứng.</li>
     * </ol>
     *
     * @param requestDTO part request data
     * @param username authenticated username
     * @return created part request
     * @throws ResourceNotFoundException nếu user, warranty claim, part hoặc service center không tồn tại
     */
    @Override
    public PartRequestResponseDTO createPartRequest(PartRequestRequestDTO requestDTO, String username) {
        logger.info("Creating part request for warranty claim: {}", requestDTO.getWarrantyClaimId());

        // Thiết kế: Tầng Service chịu trách nhiệm xác thực sự tồn tại của tất cả các tài nguyên cần thiết
        // trước khi thực hiện logic chính. Nếu bất kỳ tài nguyên nào không tồn tại, ném ra ResourceNotFoundException.
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Warranty claim not found: " + requestDTO.getWarrantyClaimId()));

        Part faultyPart = partRepository.findById(requestDTO.getFaultyPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found: " + requestDTO.getFaultyPartId()));

        ServiceCenter serviceCenter = serviceCenterRepository.findById(requestDTO.getServiceCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found: " + requestDTO.getServiceCenterId()));

        PartRequest partRequest = PartRequestMapper.toEntity(requestDTO, warrantyClaim, faultyPart, requester, serviceCenter);
        PartRequest savedRequest = partRequestRepository.save(partRequest);

        logger.info("Part request created successfully with ID: {}", savedRequest.getRequestId());
        return PartRequestMapper.toResponseDTO(savedRequest);
    }

    /**
     * Lấy thông tin chi tiết của một yêu cầu linh kiện dựa trên ID.
     *
     * @param requestId request ID
     * @return part request response DTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional(readOnly = true)
    public PartRequestResponseDTO getPartRequestById(Long requestId) {
        logger.info("Getting part request by ID: {}", requestId);
        // Thiết kế: Sử dụng .orElseThrow() là một cách làm an toàn và súc tích để xử lý trường hợp
        // tài nguyên không tồn tại, thay vì kiểm tra null một cách thủ công.
        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));
        return PartRequestMapper.toResponseDTO(partRequest);
    }

    /**
     * Lấy tất cả part requests với pagination.
     *
     * @param pageable pagination parameters
     * @return paged response of part requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getAllPartRequests(Pageable pageable) {
        logger.info("Getting all part requests with pagination");
        Page<PartRequest> page = partRequestRepository.findAll(pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Lấy part requests theo status (PENDING, APPROVED, REJECTED, SHIPPED, DELIVERED, CANCELLED).
     *
     * @param status part request status
     * @param pageable pagination parameters
     * @return paged response of part requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByStatus(PartRequestStatus status, Pageable pageable) {
        logger.info("Getting part requests by status: {}", status);
        Page<PartRequest> page = partRequestRepository.findByStatus(status, pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Duyệt một yêu cầu linh kiện.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code PENDING}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code APPROVED}, ghi lại người duyệt và thời gian duyệt.</li>
     * </ul>
     *
     * @param requestId request ID
     * @param notes optional approval notes
     * @param approverUsername approver username
     * @return approved part request
     * @throws ResourceNotFoundException nếu user hoặc request không tồn tại
     * @throws IllegalStateException nếu request không ở trạng thái PENDING
     */
    @Override
    public PartRequestResponseDTO approvePartRequest(Long requestId, String notes, String approverUsername) {
        logger.info("Approving part request: {}", requestId);

        User evmStaff = userRepository.findByUsername(approverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + approverUsername));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Thiết kế: Kiểm tra trạng thái hiện tại là một bước cực kỳ quan trọng để đảm bảo tính toàn vẹn
        // của quy trình nghiệp vụ. Ném ra IllegalStateException nếu quy tắc bị vi phạm.
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only approve PENDING requests");
        }

        partRequest.setStatus(PartRequestStatus.APPROVED);
        partRequest.setApprovedBy(evmStaff);
        partRequest.setApprovedDate(LocalDateTime.now());
        partRequest.setNotes(notes);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request approved: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    /**
     * Từ chối một yêu cầu linh kiện.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code PENDING}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code REJECTED} (trạng thái cuối cùng), ghi lại người từ chối và lý do.</li>
     * </ul>
     *
     * @param requestId request ID
     * @param rejectionReason required rejection explanation
     * @param rejectorUsername rejector username
     * @return rejected part request
     * @throws ResourceNotFoundException nếu user hoặc request không tồn tại
     * @throws IllegalStateException nếu request không ở trạng thái PENDING
     */
    @Override
    public PartRequestResponseDTO rejectPartRequest(Long requestId, String rejectionReason, String rejectorUsername) {
        logger.info("Rejecting part request: {}", requestId);

        User evmStaff = userRepository.findByUsername(rejectorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + rejectorUsername));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Thiết kế: Tương tự như approve, việc kiểm tra trạng thái là bắt buộc.
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only reject PENDING requests");
        }

        partRequest.setStatus(PartRequestStatus.REJECTED);
        partRequest.setApprovedBy(evmStaff);
        partRequest.setApprovedDate(LocalDateTime.now());
        partRequest.setRejectionReason(rejectionReason);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request rejected: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    /**
     * Đánh dấu một yêu cầu linh kiện là đã được gửi đi.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code APPROVED}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code SHIPPED}, ghi lại thời gian gửi và mã vận đơn.</li>
     * </ul>
     *
     * @param requestId request ID
     * @param trackingNumber carrier tracking number
     * @param shipperUsername shipper username
     * @return shipped part request
     * @throws ResourceNotFoundException nếu user hoặc request không tồn tại
     * @throws IllegalStateException nếu request không ở trạng thái APPROVED
     */
    @Override
    public PartRequestResponseDTO markAsShipped(Long requestId, String trackingNumber, String shipperUsername) {
        logger.info("Marking part request as shipped: {}", requestId);

        User shipper = userRepository.findByUsername(shipperUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + shipperUsername));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Thiết kế: Đảm bảo chỉ những yêu cầu đã được duyệt mới có thể được gửi đi.
        if (partRequest.getStatus() != PartRequestStatus.APPROVED) {
            throw new IllegalStateException("Can only ship APPROVED requests");
        }

        partRequest.setStatus(PartRequestStatus.SHIPPED);
        partRequest.setShippedDate(LocalDateTime.now());
        partRequest.setTrackingNumber(trackingNumber);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request marked as shipped: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    /**
     * Đánh dấu một yêu cầu linh kiện là đã được giao thành công.
     * <p>
     * <strong>Quy trình nghiệp vụ (State Machine):</strong>
     * <ul>
     *     <li><b>Điều kiện:</b> Yêu cầu phải đang ở trạng thái {@code SHIPPED}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code DELIVERED} (trạng thái thành công cuối cùng), ghi lại thời gian nhận hàng.</li>
     * </ul>
     *
     * @param requestId request ID
     * @param receiverUsername receiver username
     * @return delivered part request
     * @throws ResourceNotFoundException nếu user hoặc request không tồn tại
     * @throws IllegalStateException nếu request không ở trạng thái SHIPPED
     */
    @Override
    public PartRequestResponseDTO markAsDelivered(Long requestId, String receiverUsername) {
        logger.info("Marking part request as delivered: {}", requestId);

        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + receiverUsername));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Thiết kế: Đảm bảo chỉ những yêu cầu đang trên đường vận chuyển mới có thể được xác nhận đã nhận.
        if (partRequest.getStatus() != PartRequestStatus.SHIPPED) {
            throw new IllegalStateException("Can only mark SHIPPED requests as delivered");
        }

        partRequest.setStatus(PartRequestStatus.DELIVERED);
        partRequest.setDeliveredDate(LocalDateTime.now());

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request marked as delivered: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    /**
     * Lấy pending part requests (chờ approve) với pagination.
     *
     * @param pageable pagination parameters
     * @return paged response of pending requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPendingRequests(Pageable pageable) {
        logger.info("Getting pending part requests");
        Page<PartRequest> page = partRequestRepository.findPendingRequests(pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Lấy in-transit part requests (đang vận chuyển - SHIPPED status).
     *
     * @param pageable pagination parameters
     * @return paged response of in-transit requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getInTransitRequests(Pageable pageable) {
        logger.info("Getting in-transit part requests");
        Page<PartRequest> page = partRequestRepository.findInTransitRequests(pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Lấy part requests theo warranty claim ID.
     *
     * @param warrantyClaimId warranty claim ID
     * @param pageable pagination parameters
     * @return paged response of part requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByWarrantyClaim(Long warrantyClaimId, Pageable pageable) {
        logger.info("Getting part requests for warranty claim: {}", warrantyClaimId);
        Page<PartRequest> page = partRequestRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId, pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Lấy part requests theo service center ID.
     *
     * @param serviceCenterId service center ID
     * @param pageable pagination parameters
     * @return paged response of part requests
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByServiceCenter(Long serviceCenterId, Pageable pageable) {
        logger.info("Getting part requests for service center: {}", serviceCenterId);
        Page<PartRequest> page = partRequestRepository.findByServiceCenterServiceCenterId(serviceCenterId, pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Lấy danh sách các yêu cầu linh kiện do người dùng hiện tại tạo.
     *
     * @param username Username của người dùng đang đăng nhập.
     * @param pageable Thông tin phân trang.
     * @return Một trang các yêu cầu của người dùng đó.
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getMyPartRequests(String username, Pageable pageable) {
        logger.info("Getting part requests for current user");

        // BƯỚC 1: Lấy User từ username đã được xác thực
        // Thiết kế: Tầng Service nhận username và tự tìm kiếm User, không phụ thuộc vào việc Controller truyền User entity.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // BƯỚC 2: Query requests của user này
        // Thiết kế: Tận dụng sức mạnh của Spring Data JPA để tạo câu truy vấn dựa trên tên phương thức, giúp code gọn gàng.
        Page<PartRequest> page = partRequestRepository.findByRequestedByUserId(user.getUserId(), pageable);
        return new PagedResponse<>(
                PartRequestMapper.toResponseDTOList(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Hủy một yêu cầu linh kiện.
     * <p>
     * <strong>Quy trình nghiệp vụ & Bảo mật:</strong>
     * <ol>
     *     <li><b>Xác thực quyền sở hữu:</b> Kiểm tra để đảm bảo người dùng đang thực hiện hành động này
     *     chính là người đã tạo ra yêu cầu. Nếu không, ném ra {@link AccessDeniedException}.</li>
     *     <li><b>Xác thực trạng thái:</b> Chỉ cho phép hủy các yêu cầu đang ở trạng thái {@code PENDING}.
     *     Nếu yêu cầu đã được xử lý, ném ra {@link IllegalStateException}.</li>
     *     <li><b>Hành động:</b> Chuyển trạng thái sang {@code CANCELLED} (trạng thái cuối cùng).</li>
     * </ol>
     *
     * @param requestId ID của yêu cầu cần hủy.
     * @param cancellerUsername Username của người thực hiện việc hủy.
     * @return Yêu cầu đã được cập nhật trạng thái.
     */
    @Override
    public PartRequestResponseDTO cancelPartRequest(Long requestId, String cancellerUsername) {
        logger.info("Cancelling part request: {}", requestId);

        // BƯỚC 1: Lấy User (người hủy) từ username đã được xác thực
        User user = userRepository.findByUsername(cancellerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + cancellerUsername));

        // BƯỚC 2: Tìm PartRequest
        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // BƯỚC 3: Xác thực quyền sở hữu - AUTHORIZATION CHECK
        // Thiết kế bảo mật: Đây là bước kiểm tra quyền sở hữu ở tầng nghiệp vụ, đảm bảo một người dùng
        // không thể thực hiện hành động trên dữ liệu của người dùng khác.
        if (!partRequest.getRequestedBy().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("You can only cancel your own requests");
        }

        // BƯỚC 4: Xác thực việc chuyển đổi trạng thái
        // CHỈ cancel PENDING requests (chưa approve)
        // Request đã APPROVED/SHIPPED/DELIVERED không thể cancel
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only cancel PENDING requests");
        }

        // BƯỚC 5: Update status - CANCELLED là final state
        partRequest.setStatus(PartRequestStatus.CANCELLED);
        PartRequest updated = partRequestRepository.save(partRequest);

        logger.info("Part request cancelled: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    /**
     * Xóa yêu cầu đã bị hủy.
     * <p>
     * <strong>Quy trình nghiệp vụ & Bảo mật:</strong>
     * <ol>
     *     <li><b>Xác thực quyền sở hữu:</b> Kiểm tra để đảm bảo người dùng đang thực hiện hành động này
     *     chính là người đã tạo ra yêu cầu. Nếu không, ném ra {@link AccessDeniedException}.</li>
     *     <li><b>Xác thực trạng thái:</b> Chỉ cho phép xóa các yêu cầu đang ở trạng thái {@code CANCELLED}.
     *     Nếu yêu cầu đang ở trạng thái khác, ném ra {@link IllegalStateException}.</li>
     *     <li><b>Hành động:</b> Xóa vĩnh viễn yêu cầu khỏi database.</li>
     * </ol>
     *
     * @param requestId ID của yêu cầu cần xóa.
     * @param authorizationHeader Authorization header chứa JWT token (không sử dụng, giữ lại để tương thích).
     * @throws ResourceNotFoundException nếu không tìm thấy yêu cầu hoặc user.
     * @throws AccessDeniedException nếu user không phải là người tạo yêu cầu.
     * @throws IllegalStateException nếu yêu cầu không ở trạng thái CANCELLED.
     */
    @Override
    public void deletePartRequest(Long requestId, String authorizationHeader) {
        logger.info("Deleting part request: {}", requestId);

        // BƯỚC 1: Lấy User từ Security Context
        String deleterUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to delete a part request"));
        User user = userRepository.findByUsername(deleterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + deleterUsername));

        // BƯỚC 2: Tìm PartRequest
        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // BƯỚC 3: Xác thực quyền sở hữu - AUTHORIZATION CHECK
        // Thiết kế bảo mật: Đây là bước kiểm tra quyền sở hữu ở tầng nghiệp vụ, đảm bảo một người dùng
        // không thể thực hiện hành động trên dữ liệu của người dùng khác.
        if (!partRequest.getRequestedBy().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("You can only delete your own requests");
        }

        // BƯỚC 4: Xác thực trạng thái
        // CHỈ delete CANCELLED requests
        // Request ở trạng thái khác không thể xóa
        if (partRequest.getStatus() != PartRequestStatus.CANCELLED) {
            throw new IllegalStateException("Can only delete CANCELLED requests");
        }

        // BƯỚC 5: Xóa request
        partRequestRepository.delete(partRequest);

        logger.info("Part request deleted: {}", requestId);
    }

    /**
     * Đếm số lượng yêu cầu linh kiện theo một trạng thái cụ thể.
     * Thường được sử dụng để hiển thị các số liệu thống kê trên dashboard.
     *
     * @param status Trạng thái cần đếm.
     * @return Số lượng yêu cầu có trạng thái đó.
     */
    @Override
    @Transactional(readOnly = true)
    public Long countByStatus(PartRequestStatus status) {
        return partRequestRepository.countByStatus(status);
    }
}
