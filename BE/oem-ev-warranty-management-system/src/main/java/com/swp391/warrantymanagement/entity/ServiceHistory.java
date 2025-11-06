package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho lịch sử bảo dưỡng/sửa chữa của một xe.
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *   <li><strong>Sử dụng LocalDate thay vì LocalDateTime:</strong> Business domain chỉ quan tâm đến ngày
 *   (không cần giờ phút), LocalDate tránh được vấn đề timezone và đơn giản hóa logic.</li>
 *   <li><strong>Cascade ALL + orphanRemoval cho ServiceHistoryDetail:</strong> Detail là dữ liệu phụ thuộc
 *   không có ý nghĩa độc lập, vòng đời được quản lý bởi ServiceHistory (aggregate root pattern).</li>
 *   <li><strong>Khởi tạo collection trước:</strong> Tránh NullPointerException khi thêm detail, thuận tiện
 *   cho unit testing mà không cần mock.</li>
 * </ul>
 */
@Entity
@Table(name = "service_history")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Chỉ include ID trong equals/hashCode để tránh so sánh sâu các lazy relationships,
// phòng tránh trigger load từ database và vấn đề với JPA proxy
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Exclude collections/relationships để tránh vòng lặp đệ quy và lazy loading exception
@ToString(exclude = {"serviceHistoryDetails", "vehicle"})
public class ServiceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_history_id")
    @EqualsAndHashCode.Include
    private Long serviceHistoryId;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "service_type", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String serviceType;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    private String description;

    /**
     * Chi tiết các part đã thay trong lần service này.
     * <p>
     * <strong>Tại sao dùng cascade ALL + orphanRemoval:</strong> ServiceHistoryDetail là junction
     * entity trong quan hệ many-to-many với Part, nhưng không có ý nghĩa độc lập. Vòng đời được
     * quản lý bởi ServiceHistory (aggregate root pattern) để đảm bảo data consistency.
     */
    @OneToMany(mappedBy = "serviceHistory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistoryDetail> serviceHistoryDetails = new ArrayList<>();

    /**
     * Xe được service trong lần này (nullable = false).
     * <p>
     * <strong>Tại sao dùng FetchType.LAZY:</strong> Trong nhiều trường hợp chỉ cần thông tin
     * lịch sử (ngày, loại service) mà không cần load toàn bộ vehicle entity. Lazy loading
     * giảm chi phí query và cải thiện performance.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}
