package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.PartRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PartRequest Entity - Yêu cầu linh kiện từ SC_TECHNICIAN đến hãng (EVM)
 *
 * Flow:
 * 1. SC_TECHNICIAN phát hiện part có vấn đề khi xử lý warranty claim
 * 2. Tạo PartRequest với status = PENDING
 * 3. EVM_STAFF xem xét và duyệt/từ chối
 * 4. Nếu approved, EVM gửi part mới và cập nhật status
 * 5. SC_TECHNICIAN nhận part và confirm delivered
 */
@Entity
@Table(name = "part_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warranty_claim_id", nullable = false)
    private WarrantyClaim warrantyClaim; // Claim liên quan đến yêu cầu này

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faulty_part_id", nullable = false)
    private Part faultyPart; // Part bị lỗi cần thay thế

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy; // SC_TECHNICIAN tạo yêu cầu

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy; // EVM_STAFF duyệt yêu cầu

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    private ServiceCenter serviceCenter; // Service center cần nhận part

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "issue_description", nullable = false, length = 1000, columnDefinition = "nvarchar(1000)")
    private String issueDescription; // Mô tả vấn đề của part

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PartRequestStatus status = PartRequestStatus.PENDING;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1; // Số lượng part cần yêu cầu

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "shipped_date")
    private LocalDateTime shippedDate;

    @Column(name = "delivered_date")
    private LocalDateTime deliveredDate;

    @Column(name = "rejection_reason", length = 500, columnDefinition = "nvarchar(500)")
    private String rejectionReason; // Lý do từ chối (nếu có)

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber; // Mã vận chuyển (nếu có)

    @Column(name = "notes", length = 1000, columnDefinition = "nvarchar(1000)")
    private String notes; // Ghi chú thêm từ EVM_STAFF
}

