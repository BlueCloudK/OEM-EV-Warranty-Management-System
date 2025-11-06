package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.util.SecurityUtil;
import com.swp391.warrantymanagement.service.RecallRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Yêu cầu Triệu hồi (RecallRequest).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: quản lý vòng đời trạng thái, xác thực quyền sở hữu)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link RecallRequestService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, chuyển trạng thái không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/recall-requests")
@RequiredArgsConstructor
public class RecallRequestController {
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
    private final RecallRequestService recallRequestService;

    /**
     * Cho phép nhân viên nhà sản xuất (EVM_STAFF) tạo một yêu cầu triệu hồi mới.
     * @param dto DTO chứa thông tin về yêu cầu (ID của linh kiện đã lắp đặt, lý do triệu hồi).
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được tạo.
     */
    @PostMapping
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> createRecall(@Valid @RequestBody RecallRequestRequestDTO dto) {
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context,
        // không bao giờ tin tưởng vào ID do client gửi lên. `SecurityUtil` là một lớp tiện ích
        // giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to create a recall request"));
        return ResponseEntity.ok(recallRequestService.createRecallRequest(dto, username));
    }

    /**
     * Cho phép Admin hoặc nhân viên (Staff) duyệt một yêu cầu triệu hồi.
     * @param id ID của yêu cầu cần duyệt.
     * @param note Ghi chú (tùy chọn) từ người duyệt.
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật trạng thái.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> approveRecall(@PathVariable Long id, @RequestParam(required = false) String note) {
        // Thiết kế: Lấy username của người duyệt từ Security Context để ghi lại vào lịch sử (audit trail),
        // giúp xác định ai đã thực hiện hành động duyệt.
        String approverUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to approve a recall request"));
        return ResponseEntity.ok(recallRequestService.approveRecallRequest(id, note, approverUsername));
    }

    /**
     * Cho phép Admin hoặc nhân viên (Staff) từ chối một yêu cầu triệu hồi.
     * @param id ID của yêu cầu cần từ chối.
     * @param note Lý do từ chối (tùy chọn).
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật trạng thái.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<RecallRequestResponseDTO> rejectRecall(@PathVariable Long id, @RequestParam(required = false) String note) {
        // Thiết kế: Tương tự như approve, lấy username của người từ chối để ghi lại vào lịch sử.
        String rejectorUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to reject a recall request"));
        return ResponseEntity.ok(recallRequestService.rejectRecallRequest(id, note, rejectorUsername));
    }

    /**
     * Cho phép khách hàng xác nhận hoặc từ chối tham gia một chương trình triệu hồi.
     * @param id ID của yêu cầu triệu hồi.
     * @param dto DTO chứa phản hồi của khách hàng (chấp nhận/từ chối và ghi chú).
     * @return {@link ResponseEntity} chứa thông tin yêu cầu đã được cập nhật.
     */
    @PatchMapping("/{id}/customer-confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RecallRequestResponseDTO> customerConfirm(@PathVariable Long id, @Valid @RequestBody RecallCustomerResponseDTO dto) {
        // Thiết kế bảo mật: Lấy username của khách hàng từ Security Context để xác thực quyền sở hữu.
        // Tầng Service sẽ sử dụng username này để đảm bảo khách hàng chỉ có thể xác nhận yêu cầu triệu hồi của chính họ.
        String customerUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to confirm a recall"));
        return ResponseEntity.ok(recallRequestService.customerConfirmRecall(id, dto, customerUsername));
    }

    /**
     * Lấy danh sách tất cả các yêu cầu triệu hồi trong hệ thống.
     * Endpoint này dành cho các vai trò quản trị để có cái nhìn tổng quan.
     * @return {@link ResponseEntity} chứa một danh sách các yêu cầu triệu hồi.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<List<RecallRequestResponseDTO>> getForAdmin() {
        return ResponseEntity.ok(recallRequestService.getRecallRequestsForAdmin());
    }

    /**
     * Lấy danh sách các yêu cầu triệu hồi của một khách hàng cụ thể.
     * @param customerId UUID của khách hàng.
     * @return {@link ResponseEntity} chứa một danh sách các yêu cầu triệu hồi.
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RecallRequestResponseDTO>> getForCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(recallRequestService.getRecallRequestsForCustomer(customerId));
    }

    /**
     * Cho phép khách hàng xem danh sách các yêu cầu triệu hồi của chính mình.
     * @return {@link ResponseEntity} chứa một danh sách các yêu cầu triệu hồi của người dùng đang đăng nhập.
     */
    @GetMapping("/my-recalls")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RecallRequestResponseDTO>> getMyRecalls() {
        // Thiết kế bảo mật: Lấy username từ Security Context để đảm bảo khách hàng chỉ xem được yêu cầu của chính mình.
        String customerUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view your recall requests"));
        return ResponseEntity.ok(recallRequestService.getMyRecallRequests(customerUsername));
    }

    /**
     * Cho phép nhân viên nhà sản xuất (EVM_STAFF) xóa một yêu cầu triệu hồi.
     * Logic nghiệp vụ ở tầng Service sẽ chỉ cho phép xóa khi yêu cầu đang ở trạng thái phù hợp (ví dụ: PENDING).
     * @param id ID của yêu cầu cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<Void> deleteRecall(@PathVariable Long id) {
        // Thiết kế bảo mật: Lấy username để xác thực quyền sở hữu trước khi xóa.
        // Tầng Service có thể kiểm tra xem người dùng này có phải là người đã tạo yêu cầu hay không.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to delete a recall request"));
        recallRequestService.deleteRecallRequest(id, username);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }
}
