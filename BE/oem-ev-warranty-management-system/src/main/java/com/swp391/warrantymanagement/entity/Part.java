package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "parts") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Part {
    @Id
    @Column(name = "part_id", length = 50)
    @NotBlank(message = "Part ID is required")
    @Size(min = 3, max = 50, message = "Part ID must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Part ID can only contain uppercase letters, numbers, underscore and dash")
    private String partId;

    @Column(name = "part_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    @NotBlank(message = "Part name is required")
    @Size(min = 5, max = 100, message = "Part name must be between 5 and 100 characters")
    private String partName;

    @Column(name = "part_number", nullable = false, length = 50, unique = true)
    @NotBlank(message = "Part number is required")
    @Size(min = 3, max = 50, message = "Part number must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Part number can only contain uppercase letters, numbers and dash")
    private String partNumber;

    @Column(name = "manufacturer", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    @NotBlank(message = "Manufacturer is required")
    @Size(min = 2, max = 100, message = "Manufacturer must be between 2 and 100 characters")
    private String manufacturer;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @Column(name = "installation_date", nullable = false)
    @NotNull(message = "Installation date is required")
    private Date installationDate;

    @Column(name = "warranty_expiration_date", nullable = false)
    @NotNull(message = "Warranty expiration date is required")
    private Date warrantyExpirationDate;

    @ManyToOne(fetch = FetchType.LAZY) // fetch là lấy dữ liệu liên quan khi cần thiết, với LAZY thì chỉ lấy khi truy cập
    @JoinColumn(name = "vehicle_id")
    @NotNull(message = "Vehicle is required")
    private Vehicle vehicle;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceHistory> serviceHistories = new ArrayList<>();
}
