package com.swp391.warrantymanagement.enums;

/**
 * Enum đại diện cho trạng thái bảo hành của xe/linh kiện.
 * <p>
 * <strong>Mục đích:</strong> Xác định tính hợp lệ của yêu cầu bảo hành dựa trên
 * thời gian và số km đã đi, hỗ trợ quyết định có chấp nhận claim miễn phí hay
 * yêu cầu customer trả phí.
 * <p>
 * <strong>Business rules:</strong>
 * <ul>
 *     <li><strong>VALID:</strong> Còn trong thời hạn bảo hành (cả ngày và km) → Miễn phí</li>
 *     <li><strong>EXPIRED_DATE:</strong> Quá ngày hết hạn bảo hành → Có thể bảo hành tính phí</li>
 *     <li><strong>EXPIRED_MILEAGE:</strong> Vượt quá số km cho phép → Có thể bảo hành tính phí</li>
 *     <li><strong>EXPIRED_BOTH:</strong> Quá cả ngày và km → Có thể bảo hành tính phí (phí cao hơn)</li>
 *     <li><strong>PART_WARRANTY_EXPIRED:</strong> Linh kiện hết hạn bảo hành → Có thể bảo hành tính phí</li>
 * </ul>
 */
public enum WarrantyStatus {
    /**
     * Bảo hành hợp lệ - Còn trong thời hạn bảo hành
     */
    VALID("Còn trong thời hạn bảo hành"),

    /**
     * Hết hạn bảo hành theo ngày tháng
     */
    EXPIRED_DATE("Hết hạn bảo hành theo thời gian"),

    /**
     * Hết hạn bảo hành theo số km
     */
    EXPIRED_MILEAGE("Hết hạn bảo hành theo số km đã đi"),

    /**
     * Hết hạn cả ngày và km
     */
    EXPIRED_BOTH("Hết hạn bảo hành cả theo thời gian và số km"),

    /**
     * Linh kiện cụ thể hết hạn bảo hành
     */
    PART_WARRANTY_EXPIRED("Linh kiện đã hết hạn bảo hành");

    private final String description;

    WarrantyStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Kiểm tra xem bảo hành có hợp lệ không
     * @return true nếu còn bảo hành, false nếu đã hết hạn
     */
    public boolean isValid() {
        return this == VALID;
    }

    /**
     * Kiểm tra xem có thể bảo hành tính phí không
     * @return true nếu hết hạn nhưng có thể bảo hành tính phí
     */
    public boolean canProvidePaidWarranty() {
        return this != VALID;
    }
}
