package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho một Trung tâm bảo hành (Service Center), nơi thực hiện các dịch vụ bảo dưỡng và sửa chữa xe điện.
 * <p>
 *  <strong>Mục đích:</strong>
 *  <ul>
 *   <li>Lưu trữ thông tin liên hệ và vị trí của trung tâm (địa chỉ, giờ mở cửa, tọa độ GPS).</li>
 *   <li>Quản lý các nhân viên (Staff và Technician) làm việc tại trung tâm.</li>
 *   <li>Liên kết với các yêu cầu bảo hành (Warranty Claim) được xử lý tại trung tâm.</li>
 *  </ul>
 * <p>
 *  <strong>Tọa độ GPS (latitude, longitude):</strong>
 *  <ul>
 *   <li>Cho phép tìm kiếm các trung tâm gần nhất với khách hàng (tích hợp Google Maps).</li>
 *   <li>Sử dụng BigDecimal với precision = 9, scale = 6 để đảm bảo độ chính xác cao khi tính toán khoảng cách địa lý.</li>
 *  </ul>
 */
@Entity
@Table(name = "service_centers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"users", "warrantyClaims"})
public class ServiceCenter {

    // ======= PRIMARY KEY =======
    /**
     * ID duy nhất của service center
     * - Auto-increment: Database tự động tăng
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_center_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long serviceCenterId;

    // ======= THÔNG TIN CƠ BẢN =======

    /**
     * Tên của trung tâm bảo hành.
     * <p>
     *  <strong>Column Definition:</strong> Sử dụng nvarchar(100) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt).
     */
    @Column(name = "name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    /**
     * Địa chỉ của trung tâm bảo hành.
     * <p>
     *  <strong>Column Definition:</strong> Sử dụng nvarchar(255) để hỗ trợ đầy đủ các ký tự Unicode (tiếng Việt) và đủ dài cho địa chỉ chi tiết.
     */
    @Column(name = "address", nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    private String address;

    /**
     * Số điện thoại của trung tâm bảo hành.
     *  <strong>Ràng buộc:</strong> Trường này phải là duy nhất (unique) để đảm bảo không có hai trung tâm nào có cùng số điện thoại.
     */
    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    /**
     * Giờ mở cửa của trung tâm bảo hành.
     * <p>
     *  <strong>Định dạng:</strong> Chuỗi văn bản tự do mô tả giờ mở cửa (ví dụ: "Thứ 2-6: 8:00-17:00, Thứ 7: 8:00-12:00, CN: Nghỉ").
     */
    @Column(name = "opening_hours", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String openingHours;

    // ======= TỌA ĐỘ GPS (Google Maps Integration) =======
    /**
     * Vĩ độ (Latitude) của trung tâm bảo hành.
     * <p>
     *  <strong>Thiết kế:</strong> Sử dụng BigDecimal với precision = 9, scale = 6 để đảm bảo độ chính xác cao khi tính toán khoảng cách địa lý.
     */
    @Column(name = "latitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal latitude;

    /**
     * Kinh độ (Longitude) của trung tâm bảo hành.
     * <p>
     *  <strong>Thiết kế:</strong> Sử dụng BigDecimal với precision = 9, scale = 6 để đảm bảo độ chính xác cao khi tính toán khoảng cách địa lý.
     */
    @Column(name = "longitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal longitude;

    // ======= BUSINESS RULES =======

    /**
     * Số lượng claim tối đa mà mỗi technician có thể bắt đầu xử lý trong một ngày.
     * <p>
     *  <strong>Mục đích:</strong> Kiểm soát workload và đảm bảo chất lượng dịch vụ.
     *  <strong>Giá trị mặc định:</strong> 10 claims/ngày
     *  <strong>Lưu ý:</strong> Admin có thể điều chỉnh giá trị này cho từng service center.
     */
    @Column(name = "daily_claim_limit_per_tech", nullable = false)
    private Integer dailyClaimLimitPerTech = 10;

    // ======= RELATIONSHIPS =======

    /**
     * Danh sách các người dùng ({@link User}) làm việc tại trung tâm bảo hành này (Quan hệ 1-N).
     * <p>
     *  <strong>Thiết kế:</strong> Không sử dụng CascadeType.REMOVE.
     *  Khi xóa một trung tâm bảo hành, chúng ta không nên tự động xóa các tài khoản người dùng liên quan,
     *  mà cần phải di chuyển họ sang một trung tâm khác hoặc vô hiệu hóa tài khoản.
     */
    @OneToMany(mappedBy = "serviceCenter")
    private List<User> users = new ArrayList<>();

    /**
     * Danh sách các yêu cầu bảo hành ({@link WarrantyClaim}) được xử lý tại trung tâm bảo hành này (Quan hệ 1-N).
     * <p>
     *  <strong>Thiết kế:</strong> Không sử dụng CascadeType.REMOVE.
     *  Khi xóa một trung tâm bảo hành, chúng ta không nên tự động xóa các yêu cầu bảo hành liên quan,
     *  mà cần phải di chuyển chúng sang một trung tâm khác hoặc lưu trữ cho mục đích lịch sử.
     */
    @OneToMany(mappedBy = "serviceCenter")
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
