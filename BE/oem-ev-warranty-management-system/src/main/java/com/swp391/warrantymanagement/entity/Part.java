package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho một Linh kiện (Part) trong danh mục (catalog) của nhà sản xuất.
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *     <li>Đóng vai trò là "master data" cho các loại linh kiện, tách biệt khỏi thông tin lắp đặt cụ thể.
 *     Việc này tuân theo kiến trúc 3 lớp ({@code Part} -> {@link InstalledPart} -> {@link Vehicle})
 *     để tránh lặp dữ liệu và tăng tính linh hoạt.</li>
 *     <li>Sử dụng {@code BigDecimal} cho trường {@code price} để đảm bảo tính chính xác tuyệt đối trong các phép tính tài chính.</li>
 *     <li>Trường {@code partNumber} được thiết kế là duy nhất (unique), đóng vai trò như một khóa kinh doanh (business key).</li>
 *     <li><b>Thiết kế an toàn:</b> Không sử dụng {@code CascadeType.REMOVE} trên các mối quan hệ để bảo toàn lịch sử dữ liệu
 *     khi một linh kiện bị xóa khỏi danh mục.</li>
 * </ul>
 */
@Entity
@Table(name = "parts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Best practice: Chỉ so sánh dựa trên ID
@ToString(exclude = {"partCategory", "installedParts", "serviceHistoryDetails"}) // Tránh lỗi đệ quy và LazyInitializationException
public class Part {

    // ======= PRIMARY KEY =======
    /**
     * Khóa chính của linh kiện.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@code GenerationType.IDENTITY} để ủy thác việc tạo ID
     * tự tăng cho cơ sở dữ liệu, đây là chiến lược hiệu quả và phổ biến nhất.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    @EqualsAndHashCode.Include // Chỉ định trường này được dùng để so sánh
    private Long partId;

    // ======= THÔNG TIN LINH KIỆN =======
    /**
     * Tên linh kiện, được hiển thị cho người dùng.
     * <p>
     * <code>columnDefinition = "nvarchar(100)"</code> được sử dụng để hỗ trợ đầy đủ các ký tự tiếng Việt có dấu.
     */
    @Column(name = "part_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String partName;

    /**
     * Mã định danh duy nhất của linh kiện theo chuẩn nhà sản xuất (tương tự SKU).
     * <p>
     * <strong>Thiết kế:</strong> <code>unique = true</code> là một ràng buộc nghiệp vụ quan trọng ở mức cơ sở dữ liệu,
     * đảm bảo không có linh kiện trùng lặp trong danh mục. Đây là "khóa kinh doanh" (business key)
     * dùng để tra cứu, đặt hàng và thực hiện các đợt triệu hồi.
     */
    @Column(name = "part_number", nullable = false, length = 50, unique = true)
    private String partNumber;

    /**
     * Nhà sản xuất linh kiện, dùng để theo dõi nguồn gốc và phục vụ cho các đợt triệu hồi.
     */
    @Column(name = "manufacturer", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String manufacturer;

    /**
     * Giá của linh kiện.
     * <p>
     * <strong>Thiết kế:</strong> Sử dụng {@link BigDecimal} là một best practice để đại diện cho các giá trị tiền tệ,
     * đảm bảo tính chính xác tuyệt đối và tránh các lỗi làm tròn thường gặp với kiểu {@code float} hoặc {@code double}.
     */
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // ======= WARRANTY CONFIGURATION (OPTION 2: HIERARCHY WARRANTY) =======

    /**
     * Linh kiện có bảo hành mở rộng riêng hay không.
     * <p>
     * <strong>Hierarchy Warranty Logic:</strong>
     * <ul>
     *     <li>{@code true}: Linh kiện QUAN TRỌNG (VD: Battery, Motor) → Kiểm tra part warranty</li>
     *     <li>{@code false}: Linh kiện THƯỜNG (VD: Đèn, nội thất) → Kiểm tra vehicle warranty</li>
     * </ul>
     */
    @Column(name = "has_extended_warranty", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean hasExtendedWarranty = false;

    /**
     * Thời hạn bảo hành mặc định (tháng) cho linh kiện này.
     * <p>
     * <strong>Ví dụ:</strong>
     * <ul>
     *     <li>Battery: 96 tháng (8 năm)</li>
     *     <li>Motor: 48 tháng (4 năm)</li>
     *     <li>Display: 24 tháng (2 năm)</li>
     * </ul>
     * <strong>Chỉ áp dụng khi:</strong> {@code hasExtendedWarranty = true}
     */
    @Column(name = "default_warranty_months")
    private Integer defaultWarrantyMonths;

    /**
     * Giới hạn km mặc định cho bảo hành linh kiện.
     * <p>
     * <strong>Ví dụ:</strong>
     * <ul>
     *     <li>Battery: 192,000 km</li>
     *     <li>Motor: 80,000 km</li>
     *     <li>Display: 50,000 km</li>
     * </ul>
     * <strong>Chỉ áp dụng khi:</strong> {@code hasExtendedWarranty = true}
     */
    @Column(name = "default_warranty_mileage")
    private Integer defaultWarrantyMileage;

    /**
     * Grace period (ngày) sau khi hết hạn vẫn có thể bảo hành tính phí.
     * <p>
     * <strong>Business Logic:</strong>
     * <ul>
     *     <li>Linh kiện đắt (Battery) → Grace period dài (365 ngày)</li>
     *     <li>Linh kiện rẻ (Display) → Grace period ngắn (90 ngày)</li>
     * </ul>
     */
    @Column(name = "grace_period_days")
    private Integer gracePeriodDays;

    /**
     * Phần trăm phí bảo hành tối thiểu (của chi phí sửa chữa).
     * <p>
     * <strong>Ví dụ:</strong> 0.20 = 20% (ngày đầu quá hạn)
     */
    @Column(name = "paid_warranty_fee_percentage_min", precision = 5, scale = 2)
    private BigDecimal paidWarrantyFeePercentageMin;

    /**
     * Phần trăm phí bảo hành tối đa (của chi phí sửa chữa).
     * <p>
     * <strong>Ví dụ:</strong> 0.50 = 50% (ngày cuối grace period)
     */
    @Column(name = "paid_warranty_fee_percentage_max", precision = 5, scale = 2)
    private BigDecimal paidWarrantyFeePercentageMax;

    // ======= RELATIONSHIPS =======

    /**
     * Danh mục (category) mà phụ tùng này thuộc về.
     * <p>
     * <strong>Business Logic:</strong>
     * <ul>
     *     <li>{@code NULL}: Phụ tùng không thuộc category nào → KHÔNG GIỚI HẠN số lượng trên xe</li>
     *     <li>{@code NOT NULL}: Phụ tùng thuộc category cụ thể → Kiểm tra {@code maxQuantityPerVehicle}</li>
     * </ul>
     * <p>
     * <strong>Ví dụ:</strong>
     * <ul>
     *     <li>Động cơ điện loại A → category = "Động cơ điện" (max: 1)</li>
     *     <li>Động cơ điện loại B → category = "Động cơ điện" (max: 1)</li>
     *     <li>→ Một xe chỉ được lắp 1 trong 2 loại động cơ trên</li>
     * </ul>
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private PartCategory partCategory;

    /**
     * Danh sách các lần linh kiện này được lắp đặt ({@link InstalledPart}).
     * <p>
     * <strong>Thiết kế an toàn:</strong> Không sử dụng {@code CascadeType.REMOVE}.
     * Việc xóa một loại linh kiện khỏi danh mục không nên tự động xóa lịch sử lắp đặt của nó trên các xe,
     * nhằm bảo toàn dữ liệu lịch sử cho việc phân tích và triệu hồi.
     */
    @OneToMany(mappedBy = "part")
    private List<InstalledPart> installedParts = new ArrayList<>();

    /**
     * Danh sách các lần linh kiện này xuất hiện trong lịch sử bảo dưỡng ({@link ServiceHistoryDetail}).
     * <p>
     * <strong>Thiết kế an toàn:</strong> Tương tự như {@code installedParts}, việc xóa linh kiện khỏi danh mục
     * không nên ảnh hưởng đến các bản ghi lịch sử bảo dưỡng đã tồn tại.
     */
    @OneToMany(mappedBy = "part")
    private List<ServiceHistoryDetail> serviceHistoryDetails = new ArrayList<>();
}
