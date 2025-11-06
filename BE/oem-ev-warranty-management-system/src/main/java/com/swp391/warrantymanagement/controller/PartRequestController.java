package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
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
import com.swp391.warrantymanagement.util.SecurityUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Yêu cầu Linh kiện (PartRequest).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: quản lý vòng đời trạng thái, xác thực quyền sở hữu)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link com.swp391.warrantymanagement.service.PartRequestService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, chuyển trạng thái không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/part-requests")
@RequiredArgsConstructor
public class PartRequestController {

    private static final Logger logger = LoggerFactory.getLogger(PartRequestController.class);

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final PartRequestService partRequestService;

    /**
     * Cho phép Kỹ thuật viên (SC_TECHNICIAN) tạo một yêu cầu linh kiện mới.
     *
     * @param requestDTO DTO chứa thông tin về yêu cầu (ID của claim, part bị lỗi, số lượng,...).
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> createPartRequest(
            @Valid @RequestBody PartRequestRequestDTO requestDTO,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng
        logger.info("Create part request - Warranty Claim ID: {}", requestDTO.getWarrantyClaimId());
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context,
        // không bao giờ tin tưởng vào ID do client gửi lên. `SecurityUtil` là một lớp tiện ích
        // giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to create a part request"));
        PartRequestResponseDTO response = partRequestService.createPartRequest(requestDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy thông tin chi tiết của một yêu cầu linh kiện dựa trên ID.
     *
     * @param id ID của yêu cầu linh kiện.
     * @return {@link ResponseEntity} chứa {@link PartRequestResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> getPartRequestById(@PathVariable Long id) {
        logger.info("Get part request by ID: {}", id);
        PartRequestResponseDTO response = partRequestService.getPartRequestById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách tất cả các yêu cầu linh kiện trong hệ thống.
     * Endpoint này dành cho các vai trò quản trị để có cái nhìn tổng quan.
     *
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp (ASC/DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu.
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
     * Lấy danh sách các yêu cầu linh kiện đang ở trạng thái "PENDING" (chờ duyệt).
     * Thường được sử dụng bởi EVM_STAFF để xem các yêu cầu cần xử lý.
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu đang chờ duyệt.
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
     * Lấy danh sách các yêu cầu linh kiện đang ở trạng thái "SHIPPED" (đang vận chuyển).
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu đang vận chuyển.
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
     * Lấy danh sách các yêu cầu linh kiện theo một trạng thái cụ thể.
     *
     * @param status  Trạng thái cần lọc (ví dụ: APPROVED, REJECTED).
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu phù hợp.
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
     * Lấy lịch sử các yêu cầu linh kiện cho một yêu cầu bảo hành (Warranty Claim) cụ thể.
     *
     * @param claimId ID của yêu cầu bảo hành.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu linh kiện liên quan.
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
     * Lấy danh sách các yêu cầu linh kiện được gửi từ một trung tâm bảo hành (Service Center) cụ thể.
     *
     * @param serviceCenterId ID của trung tâm bảo hành.
     * @param page            Số trang.
     * @param size            Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu linh kiện.
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
     * Cho phép Kỹ thuật viên (Technician) xem danh sách các yêu cầu linh kiện do chính họ tạo.
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu của người dùng.
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartRequestResponseDTO>> getMyPartRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Get my part requests - page: {}, size: {}", page, size);
        // Thiết kế bảo mật: Lấy username từ Security Context để đảm bảo người dùng chỉ xem được yêu cầu của chính mình.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view your part requests"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        PagedResponse<PartRequestResponseDTO> response = partRequestService.getMyPartRequests(username, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép nhân viên nhà sản xuất (EVM_STAFF) duyệt một yêu cầu linh kiện.
     *
     * @param id    ID của yêu cầu cần duyệt.
     * @param notes Ghi chú (tùy chọn) từ người duyệt.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật trạng thái.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> approvePartRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Approve part request: {}", id);
        // Thiết kế bảo mật: Lấy username của người duyệt từ Security Context để ghi lại vào lịch sử (audit trail).
        String approverUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to approve a part request"));
        PartRequestResponseDTO response = partRequestService.approvePartRequest(id, notes, approverUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép nhân viên nhà sản xuất (EVM_STAFF) từ chối một yêu cầu linh kiện.
     *
     * @param id              ID của yêu cầu cần từ chối.
     * @param rejectionReason Lý do từ chối (tùy chọn).
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật trạng thái.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> rejectPartRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String rejectionReason,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Reject part request: {}", id);
        // Thiết kế bảo mật: Lấy username của người từ chối từ Security Context để ghi lại vào lịch sử.
        String rejectorUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to reject a part request"));
        PartRequestResponseDTO response = partRequestService.rejectPartRequest(id, rejectionReason, rejectorUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép nhân viên nhà sản xuất (EVM_STAFF) đánh dấu một yêu cầu là đã được gửi đi.
     *
     * @param id             ID của yêu cầu.
     * @param trackingNumber Mã vận đơn (tùy chọn) để theo dõi.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PatchMapping("/{id}/ship")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartRequestResponseDTO> markAsShipped(
            @PathVariable Long id,
            @RequestParam(required = false) String trackingNumber,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Mark part request as shipped: {}", id);
        // Thiết kế: Lấy username của người thực hiện từ Security Context để ghi lại vào lịch sử.
        String shipperUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to mark a request as shipped"));
        PartRequestResponseDTO response = partRequestService.markAsShipped(id, trackingNumber, shipperUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép nhân viên trung tâm bảo hành (SC_TECHNICIAN/SC_STAFF) xác nhận đã nhận được linh kiện.
     *
     * @param id ID của yêu cầu.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PatchMapping("/{id}/deliver")
    @PreAuthorize("hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> markAsDelivered(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Mark part request as delivered: {}", id);
        // Thiết kế bảo mật: Lấy username của người xác nhận từ Security Context.
        String receiverUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to mark a request as delivered"));
        PartRequestResponseDTO response = partRequestService.markAsDelivered(id, receiverUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép Kỹ thuật viên (Technician) hủy một yêu cầu do chính họ tạo (chỉ khi yêu cầu đang ở trạng thái PENDING).
     *
     * @param id ID của yêu cầu cần hủy.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartRequestResponseDTO> cancelPartRequest(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng

        logger.info("Cancel part request: {}", id);
        // Thiết kế bảo mật: Lấy username từ Security Context để xác thực quyền sở hữu trước khi cho phép hủy.
        String cancellerUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to cancel a part request"));
        PartRequestResponseDTO response = partRequestService.cancelPartRequest(id, cancellerUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thống kê số lượng các yêu cầu linh kiện theo từng trạng thái.
     *
     * @return {@link ResponseEntity} chứa một Map với key là tên trạng thái và value là số lượng.
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<Map<String, Long>> getPartRequestStatistics() {
        logger.info("Get part request statistics");

        // Thiết kế: Việc gọi service nhiều lần trong một vòng lặp nhỏ (6 lần) là chấp nhận được
        // vì sự đơn giản và dễ hiểu. Một giải pháp tối ưu hơn có thể là tạo một phương thức
        // trong service để lấy tất cả các count chỉ bằng một câu lệnh query duy nhất (sử dụng GROUP BY).
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
