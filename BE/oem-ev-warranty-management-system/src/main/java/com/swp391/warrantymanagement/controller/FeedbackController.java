package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import java.util.UUID;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Đánh giá (Feedback) của khách hàng.
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp và việc truy cập dữ liệu đều được ủy thác cho {@link FeedbackService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc, giúp đảm bảo các dependency là bất biến (final) và an toàn (null-safe),
     * đồng thời giúp việc viết Unit Test trở nên dễ dàng hơn.
     */
    private final FeedbackService feedbackService;

    /**
     * Cho phép khách hàng tạo một đánh giá mới cho một yêu cầu bảo hành đã hoàn thành.
     *
     * @param requestDTO DTO chứa nội dung đánh giá (rating, comment) và ID của yêu cầu bảo hành.
     * @return {@link ResponseEntity} chứa thông tin đánh giá đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> createFeedback(
            @Valid @RequestBody FeedbackRequestDTO requestDTO,
            @RequestParam(required = false) UUID customerId) { // Giữ lại để tương thích, nhưng không sử dụng
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context,
        // không bao giờ tin tưởng vào ID do client gửi lên. `SecurityUtil` là một lớp tiện ích
        // giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to create feedback"));

        FeedbackResponseDTO response = feedbackService.createFeedback(requestDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy thông tin chi tiết của một đánh giá dựa trên ID.
     *
     * @param id ID của đánh giá cần lấy thông tin.
     * @return {@link ResponseEntity} chứa {@link FeedbackResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        // Thiết kế: Controller không cần kiểm tra null. Tầng Service được thiết kế để ném ra
        // `ResourceNotFoundException` nếu không tìm thấy, và `GlobalExceptionHandler` sẽ tự động
        // xử lý để trả về HTTP status 404 Not Found.
        FeedbackResponseDTO response = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin đánh giá được liên kết với một yêu cầu bảo hành cụ thể.
     *
     * @param claimId ID của yêu cầu bảo hành.
     * @return {@link ResponseEntity} chứa thông tin đánh giá nếu có.
     */
    @GetMapping("/by-claim/{claimId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackByClaimId(@PathVariable Long claimId) {
        FeedbackResponseDTO response = feedbackService.getFeedbackByClaimId(claimId);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách tất cả các đánh giá của một khách hàng cụ thể, hỗ trợ phân trang và sắp xếp.
     *
     * @param customerId UUID của khách hàng.
     * @param page       Số trang.
     * @param size       Số lượng phần tử trên mỗi trang.
     * @param sortBy     Trường để sắp xếp.
     * @param sortDir    Hướng sắp xếp (ASC hoặc DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các đánh giá.
     */
    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByCustomer(customerId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách tất cả các đánh giá trong hệ thống, hỗ trợ phân trang và sắp xếp.
     * Endpoint này dành cho các vai trò quản trị và nhân viên để xem xét.
     *
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên mỗi trang.
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các đánh giá.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getAllFeedbacks(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách các đánh giá có một mức xếp hạng (rating) cụ thể.
     *
     * @param rating  Mức xếp hạng cần lọc (ví dụ: 5 sao).
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên mỗi trang.
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các đánh giá.
     */
    @GetMapping("/by-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByRating(
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByRating(rating, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách các đánh giá có mức xếp hạng từ một giá trị tối thiểu trở lên.
     *
     * @param rating  Mức xếp hạng tối thiểu.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên mỗi trang.
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các đánh giá.
     */
    @GetMapping("/min-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<FeedbackResponseDTO>> getFeedbacksByMinRating(
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<FeedbackResponseDTO> response = feedbackService.getFeedbacksByMinRating(rating, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Cho phép khách hàng cập nhật một đánh giá đã có của chính họ.
     *
     * @param id         ID của đánh giá cần cập nhật.
     * @param requestDTO DTO chứa nội dung cập nhật.
     * @return {@link ResponseEntity} chứa thông tin đánh giá đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequestDTO requestDTO,
            @RequestParam(required = false) UUID customerId) { // Giữ lại để tương thích, nhưng không sử dụng
        // Thiết kế bảo mật: Lấy username từ Security Context để xác thực quyền sở hữu.
        // Tầng Service sẽ sử dụng username này để đảm bảo người dùng chỉ có thể sửa đánh giá của chính họ.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to update feedback"));

        FeedbackResponseDTO response = feedbackService.updateFeedback(id, requestDTO, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa một đánh giá.
     * Endpoint này cho phép cả khách hàng (xóa đánh giá của mình) và ADMIN (xóa bất kỳ đánh giá nào).
     *
     * @param id ID của đánh giá cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable Long id,
            @RequestParam(required = false) UUID customerId) { // Giữ lại để tương thích, nhưng không sử dụng
        // Thiết kế bảo mật: Lấy username từ Security Context để xác thực quyền sở hữu.
        // Tầng Service sẽ kiểm tra xem người dùng có phải là chủ sở hữu của đánh giá hoặc có phải là ADMIN không.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to delete feedback"));

        feedbackService.deleteFeedback(id, username);

        // REFACTOR: Thay đổi response để tuân thủ chuẩn RESTful.
        // Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy mức xếp hạng trung bình của tất cả các đánh giá trong hệ thống.
     * @return {@link ResponseEntity} chứa mức xếp hạng trung bình.
     */
    @GetMapping("/statistics/average-rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> getAverageRating() {
        Double averageRating = feedbackService.getAverageRating();
        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy mức xếp hạng trung bình cho một trung tâm bảo hành cụ thể.
     * @param serviceCenterId ID của trung tâm bảo hành.
     * @return {@link ResponseEntity} chứa mức xếp hạng trung bình của trung tâm đó.
     */
    @GetMapping("/statistics/service-center/{serviceCenterId}/average-rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> getAverageRatingByServiceCenter(@PathVariable Long serviceCenterId) {
        Double averageRating = feedbackService.getAverageRatingByServiceCenter(serviceCenterId);
        Map<String, Object> response = new HashMap<>();
        response.put("serviceCenterId", serviceCenterId);
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        return ResponseEntity.ok(response);
    }

    /**
     * Đếm số lượng đánh giá theo một mức xếp hạng cụ thể.
     * @param rating Mức xếp hạng cần đếm.
     * @return {@link ResponseEntity} chứa số lượng đánh giá.
     */
    @GetMapping("/statistics/count-by-rating/{rating}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> countByRating(@PathVariable Integer rating) {
        Long count = feedbackService.countByRating(rating);
        Map<String, Object> response = new HashMap<>();
        response.put("rating", rating);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy một bản tóm tắt thống kê về các đánh giá, bao gồm xếp hạng trung bình và số lượng cho từng mức xếp hạng.
     * @return {@link ResponseEntity} chứa các thông tin thống kê.
     */
    @GetMapping("/statistics/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> getFeedbackStatistics() {
        Map<String, Object> response = new HashMap<>();

        Double averageRating = feedbackService.getAverageRating();
        response.put("averageRating", averageRating != null ? averageRating : 0.0);

        // Vòng lặp để lấy số lượng đánh giá cho từng mức xếp hạng (từ 1 đến 5 sao).
        Map<Integer, Long> ratingCounts = new HashMap<>();
        // Thiết kế: Mặc dù việc gọi service trong vòng lặp có thể gây ra vấn đề "N+1 Query",
        // nhưng trong trường hợp này, số lần lặp là cố định và rất nhỏ (5 lần),
        // nên cách tiếp cận này được ưu tiên vì sự đơn giản, dễ hiểu và hiệu năng hoàn toàn chấp nhận được.
        // Một giải pháp tối ưu hơn có thể là tạo một phương thức trong service để lấy tất cả các count
        // chỉ bằng một câu lệnh query duy nhất (sử dụng GROUP BY).
        for (int i = 1; i <= 5; i++) {
            // Với mỗi mức xếp hạng, gọi service để thực hiện một câu lệnh COUNT trong database.
            ratingCounts.put(i, feedbackService.countByRating(i));
        }
        response.put("ratingCounts", ratingCounts);

        return ResponseEntity.ok(response);
    }
}
