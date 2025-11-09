package com.swp391.warrantymanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa thống kê số lượng claim mà technician đã xử lý trong ngày
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyClaimStatsResponseDTO {
    /**
     * Số lượng claim đã bắt đầu xử lý trong ngày hôm nay
     */
    private Long claimsStartedToday;

    /**
     * Giới hạn số claim tối đa có thể xử lý trong một ngày (từ service center config)
     */
    private Integer dailyLimit;

    /**
     * Số claim còn lại có thể nhận trong ngày
     */
    private Long remainingClaims;

    /**
     * Tỷ lệ phần trăm đã sử dụng (0-100)
     */
    private Double usagePercentage;

    /**
     * True nếu đã đạt giới hạn
     */
    private Boolean limitReached;
}
