package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service xử lý business logic cho Vehicle
 * - CRUD: Tạo, đọc, cập nhật, xóa xe
 * - Search: Tìm theo VIN, model, brand
 * - Warranty: Tìm xe sắp hết bảo hành
 * - Customer: Lấy xe của customer cụ thể
 */
public interface VehicleService {
    // Lấy thông tin xe theo ID
    VehicleResponseDTO getVehicleById(Long id);

    // Tạo xe mới (EVM_STAFF đăng ký xe vào hệ thống)
    VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO);

    // Cập nhật thông tin xe (mileage, warranty dates...)
    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO);

    /**
     * Xóa một chiếc xe.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID,
     * hoặc ResourceInUseException nếu xe đang có claim/lịch sử bảo dưỡng.
     */
    void deleteVehicle(Long id);

    // Lấy danh sách tất cả xe với phân trang
    PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable, String search);

    // Tìm xe theo model và brand
    PagedResponse<VehicleResponseDTO> searchVehicles(String model, String brand, Pageable pageable);

    // Tìm xe sắp hết bảo hành (notification cho customer)
    PagedResponse<VehicleResponseDTO> getVehiclesWithExpiringWarranty(int daysFromNow, Pageable pageable);

    // Lấy tất cả xe của customer cụ thể
    PagedResponse<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId, Pageable pageable);

    /**
     * Customer lấy danh sách các xe của chính mình.
     * REFACTOR: Thay đổi signature để nhận username từ Security Context thay vì header.
     * @param username Username của người dùng đang đăng nhập.
     * @param pageable Thông tin phân trang.
     */
    PagedResponse<VehicleResponseDTO> getVehiclesByCurrentUser(String username, Pageable pageable);

    // Tìm xe theo VIN (unique identifier)
    VehicleResponseDTO getVehicleByVin(String vin);
}
