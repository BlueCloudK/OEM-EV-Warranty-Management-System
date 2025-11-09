package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.DailyClaimStatsResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service xử lý business logic cho WorkLog
 * - Technician ghi nhật ký công việc khi sửa claim
 * - Tracking thời gian (start time, end time)
 * - Tính lương, đánh giá performance
 */
public interface WorkLogService {
    // Lấy work log theo ID
    WorkLogResponseDTO getWorkLogById(Long id);

    /**
     * Technician tạo work log (bắt đầu sửa chữa).
     * REFACTOR: Thay thế userId bằng username để tăng cường bảo mật và tách biệt Service khỏi tầng Web.
     * @param requestDTO Dữ liệu work log.
     * @param username Username của người dùng đang tạo (lấy từ Security Context).
     */
    WorkLogResponseDTO createWorkLog(WorkLogRequestDTO requestDTO, String username);

    /**
     * Cập nhật work log (kết thúc công việc, thêm mô tả).
     * REFACTOR: Thay thế userId bằng username để xác thực quyền sở hữu.
     * @param id ID của work log cần cập nhật.
     * @param requestDTO Dữ liệu cập nhật.
     * @param username Username của người dùng đang cập nhật.
     */
    WorkLogResponseDTO updateWorkLog(Long id, WorkLogRequestDTO requestDTO, String username);

    /**
     * Xóa một work log.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID.
     */
    void deleteWorkLog(Long id);

    // Lấy danh sách tất cả work logs
    PagedResponse<WorkLogResponseDTO> getAllWorkLogs(Pageable pageable);

    // Lấy work logs của claim cụ thể (tracking công việc)
    PagedResponse<WorkLogResponseDTO> getWorkLogsByWarrantyClaim(Long claimId, Pageable pageable);

    // Lấy work logs của technician cụ thể (tính lương)
    PagedResponse<WorkLogResponseDTO> getWorkLogsByUser(Long userId, Pageable pageable);

    /**
     * Lấy danh sách work logs của chính người dùng đang đăng nhập.
     * @param username Username của người dùng (lấy từ Security Context).
     * @param pageable Thông tin phân trang.
     */
    PagedResponse<WorkLogResponseDTO> getWorkLogsByUsername(String username, Pageable pageable);

    /**
     * Lấy thống kê số lượng claim đã xử lý trong ngày của technician hiện tại.
     * @param username Username của technician (lấy từ Security Context).
     * @return DailyClaimStatsResponseDTO chứa thông tin thống kê hôm nay.
     */
    DailyClaimStatsResponseDTO getMyDailyStats(String username);
}
