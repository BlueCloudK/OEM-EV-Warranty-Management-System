package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "service_history_details") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class ServiceHistoryDetail {
    @EmbeddedId
    private ServiceHistoryDetailId id;

    @Column(name = "quantity", updatable = false, nullable = false)
    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("partId")
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceHistoryId")
    @JoinColumn(name = "service_history_id", nullable = false)
    private ServiceHistory serviceHistory;
}
