package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service xử lý business logic cho ServiceCenter
 * - CRUD: Tạo, đọc, cập nhật, xóa center (chỉ ADMIN)
 * - Search: Tìm theo tên, địa chỉ
 * - GPS: Tìm center gần nhất với customer
 */
public interface ServiceCenterService {
    // Tạo service center mới (chỉ ADMIN)
    ServiceCenterResponseDTO createServiceCenter(ServiceCenterRequestDTO requestDTO);

    // Lấy thông tin center theo ID (kèm statistics)
    ServiceCenterResponseDTO getServiceCenterById(Long serviceCenterId);

    /**
     * Lấy danh sách tất cả service centers với phân trang.
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa danh sách service centers
     */
    PagedResponse<ServiceCenterResponseDTO> getAllServiceCenters(Pageable pageable);

    /**
     * Cập nhật thông tin service center (chỉ ADMIN).
     * @param serviceCenterId ID của service center
     * @param requestDTO DTO chứa thông tin cập nhật
     * @return ServiceCenterResponseDTO đã cập nhật
     */
    ServiceCenterResponseDTO updateServiceCenter(Long serviceCenterId, ServiceCenterRequestDTO requestDTO);

    /**
     * Xóa service center (chỉ ADMIN).
     * @param serviceCenterId ID của service center cần xóa
     */
    void deleteServiceCenter(Long serviceCenterId);

    /**
     * Tìm kiếm service centers theo tên hoặc địa chỉ.
     * @param search Từ khóa tìm kiếm
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa danh sách centers phù hợp
     */
    PagedResponse<ServiceCenterResponseDTO> searchServiceCenters(String search, Pageable pageable);

    /**
     * Tìm service centers trong bán kính từ vị trí.
     * @param latitude Vĩ độ của vị trí
     * @param longitude Kinh độ của vị trí
     * @param radiusKm Bán kính tìm kiếm (km)
     * @return Danh sách centers trong bán kính, sắp xếp theo khoảng cách
     */
    List<ServiceCenterResponseDTO> findServiceCentersNearLocation(
            BigDecimal latitude, BigDecimal longitude, double radiusKm);

    /**
     * Lấy tất cả service centers sắp xếp theo khoảng cách từ vị trí.
     * @param latitude Vĩ độ của vị trí
     * @param longitude Kinh độ của vị trí
     * @return Danh sách tất cả centers sắp xếp theo khoảng cách tăng dần
     */
    List<ServiceCenterResponseDTO> findAllOrderedByDistanceFrom(
            BigDecimal latitude, BigDecimal longitude);

    /**
     * Cập nhật vị trí GPS của service center.
     * @param serviceCenterId ID của service center
     * @param latitude Vĩ độ mới
     * @param longitude Kinh độ mới
     * @return ServiceCenterResponseDTO đã cập nhật
     */
    ServiceCenterResponseDTO updateServiceCenterLocation(
            Long serviceCenterId, BigDecimal latitude, BigDecimal longitude);
}
