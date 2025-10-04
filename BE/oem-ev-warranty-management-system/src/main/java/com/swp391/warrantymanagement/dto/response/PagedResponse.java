package com.swp391.warrantymanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO phân trang chuẩn cho REST API
 * Wrap (Bao bọc) kết quả từ database với thông tin pagination
 */
@Data @AllArgsConstructor @NoArgsConstructor
public class PagedResponse<T> {

    private List<T> content;        // Dữ liệu trang hiện tại -> Hiển thị trên UI
    private int page;               // Số trang (0-based) -> Biết đang ở trang nào
    private int size;               // Items per page -> Biết mỗi trang có bao nhiêu items
    private long totalElements;     // Tổng số records -> Hiển thị "Showing X of Y results"
    private int totalPages;         // Tổng số trang -> Tạo pagination buttons (1,2,3...10)
    private boolean first;          // Trang đầu? -> Disable "Previous" button
    private boolean last;           // Trang cuối? -> Disable "Next" button
}
