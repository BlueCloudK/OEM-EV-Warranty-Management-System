package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.service.CustomerService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.UUID;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Khách hàng (Customer).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc:
 *         <ol>
 *             <li>Nhận và xác thực (validate) request.</li>
 *             <li>Điều hướng request đến tầng Service thích hợp để xử lý logic nghiệp vụ.</li>
 *             <li>Đóng gói kết quả từ Service vào {@link ResponseEntity} và trả về cho client.</li>
 *         </ol>
 *     </li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp và việc truy cập dữ liệu đều được ủy thác cho tầng Service.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler} thông qua các exception được ném ra từ tầng Service.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/customers")
@CrossOrigin
@RequiredArgsConstructor
public class CustomerController {
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với các trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final CustomerService customerService;

    /**
     * Lấy danh sách tất cả khách hàng, hỗ trợ phân trang, tìm kiếm và sắp xếp.
     * Endpoint này dành cho các vai trò quản trị và nhân viên.
     *
     * @param page    Số trang (mặc định là 0).
     * @param size    Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param search  Từ khóa tìm kiếm (tên hoặc email của khách hàng).
     * @param sortBy  Trường để sắp xếp (mặc định: name).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: ASC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các khách hàng.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        logger.info("Get all customers request: page={}, size={}, search={}, sortBy={}, sortDir={}", page, size, search, sortBy, sortDir);

        // Map email sort field to nested user.email path
        String actualSortField = sortBy;
        if ("email".equalsIgnoreCase(sortBy)) {
            actualSortField = "user.email";
        }

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(actualSortField).ascending() : Sort.by(actualSortField).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<CustomerResponseDTO> customersPage = customerService.getAllCustomersPage(pageable, search);
        logger.info("Get all customers success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    /**
     * Lấy thông tin chi tiết của một khách hàng dựa trên ID.
     *
     * @param id UUID của khách hàng cần lấy thông tin.
     * @return {@link ResponseEntity} chứa {@link CustomerResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable UUID id) {
        logger.info("Get customer by id: {}", id);
        // Thiết kế: Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy khách hàng.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        // Điều này giúp code ở Controller luôn gọn gàng và chỉ tập trung vào "happy path".
        CustomerResponseDTO customer = customerService.getCustomerById(id);
        logger.info("Customer found: {}", id);
        return ResponseEntity.ok(customer);
    }

    /**
     * Tạo một khách hàng mới. Endpoint này dành cho nhân viên/quản trị viên.
     * @param requestDTO DTO chứa thông tin của khách hàng mới.
     * @return {@link ResponseEntity} chứa thông tin khách hàng đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO requestDTO) {
        logger.info("Create customer request: {}", requestDTO);
        // Thiết kế: Controller không cần khối try-catch.
        // Nếu có lỗi nghiệp vụ (ví dụ: userId không tồn tại, số điện thoại đã được sử dụng),
        // tầng Service sẽ ném ra một exception cụ thể (ví dụ: ResourceNotFoundException, DuplicateResourceException).
        // GlobalExceptionHandler sẽ bắt các exception này và trả về response lỗi HTTP tương ứng (404, 409,...).
        CustomerResponseDTO responseDTO = customerService.createCustomer(requestDTO);
        logger.info("Customer created: {}", responseDTO.getCustomerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật thông tin của một khách hàng. Endpoint này dành cho nhân viên/quản trị viên.
     * @param id UUID của khách hàng cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin khách hàng đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable UUID id,
                                                              @Valid @RequestBody CustomerRequestDTO requestDTO) {
        logger.info("Update customer request: id={}, data={}", id, requestDTO);
        // Thiết kế: Tương tự như các endpoint khác, Controller không xử lý logic lỗi.
        // Nếu ID khách hàng không tồn tại, service sẽ ném ResourceNotFoundException -> 404 Not Found.
        // Nếu dữ liệu không hợp lệ (ví dụ: số điện thoại mới bị trùng), service sẽ ném exception -> 400/409.
        CustomerResponseDTO updatedCustomer = customerService.updateCustomer(id, requestDTO);
        logger.info("Customer updated: {}", id);
        return ResponseEntity.ok(updatedCustomer);
    }

    /**
     * Xóa một khách hàng. Endpoint này chỉ dành cho ADMIN.
     * @param id UUID của khách hàng cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        logger.info("Delete customer request: {}", id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy khách hàng, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Nếu khách hàng đang có các tài nguyên liên quan (ví dụ: xe, yêu cầu bảo hành),
        //    ném `ResourceInUseException` -> 409 Conflict.
        // Controller không cần biết về các logic này, chỉ cần gọi và xử lý trường hợp thành công.
        customerService.deleteCustomer(id);
        logger.info("Customer deleted: {}", id);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Tìm kiếm khách hàng theo tên.
     *
     * @param name    Tên khách hàng cần tìm.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp (mặc định: name).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: ASC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các khách hàng phù hợp.
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> searchCustomers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        logger.info("Search customers by name: {}, page={}, size={}, sortBy={}, sortDir={}", name, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<CustomerResponseDTO> customersPage = customerService.searchCustomersByName(name, pageable);
        logger.info("Search customers by name success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    /**
     * Tìm một khách hàng duy nhất bằng địa chỉ email.
     *
     * @param email Email của khách hàng cần tìm.
     * @return {@link ResponseEntity} chứa thông tin khách hàng nếu tìm thấy.
     */
    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> getCustomerByEmail(@RequestParam String email) {
        logger.info("Get customer by email: {}", email);
        // Thiết kế "Happy Path": Controller giả định rằng service sẽ trả về dữ liệu hợp lệ.
        // Nếu không tìm thấy khách hàng với email này, service sẽ ném ResourceNotFoundException,
        // và GlobalExceptionHandler sẽ xử lý để trả về lỗi 404 Not Found.
        CustomerResponseDTO customer = customerService.getCustomerByEmail(email);
        logger.info("Customer found by email: {}", email);
        return ResponseEntity.ok(customer);
    }

    /**
     * Tìm một khách hàng duy nhất bằng số điện thoại.
     *
     * @param phone Số điện thoại của khách hàng cần tìm.
     * @return {@link ResponseEntity} chứa thông tin khách hàng nếu tìm thấy.
     */
    @GetMapping("/by-phone")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> getCustomerByPhone(@RequestParam String phone) {
        logger.info("Get customer by phone: {}", phone);
        // Tương tự như getCustomerByEmail, việc xử lý trường hợp "không tìm thấy"
        // được ủy thác hoàn toàn cho tầng Service và GlobalExceptionHandler.
        CustomerResponseDTO customer = customerService.getCustomerByPhone(phone);
        logger.info("Customer found by phone: {}", phone);
        return ResponseEntity.ok(customer);
    }

    /**
     * Lấy danh sách khách hàng được liên kết với một ID người dùng (User ID).
     *
     * @param userId  ID của người dùng.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp (mặc định: name).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: ASC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các khách hàng.
     */
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getCustomersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        logger.info("Get customers by userId: {}, page={}, size={}, sortBy={}, sortDir={}", userId, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<CustomerResponseDTO> customersPage = customerService.getCustomersByUserId(userId, pageable);
        logger.info("Get customers by userId success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    /**
     * Endpoint cho phép khách hàng tự cập nhật thông tin cá nhân của mình.
     *
     * @param requestDTO DTO chứa các thông tin mà khách hàng được phép thay đổi.
     * @return {@link ResponseEntity} chứa thông tin profile đã được cập nhật.
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerResponseDTO> updateCustomerProfile(
            @Valid @RequestBody CustomerRequestDTO requestDTO) {
        logger.info("Update customer profile request");
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context,
        // không bao giờ tin tưởng vào ID do client gửi lên trong request body.
        // `SecurityUtil` là một lớp tiện ích giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to update profile"));

        // Thiết kế: Tầng Service sẽ nhận `username` và thực hiện các bước xác thực quyền sở hữu
        // trước khi thực hiện cập nhật, đảm bảo một khách hàng không thể cập nhật thông tin của người khác.
        CustomerResponseDTO updatedCustomer = customerService.updateCustomerProfile(username, requestDTO);
        logger.info("Customer profile updated for user {}: {}", username, updatedCustomer.getCustomerId());
        return ResponseEntity.ok(updatedCustomer);
    }
}
