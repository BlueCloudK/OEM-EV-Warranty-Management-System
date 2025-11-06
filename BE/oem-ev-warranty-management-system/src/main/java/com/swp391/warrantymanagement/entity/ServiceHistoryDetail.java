package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import jakarta.persistence.*;
import lombok.*;

/**
 * Junction entity biểu diễn quan hệ many-to-many giữa ServiceHistory và Part,
 * với attribute bổ sung là quantity (số lượng part đã thay).
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *     <li><strong>Sử dụng composite key thay vì surrogate ID:</strong> Kết hợp
 *     (serviceHistoryId, partId) là natural key duy nhất, không cần ID riêng.
 *     Điều này tiết kiệm storage và enforce business rule: mỗi part chỉ xuất hiện
 *     một lần trong một lần service (không duplicate entries).</li>
 *     <li><strong>quantity updatable = false:</strong> Audit trail requirement - một khi
 *     ghi nhận số lượng part đã thay, không cho phép sửa đổi để đảm bảo data integrity
 *     và compliance. Nếu cần sửa, phải xóa và tạo record mới.</li>
 *     <li><strong>Sử dụng @MapsId:</strong> Tích hợp composite key với relationships,
 *     JPA tự động sync ID từ Part và ServiceHistory vào composite key.</li>
 * </ul>
 */
@Entity
@Table(name = "service_history_details")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Base equality trên composite key (không phải relationships) để tránh vấn đề với JPA proxy
@EqualsAndHashCode(of = "id")
// Exclude relationships để tránh vòng lặp đệ quy
@ToString(exclude = {"part", "serviceHistory"})
public class ServiceHistoryDetail {
    /**
     * Composite primary key gồm (serviceHistoryId, partId).
     * <p>
     * <strong>Tại sao dùng composite key:</strong> Natural key đảm bảo uniqueness constraint
     * (mỗi part chỉ xuất hiện một lần trong một service history) ngay tại database level,
     * không cần validation ở application layer.
     */
    @EmbeddedId
    private ServiceHistoryDetailId id;

    /**
     * Số lượng part đã thay, với {@code updatable = false}.
     * <p>
     * <strong>Tại sao immutable:</strong> Đây là audit trail record. Một khi ghi nhận số lượng
     * part đã sử dụng, không cho phép sửa đổi để đảm bảo compliance và data integrity.
     * Nếu cần điều chỉnh, phải xóa record cũ và tạo record mới (explicit audit trail).
     */
    @Column(name = "quantity", updatable = false, nullable = false)
    private int quantity;

    /**
     * Part được sử dụng trong lần service này.
     * <p>
     * <strong>@MapsId("partId"):</strong> JPA tự động đồng bộ part.id vào composite key,
     * không cần set thủ công id.partId khi tạo entity mới.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("partId")
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    /**
     * Service history mà detail này thuộc về.
     * <p>
     * <strong>@MapsId("serviceHistoryId"):</strong> Tương tự trên, JPA tự động sync
     * serviceHistory.id vào composite key.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceHistoryId")
    @JoinColumn(name = "service_history_id", nullable = false)
    private ServiceHistory serviceHistory;
}
