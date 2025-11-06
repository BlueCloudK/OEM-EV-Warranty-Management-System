package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerProfileResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

/**
 * Service xử lý business logic cho Customer
 * - CRUD operations: Tạo, đọc, cập nhật, xóa customer
 * - Search: Tìm theo tên, email, phone, userId
 * - Profile: Lấy thông tin đầy đủ (vehicles, claims, feedbacks)
 */
public interface CustomerService {
    // Lấy danh sách customer với phân trang và tìm kiếm
    PagedResponse<CustomerResponseDTO> getAllCustomersPage(Pageable pageable, String search);

    // Lấy customer theo ID (UUID)
    CustomerResponseDTO getCustomerById(UUID id);

    // Tạo customer mới
    CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO);

    // Cập nhật thông tin customer
    CustomerResponseDTO updateCustomer(UUID id, CustomerRequestDTO requestDTO);

    /**
     * Xóa một khách hàng.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID.
     */
    void deleteCustomer(UUID id);

    // Tìm customer theo tên (hỗ trợ tìm kiếm không phân biệt hoa thường)
    PagedResponse<CustomerResponseDTO> searchCustomersByName(String name, Pageable pageable);

    // Lấy customer theo email (unique)
    CustomerResponseDTO getCustomerByEmail(String email);

    // Lấy customer theo số điện thoại (unique)
    CustomerResponseDTO getCustomerByPhone(String phone);

    // Lấy customer theo userId (1-1 relationship)
    PagedResponse<CustomerResponseDTO> getCustomersByUserId(Long userId, Pageable pageable);

    /**
     * Customer tự cập nhật profile của mình.
     * REFACTOR: Thay đổi signature để nhận username từ Security Context thay vì header.
     * @param username Username của người dùng đang đăng nhập.
     * @param requestDTO Dữ liệu cập nhật.
     */
    CustomerResponseDTO updateCustomerProfile(String username, CustomerRequestDTO requestDTO);

    // Lấy profile đầy đủ: thông tin customer + vehicles + claims + feedbacks
    CustomerProfileResponseDTO getCustomerFullProfile(UUID customerId);

    /**
     * Lấy thông tin profile đầy đủ của khách hàng dựa trên username.
     * Sẽ ném ra ResourceNotFoundException nếu không tìm thấy User hoặc Customer profile.
     * @param username Username của người dùng.
     * @return DTO chứa thông tin profile đầy đủ.
     */
    CustomerProfileResponseDTO getCustomerProfileByUsername(String username);

    /**
     * Tìm thông tin profile của khách hàng dựa trên username.
     * @param username Username của người dùng.
     * @return Optional chứa DTO profile nếu tìm thấy, ngược lại trả về Optional.empty().
     */
    Optional<CustomerProfileResponseDTO> findCustomerProfileByUsername(String username);
}
