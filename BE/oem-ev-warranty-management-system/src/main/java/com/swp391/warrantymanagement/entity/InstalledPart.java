package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho một Linh kiện (Part) cụ thể đã được lắp đặt vào một Xe (Vehicle) cụ thể.
 * <p>
 * <strong>Mục đích & Thiết kế:</strong>
 * <ul>
 *     <li>Lớp này đóng vai trò như một "bảng nối có thêm thông tin", không chỉ liên kết {@link Part} và {@link Vehicle}
 *     mà còn lưu trữ các thông tin quan trọng như ngày lắp đặt và ngày hết hạn bảo hành.</li>
 *     <li>Đây là entity trung tâm để xác định một linh kiện trên một chiếc xe có còn trong thời hạn bảo hành hay không.</li>
 *     <li>Sử dụng {@link FetchType#LAZY} cho các mối quan hệ {@code ManyToOne} là một best practice về hiệu năng,
 *     giúp tránh tải các đối tượng {@code Part} và {@code Vehicle} không cần thiết khi truy vấn.</li>
 * </ul>
 */
@Entity
@Table(name = "installed_parts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"part", "vehicle", "warrantyClaims"}) // Tránh lỗi đệ quy (circular dependency) và LazyInitializationException khi gọi toString().
public class InstalledPart {
    /**
     * Khóa chính của bản ghi.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code GenerationType.IDENTITY} để ủy thác việc tạo ID tự tăng cho cơ sở dữ liệu,
     * đây là chiến lược hiệu quả và phổ biến nhất.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "installed_part_id")
    @EqualsAndHashCode.Include
    private Long installedPartId;

    /**
     * Ngày linh kiện được lắp đặt vào xe.
     * Dùng để tính toán thời gian bắt đầu của chu kỳ bảo hành.
     */
    @Column(name = "installation_date", nullable = false)
    private LocalDate installationDate;

    /**
     * Ngày hết hạn bảo hành cho linh kiện cụ thể này.
     * Đây là trường cốt lõi để kiểm tra một yêu cầu bảo hành có hợp lệ hay không.
     */
    @Column(name = "warranty_expiration_date", nullable = false)
    private LocalDate warrantyExpirationDate;

    /**
     * Mối quan hệ N-1 tới entity {@link Part}.
     * Cho biết đây là loại linh kiện nào từ danh mục (catalog).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    /**
     * Mối quan hệ N-1 tới entity {@link Vehicle}.
     * Cho biết linh kiện này được lắp vào xe nào.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Danh sách các yêu cầu bảo hành ({@link WarrantyClaim}) liên quan đến linh kiện đã lắp đặt này.
     * <p>
     * <strong>Thiết kế Cascade:</strong>
     * <ul>
     *     <li><code>CascadeType.ALL</code> và <code>orphanRemoval = true</code> là một quyết định thiết kế quan trọng.</li>
     *     <li>Nó đảm bảo rằng khi một bản ghi {@code InstalledPart} bị xóa (một hành động hiếm và cần cẩn trọng),
     *     tất cả các yêu cầu bảo hành liên quan đến nó cũng sẽ bị xóa theo, giúp duy trì tính toàn vẹn của dữ liệu
     *     và tránh để lại các bản ghi "mồ côi".</li>
     * </ul>
     */
    @OneToMany(mappedBy = "installedPart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
