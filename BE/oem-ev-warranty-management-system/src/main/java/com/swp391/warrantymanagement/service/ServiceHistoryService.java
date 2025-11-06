package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service xử lý business logic cho ServiceHistory
 * - Ghi lại lịch sử bảo dưỡng/sửa chữa xe
 * - Tracking part đã thay, ngày service
 * - Customer xem lịch sử xe của mình
 */
public interface ServiceHistoryService {
    // Lấy service history theo ID
    ServiceHistoryResponseDTO getServiceHistoryById(Long id);

    // Tạo service history mới (ghi lại lần bảo dưỡng)
    ServiceHistoryResponseDTO createServiceHistory(ServiceHistoryRequestDTO requestDTO);

    // Cập nhật service history
    ServiceHistoryResponseDTO updateServiceHistory(Long id, ServiceHistoryRequestDTO requestDTO);

    /**
     * Xóa một bản ghi lịch sử dịch vụ.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID.
     */
    void deleteServiceHistory(Long id);

    // Lấy tất cả service histories với tìm kiếm
    PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable, String search);

    // Lấy lịch sử của xe cụ thể
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId, Pageable pageable);

    // Lấy service history có sử dụng part cụ thể
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId, Pageable pageable);

    /**
     * Customer lấy lịch sử các xe của mình.
     * REFACTOR: Thay đổi signature để nhận username từ Security Context thay vì header.
     * @param username Username của người dùng đang đăng nhập.
     * @param pageable Thông tin phân trang.
     */
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByCurrentUser(String username, Pageable pageable);

    // Lấy service history trong khoảng thời gian
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByDateRange(String startDate, String endDate, Pageable pageable);
}
