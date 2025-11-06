package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho xe điện của khách hàng, là trung tâm của hệ thống quản lý bảo hành.
 * <p>
 * <strong>Quyết định thiết kế chính:</strong>
 * <ul>
 *     <li><strong>VIN unique constraint:</strong> Tuân thủ chuẩn ISO 3779, đảm bảo mỗi xe chỉ được
 *     đăng ký một lần trong hệ thống, phòng chống gian lận bảo hành.</li>
 *     <li><strong>Sử dụng LocalDate thay vì Date/Timestamp:</strong> Business domain chỉ quan tâm đến ngày
 *     (không cần giờ phút giây), LocalDate tránh được vấn đề timezone và immutable by design.</li>
 *     <li><strong>Cascade ALL cho InstalledPart/ServiceHistory/WarrantyClaim:</strong> Các entity này là
 *     dữ liệu phụ thuộc (dependent data) không có ý nghĩa khi xe bị xóa, nên vòng đời của chúng
 *     được quản lý bởi Vehicle (aggregate root pattern).</li>
 *     <li><strong>Mileage tracking:</strong> Cần thiết vì chính sách bảo hành thường có điều kiện kép
 *     (thời gian HOẶC số km, điều kiện nào đến trước). Service layer sẽ kiểm tra cả hai điều kiện
 *     trước khi chấp nhận warranty claim.</li>
 * </ul>
 */
@Entity
@Table(name = "vehicles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Chỉ include ID để tránh so sánh sâu các lazy collections (tránh trigger load không cần thiết)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Exclude collections để tránh vòng lặp đệ quy và LazyInitializationException khi toString()
@ToString(exclude = {"customer", "installedParts", "serviceHistories", "warrantyClaims"})
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    @EqualsAndHashCode.Include
    private Long vehicleId;

    @Column(name = "vehicle_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String vehicleName;

    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;

    /**
     * Năm sản xuất được lưu dưới dạng {@code int} thay vì {@code String}.
     * <p>
     * <strong>Tại sao dùng int:</strong> Cho phép validation logic đơn giản
     * (vd: {@code vehicleYear <= currentYear}) và tiết kiệm storage so với String.
     */
    @Column(name = "vehicle_year", nullable = false)
    private int vehicleYear;

    /**
     * VIN (Vehicle Identification Number) - số khung xe theo chuẩn ISO 3779.
     * <p>
     * <strong>Tại sao unique constraint:</strong> VIN là định danh toàn cầu duy nhất của xe,
     * việc ép unique trong database ngăn chặn duplicate entries và gian lận bảo hành
     * (vd: đăng ký cùng một xe nhiều lần để claim nhiều lần).
     * <p>
     * <strong>Vai trò trong recall:</strong> Khi phát hiện lỗi hàng loạt, nhà sản xuất
     * sử dụng VIN để xác định chính xác các xe bị ảnh hưởng (theo batch/serial number).
     */
    @Column(name = "vehicle_vin", nullable = false, length = 50, unique = true)
    private String vehicleVin;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    /**
     * Ngày bắt đầu bảo hành có thể khác với {@code purchaseDate}.
     * <p>
     * <strong>Tại sao tách riêng:</strong> Xe demo hoặc xe tồn kho có thể được bán sau
     * khi sản xuất, nhưng bảo hành chỉ bắt đầu từ ngày bán (không tính thời gian tồn kho).
     */
    @Column(name = "warranty_start_date", nullable = false)
    private LocalDate warrantyStartDate;

    /**
     * Ngày hết hạn bảo hành, được tính từ {@code warrantyStartDate}.
     * <p>
     * <strong>Lưu ý business logic:</strong> Bảo hành thường có điều kiện kép (thời gian HOẶC km).
     * Service layer cần kiểm tra cả {@code warrantyEndDate} và {@code mileage} trước khi
     * chấp nhận warranty claim.
     */
    @Column(name = "warranty_end_date", nullable = false)
    private LocalDate warrantyEndDate;

    /**
     * Số km đã đi (odometer reading), được cập nhật mỗi lần xe vào service center.
     * <p>
     * <strong>Tại sao cần tracking mileage:</strong> Chính sách bảo hành thường có giới hạn km
     * (vd: "2 năm hoặc 100,000 km, điều kiện nào đến trước"). Trường này là điều kiện
     * cần thiết để xác định tính hợp lệ của warranty claim.
     */
    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    /**
     * Chủ sở hữu của xe (nullable = false vì xe phải có chủ).
     * <p>
     * <strong>Lưu ý business logic:</strong> Khi chuyển nhượng xe, cần cập nhật
     * {@code customer_id} và đồng thời tính toán lại warranty eligibility (vì một số
     * chính sách bảo hành không chuyển nhượng được).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /**
     * Danh sách linh kiện đã lắp đặt trên xe.
     * <p>
     * <strong>Tại sao dùng cascade ALL + orphanRemoval:</strong> InstalledPart là dữ liệu
     * phụ thuộc không có ý nghĩa khi xe bị xóa khỏi hệ thống. Mỗi part có warranty riêng
     * (vd: battery 5 năm, motor 3 năm), nên cần tracking chính xác part nào được lắp lúc nào.
     */
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InstalledPart> installedParts = new ArrayList<>();

    /**
     * Lịch sử bảo dưỡng/sửa chữa của xe.
     * <p>
     * <strong>Tại sao dùng cascade ALL:</strong> ServiceHistory là audit trail gắn với xe,
     * khi xe bị xóa (vd: thanh lý) thì lịch sử này không còn ý nghĩa (business requirement).
     */
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistory> serviceHistories = new ArrayList<>();

    /**
     * Danh sách yêu cầu bảo hành cho xe này.
     * <p>
     * <strong>Tại sao dùng cascade ALL:</strong> Tương tự ServiceHistory, WarrantyClaim
     * là dữ liệu phụ thuộc. Khi xe bị xóa, các claim liên quan cũng mất ý nghĩa và
     * nên được xóa để đảm bảo data consistency.
     */
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
