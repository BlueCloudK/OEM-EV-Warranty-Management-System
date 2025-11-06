package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho yêu cầu bảo hành của khách hàng, quản lý toàn bộ vòng đời
 * từ lúc submit đến khi hoàn thành (SUBMITTED → APPROVED → IN_PROGRESS → RESOLVED).
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *     <li><strong>Sử dụng enum WarrantyClaimStatus:</strong> Đảm bảo type-safety và ngăn chặn
 *     các giá trị status không hợp lệ. Service layer cần validate status transition
 *     (vd: không cho phép từ SUBMITTED nhảy thẳng IN_PROGRESS).</li>
 *     <li><strong>Cascade ALL cho WorkLog:</strong> WorkLog là audit trail gắn chặt với claim,
 *     không có ý nghĩa độc lập. Khi claim bị xóa, worklog liên quan cũng cần xóa.</li>
 *     <li><strong>resolutionDate nullable:</strong> Chỉ được set khi claim chuyển sang RESOLVED,
 *     dùng để tính SLA (Service Level Agreement) và đánh giá hiệu suất xử lý.</li>
 *     <li><strong>Quan hệ 1-1 optional với RecallRequest:</strong> Phân biệt 2 loại claim:
 *     customer-initiated (tự phát hiện lỗi) vs recall-initiated (nhà sản xuất phát hiện lỗi hàng loạt).</li>
 *     <li><strong>assignedTo nullable:</strong> Cho phép SC_STAFF tạo claim trước, assign technician sau
 *     (flexible workflow, tránh blocking khi chưa có technician available).</li>
 * </ul>
 */
@Entity
@Table(name = "warranty_claims")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Chỉ include ID để tránh so sánh sâu các lazy relationships
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Exclude relationships để tránh vòng lặp đệ quy và lazy loading exception
@ToString(exclude = {"installedPart", "vehicle", "workLogs", "serviceCenter", "assignedTo", "recallRequest"})
public class WarrantyClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warranty_claim_id")
    @EqualsAndHashCode.Include
    private Long warrantyClaimId;

    @Column(name = "claim_date", nullable = false)
    private LocalDateTime claimDate;

    /**
     * Trạng thái claim được lưu dưới dạng {@code EnumType.STRING}.
     * <p>
     * <strong>Tại sao dùng STRING thay vì ORDINAL:</strong> ORDINAL lưu index (0,1,2...)
     * dễ bị lỗi khi thêm/xóa/sắp xếp lại enum values. STRING lưu tên enum ("SUBMITTED", "APPROVED"...)
     * dễ debug và tránh lỗi khi refactor enum.
     * <p>
     * <strong>Lưu ý business logic:</strong> Service layer cần validate status transition để
     * tránh các chuyển đổi không hợp lệ (vd: từ SUBMITTED nhảy thẳng RESOLVED mà bỏ qua APPROVED).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WarrantyClaimStatus status = WarrantyClaimStatus.SUBMITTED;

    /**
     * Ngày hoàn thành claim, chỉ được set khi status = RESOLVED.
     * <p>
     * <strong>Tại sao nullable:</strong> Cho phép lưu claim với status chưa RESOLVED.
     * Khi set giá trị này, service layer có thể tính SLA: {@code resolutionDate - claimDate}.
     */
    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;

    @Column(name = "description", length = 255, columnDefinition = "nvarchar(255)")
    private String description;

    /**
     * Part cụ thể bị lỗi mà claim này xử lý (nullable = false).
     * <p>
     * <strong>Lưu ý business logic:</strong> Service layer phải kiểm tra
     * {@code installedPart.warrantyExpirationDate} trước khi approve claim.
     * Nếu part hết hạn bảo hành, claim có thể bị reject hoặc yêu cầu customer trả phí.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installed_part_id", nullable = false)
    private InstalledPart installedPart;

    /**
     * Xe đang có vấn đề (nullable = false).
     * <p>
     * <strong>Lưu ý business logic:</strong> Cần kiểm tra cả {@code vehicle.warrantyEndDate}
     * và {@code vehicle.mileage} để xác định tính hợp lệ của claim (điều kiện kép).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Danh sách work logs ghi lại quá trình sửa chữa.
     * <p>
     * <strong>Tại sao dùng cascade ALL:</strong> WorkLog là audit trail gắn chặt với claim,
     * không có ý nghĩa độc lập. Dùng để tính lương technician, tracking thời gian, và compliance audit.
     * <p>
     * <strong>Tại sao có thể nhiều worklogs:</strong> Một claim phức tạp có thể cần nhiều lần
     * thao tác hoặc nhiều technician cùng xử lý (vd: chẩn đoán ban đầu, đợi part, lắp part mới).
     */
    @OneToMany(mappedBy = "warrantyClaim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkLog> workLogs = new ArrayList<>();

    /**
     * Service center xử lý claim này (nullable = true).
     * <p>
     * <strong>Tại sao nullable:</strong> Cho phép customer tạo claim trước, chọn center sau
     * (hoặc SC_STAFF assign dựa trên workload/location). Flexible workflow tránh blocking.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id")
    private ServiceCenter serviceCenter;

    /**
     * Technician được assign để xử lý claim (nullable = true).
     * <p>
     * <strong>Tại sao nullable:</strong> SC_STAFF có thể tạo/approve claim trước,
     * assign technician sau khi có người available. Điều này cải thiện throughput
     * (không phải chờ có technician mới tiếp nhận claim).
     * <p>
     * <strong>Lưu ý validation:</strong> Khi assign, cần đảm bảo assignedTo có role
     * SC_TECHNICIAN và thuộc về {@code serviceCenter} đã chọn.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    /**
     * Recall request tạo ra claim này (quan hệ 1-1 optional).
     * <p>
     * <strong>Tại sao cần trường này:</strong> Phân biệt 2 loại claim:
     * <ul>
     *     <li><strong>Customer-initiated:</strong> Customer tự phát hiện và tạo claim
     *     ({@code recallRequest = null})</li>
     *     <li><strong>Recall-initiated:</strong> Nhà sản xuất phát hiện lỗi hàng loạt,
     *     tạo recall request, hệ thống tự động tạo claim cho các xe bị ảnh hưởng
     *     (có {@code recallRequest != null})</li>
     * </ul>
     * <p>
     * <strong>Tại sao unique = true:</strong> Mỗi recall request chỉ tạo tối đa 1 claim
     * cho mỗi xe/part cụ thể (tránh duplicate claims cho cùng một vấn đề).
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recall_request_id", unique = true)
    private RecallRequest recallRequest;
}
