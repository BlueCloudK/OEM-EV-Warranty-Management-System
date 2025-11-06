package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho nhật ký công việc (audit trail) của technician khi xử lý warranty claim.
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *     <li><strong>Tại sao cho phép nhiều worklogs cho một claim:</strong> Công việc sửa chữa
 *     thường bị gián đoạn (chờ part, nghỉ giữa ca, nhiều technician cùng xử lý), nên cần
 *     nhiều entries để tracking chính xác thời gian làm việc thực tế.</li>
 *     <li><strong>Tại sao endTime nullable:</strong> Cho phép tạo "active worklog" khi technician
 *     bắt đầu làm việc (startTime = now, endTime = null), sau đó update endTime khi hoàn thành.
 *     Pattern này giúp tracking real-time và tính toán duration chính xác.</li>
 *     <li><strong>Tại sao description dài 1000 ký tự:</strong> Cần đủ không gian để ghi chi tiết
 *     (vd: "Kiểm tra 12 điểm kết nối battery, phát hiện cell 3 voltage thấp, tạo part request...").
 *     Chi tiết này quan trọng cho audit trail, dispute resolution, và knowledge base.</li>
 *     <li><strong>Vai trò trong tính lương:</strong> Service layer tính {@code SUM(endTime - startTime)}
 *     để xác định tổng giờ làm việc, nhân với hourly rate để tính payroll.</li>
 * </ul>
 */
@Entity
@Table(name = "work_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Chỉ include ID để tránh so sánh sâu các lazy relationships
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Exclude relationships để tránh vòng lặp đệ quy
@ToString(exclude = {"user", "warrantyClaim"})
public class WorkLog {

    /**
     * Primary key với {@code updatable = false}.
     * <p>
     * <strong>Tại sao updatable = false:</strong> WorkLog là audit trail (immutable record),
     * không cho phép thay đổi ID sau khi tạo để đảm bảo data integrity và compliance.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "work_log_id", updatable = false)
    @EqualsAndHashCode.Include
    private Long workLogId;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * Thời gian kết thúc công việc (nullable).
     * <p>
     * <strong>Tại sao nullable:</strong> Hỗ trợ pattern "clock in/clock out". Technician tạo
     * worklog với endTime = null khi bắt đầu, sau đó update endTime khi hoàn thành.
     * Điều này cho phép query "active worklogs" (WHERE endTime IS NULL) để biết ai
     * đang làm việc gì trong thời gian thực.
     * <p>
     * <strong>Lưu ý business logic:</strong> Service layer cần validate endTime >= startTime
     * và tính duration = endTime - startTime cho payroll và SLA tracking.
     */
    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "description", length = 1000, columnDefinition = "nvarchar(1000)")
    private String description;

    /**
     * Technician thực hiện công việc này (nullable = false).
     * <p>
     * <strong>Lưu ý validation:</strong> Service layer cần đảm bảo user có role = SC_TECHNICIAN.
     * Trường này quan trọng cho performance evaluation, payroll calculation, và workload balancing.
     * <p>
     * <strong>Use case:</strong> Query {@code GROUP BY user_id} để tính tổng giờ làm việc của
     * từng technician trong tháng, phục vụ tính lương và đánh giá hiệu suất.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Warranty claim mà worklog này thuộc về (nullable = false).
     * <p>
     * <strong>Tại sao một claim có nhiều worklogs:</strong> Công việc phức tạp hoặc bị gián đoạn
     * (chờ part, multiple technicians) cần nhiều entries để tracking chính xác. Điều này cũng
     * giúp phát hiện vấn đề (vd: claim có quá nhiều worklogs → part quality issue hoặc technician
     * thiếu kỹ năng).
     * <p>
     * <strong>Use case SLA:</strong> Tính {@code SUM(endTime - startTime) GROUP BY claim_id}
     * để xác định claim nào vượt quá SLA threshold (vd: >24h).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warranty_claim_id", nullable = false)
    private WarrantyClaim warrantyClaim;
}
