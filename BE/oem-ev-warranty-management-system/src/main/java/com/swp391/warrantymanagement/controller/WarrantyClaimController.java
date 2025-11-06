package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Yêu cầu Bảo hành (WarrantyClaim).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: quản lý vòng đời trạng thái, xác thực quyền sở hữu, kiểm tra thời hạn bảo hành)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link WarrantyClaimService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, chuyển trạng thái không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
@RequiredArgsConstructor
public class WarrantyClaimController {
    private static final Logger logger = LoggerFactory.getLogger(WarrantyClaimController.class);

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
    private final WarrantyClaimService warrantyClaimService;

    /**
     * Lấy danh sách tất cả các yêu cầu bảo hành trong hệ thống, hỗ trợ phân trang.
     * Endpoint này dành cho các vai trò quản trị và nhân viên để có cái nhìn tổng quan.
     *
     * @param page Số trang (mặc định là 0).
     * @param size Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu bảo hành.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all warranty claims request: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getAllClaimsPage(PageRequest.of(page, size));
        logger.info("Get all warranty claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Lấy thông tin chi tiết của một yêu cầu bảo hành dựa trên ID.
     *
     * @param id ID của yêu cầu bảo hành.
     * @return {@link ResponseEntity} chứa {@link WarrantyClaimResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> getClaimById(@PathVariable Long id) {
        logger.info("Get warranty claim by id: {}", id);
        // Thiết kế "Happy Path": Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        WarrantyClaimResponseDTO claim = warrantyClaimService.getClaimById(id);
        logger.info("Warranty claim found: {}", id);
        return ResponseEntity.ok(claim);
    }

    /**
     * Tạo một yêu cầu bảo hành mới.
     * Endpoint này thường được sử dụng bởi nhân viên tại trung tâm bảo hành (SC_STAFF).
     *
     * @param requestDTO DTO chứa thông tin về yêu cầu bảo hành.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> createClaim(@Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("Create warranty claim request by SC_STAFF: {}", requestDTO);
        // Thiết kế: Controller không cần khối try-catch.
        // Nếu có lỗi nghiệp vụ (ví dụ: linh kiện không tồn tại, xe không thuộc về khách hàng, hết hạn bảo hành),
        // tầng Service sẽ ném ra một exception cụ thể (ví dụ: ResourceNotFoundException, IllegalArgumentException).
        // GlobalExceptionHandler sẽ bắt các exception này và trả về response lỗi HTTP tương ứng (404, 400,...).
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaim(requestDTO);
        logger.info("Warranty claim created: {}", responseDTO.getWarrantyClaimId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật thông tin chi tiết của một yêu cầu bảo hành.
     *
     * @param id         ID của yêu cầu cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaim(@PathVariable Long id,
                                                              @Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("Update warranty claim request: id={}, data={}", id, requestDTO);
        // Thiết kế: Tương tự như các endpoint khác, Controller không xử lý logic lỗi.
        // Nếu ID không tồn tại, service sẽ ném ResourceNotFoundException -> 404 Not Found.
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaim(id, requestDTO);
        logger.info("Warranty claim updated: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Cập nhật trạng thái của một yêu cầu bảo hành. Endpoint này chỉ dành cho ADMIN để có quyền kiểm soát cao nhất.
     *
     * @param id         ID của yêu cầu cần cập nhật trạng thái.
     * @param requestDTO DTO chứa trạng thái mới và các ghi chú liên quan.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaimStatus(@PathVariable Long id,
        @Valid @RequestBody WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        logger.info("Update warranty claim status request: id={}, data={}", id, requestDTO);
        // Thiết kế: Tầng Service sẽ sử dụng `WarrantyClaimStatusValidator` để xác thực
        // xem việc chuyển từ trạng thái cũ sang trạng thái mới có hợp lệ hay không.
        // Nếu không hợp lệ, service sẽ ném `IllegalStateException` -> 409 Conflict.
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaimStatus(id, requestDTO);
        logger.info("Warranty claim status updated: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Xóa một yêu cầu bảo hành. Endpoint này chỉ dành cho ADMIN.
     *
     * @param id ID của yêu cầu cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        logger.info("Delete warranty claim request: {}", id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Logic nghiệp vụ có thể ngăn chặn việc xóa các claim đang ở trạng thái quan trọng.
        warrantyClaimService.deleteClaim(id);
        logger.info("Warranty claim deleted: {}", id);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    // ========== WORKFLOW ENDPOINTS ==========

    /**
     * SC Staff tạo claim cho khách hàng (status: SUBMITTED)
     * Endpoint này thể hiện bước đầu tiên trong quy trình bảo hành.
     */
    @PostMapping("/sc-create")
    @PreAuthorize("hasRole('SC_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> createClaimBySCStaff(
            @Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("SC Staff create warranty claim request: {}", requestDTO);
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaimBySCStaff(requestDTO);
        logger.info("Warranty claim created by SC Staff: {}", responseDTO.getWarrantyClaimId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Admin xem xét và chấp nhận claim (SUBMITTED → MANAGER_REVIEW)
     * Endpoint này thể hiện bước duyệt yêu cầu từ phía quản lý.
     */
    @PatchMapping("/{id}/admin-accept")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyClaimResponseDTO> adminAcceptClaim(
            @PathVariable Long id,
            @RequestBody(required = false) String note) {
        logger.info("Admin accept warranty claim: id={}, note={}", id, note);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.adminAcceptClaim(id, note);
        logger.info("Warranty claim accepted by Admin: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Admin từ chối claim (SUBMITTED → REJECTED)
     * Endpoint này thể hiện bước từ chối yêu cầu từ phía quản lý.
     */
    @PatchMapping("/{id}/admin-reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyClaimResponseDTO> adminRejectClaim(
            @PathVariable Long id,
            @RequestParam String reason) {
        logger.info("Admin reject warranty claim: id={}, reason={}", id, reason);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.adminRejectClaim(id, reason);
        logger.info("Warranty claim rejected by Admin: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Technician bắt đầu xử lý claim (MANAGER_REVIEW → PROCESSING)
     * Endpoint này thể hiện việc kỹ thuật viên bắt đầu công việc sửa chữa.
     */
    @PatchMapping("/{id}/tech-start")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> techStartProcessing(
            @PathVariable Long id,
            @RequestBody(required = false) String note) {
        logger.info("Technician start processing claim: id={}, note={}", id, note);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techStartProcessing(id, note);
        logger.info("Claim processing started by technician: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Technician hoàn tất xử lý claim (PROCESSING → COMPLETED)
     * Endpoint này thể hiện việc kỹ thuật viên hoàn thành công việc sửa chữa.
     */
    @PatchMapping("/{id}/tech-complete")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> techCompleteClaim(
            @PathVariable Long id,
            @RequestParam String completionNote) {
        logger.info("Technician complete claim: id={}, note={}", id, completionNote);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techCompleteClaim(id, completionNote);
        logger.info("Claim completed by technician: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Lấy danh sách các yêu cầu bảo hành theo một trạng thái cụ thể.
     *
     * @param status Trạng thái cần lọc.
     * @param page   Số trang.
     * @param size   Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu phù hợp.
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getClaimsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get claims by status: status={}, page={}, size={}", status, page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getClaimsByStatus(status, PageRequest.of(page, size));
        logger.info("Get claims by status success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Lấy claims cần Admin xử lý (status = SUBMITTED)
     * Đây là một API tiện ích cho dashboard của Admin.
     */
    @GetMapping("/admin-pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getAdminPendingClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get Admin pending claims: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getClaimsByStatus("SUBMITTED", PageRequest.of(page, size));
        logger.info("Get Admin pending claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Lấy claims cần Technician xử lý (status = MANAGER_REVIEW hoặc PROCESSING)
     * Đây là một API tiện ích cho dashboard của Kỹ thuật viên.
     */
    @GetMapping("/tech-pending")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getTechPendingClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get technician pending claims: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getTechPendingClaims(PageRequest.of(page, size));
        logger.info("Get technician pending claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Cho phép Admin tự gán một yêu cầu bảo hành cho chính mình để xử lý.
     *
     * @param claimId ID của yêu cầu cần gán.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật người xử lý.
     */
    @PostMapping("/{claimId}/assign-to-me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyClaimResponseDTO> assignClaimToMe(
            @PathVariable Long claimId,
            @RequestParam(required = false) Long userId) { // Giữ lại để tương thích, nhưng không sử dụng
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ Security Context.
        // Điều này đảm bảo một Admin không thể giả mạo ID để gán claim cho một Admin khác,
        // mà chỉ có thể gán cho chính bản thân họ.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to assign a claim"));
        logger.info("Assign claim to me: claimId={}, user={}", claimId, username);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.assignClaimToMe(claimId, username);
        logger.info("Claim assigned successfully: claimId={}, assignedTo={}", claimId, username);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Lấy danh sách các yêu cầu bảo hành đã được gán cho Admin đang đăng nhập.
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các yêu cầu đã được gán.
     */
    @GetMapping("/my-assigned-claims")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getMyAssignedClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId) { // Giữ lại để tương thích, nhưng không sử dụng
        // Thiết kế bảo mật: Lấy username từ Security Context để đảm bảo Admin chỉ xem được các claim của chính mình.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view assigned claims"));
        logger.info("Get my assigned claims: user={}, page={}, size={}", username, page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage =
            warrantyClaimService.getMyAssignedClaims(username, PageRequest.of(page, size));
        logger.info("Get my assigned claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    // ========== CUSTOMER ENDPOINTS ==========

    /**
     * Customer xem tất cả warranty claims của mình
     * Endpoint này cho phép khách hàng xem danh sách tất cả các yêu cầu bảo hành của các xe họ sở hữu.
     */
    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getMyWarrantyClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Thiết kế bảo mật: Lấy username từ Security Context để xác thực quyền sở hữu.
        // Tầng Service sẽ sử dụng username này để tìm Customer ID và chỉ truy vấn các claim
        // thuộc về khách hàng đó, đảm bảo một khách hàng không thể xem claim của người khác.
        String username = SecurityUtil.getCurrentUsername().orElseThrow(() -> new AuthenticationRequiredException("Authentication is required"));
        logger.info("Customer get my warranty claims: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage =
            warrantyClaimService.getMyWarrantyClaims(username, PageRequest.of(page, size));
        logger.info("Customer get my warranty claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Customer xem chi tiết 1 warranty claim của mình
     * Endpoint này cho phép khách hàng xem chi tiết một yêu cầu bảo hành cụ thể.
     */
    @GetMapping("/my-claims/{claimId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WarrantyClaimResponseDTO> getMyWarrantyClaimById(@PathVariable Long claimId) {
        logger.info("Customer get warranty claim detail: claimId={}", claimId);
        // Thiết kế bảo mật: Tương tự như trên, lấy username từ Security Context.
        // Tầng Service sẽ thực hiện một câu lệnh query kết hợp cả `claimId` và `customerId` (lấy từ username)
        // để đảm bảo khách hàng chỉ có thể xem chi tiết claim của chính họ.
        String username = SecurityUtil.getCurrentUsername().orElseThrow(() -> new AuthenticationRequiredException("Authentication is required"));
        WarrantyClaimResponseDTO claim = warrantyClaimService.getMyWarrantyClaimById(claimId, username);
        logger.info("Customer get warranty claim detail success: claimId={}", claimId);
        return ResponseEntity.ok(claim);
    }
}
