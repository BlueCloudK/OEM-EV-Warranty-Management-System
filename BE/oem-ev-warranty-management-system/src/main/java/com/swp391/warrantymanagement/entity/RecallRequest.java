package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "recall_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecallRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recallRequestId;

    // Liên kết với InstalledPart để biết part nào trên xe nào cần recall
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installed_part_id", nullable = false)
    private InstalledPart installedPart;

    // Trạng thái nghiệp vụ
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallRequestStatus status;

    // Lý do recall
    @Column(length = 1000)
    private String reason;

    // Ghi chú của admin
    @Column(length = 1000)
    private String adminNote;

    // Ghi chú của khách hàng
    @Column(length = 1000)
    private String customerNote;

    // Người tạo (EVM)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // Người duyệt (Admin/Staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "recallRequest", fetch = FetchType.LAZY)
    private WarrantyClaim warrantyClaim; // Recall này đã tạo claim nào

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

