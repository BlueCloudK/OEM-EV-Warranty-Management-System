package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*; // ipmort anatation jpa này là các code entity đã được viết sẵn để làm việc với database
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "customers") // đặt tên bảng trong database
@Data // tự động tạo getter, setter, toString, hashCode, equals
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
public class Customer {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "customer_id", columnDefinition = "BINARY(16)")
    private UUID customerId;

    @Column(name = "name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    // chặn từ form
    @NotBlank(message = "Name is required")
    @Size(min=5, max = 100, message = "Name must be between 5 and 100 characters")
    @Pattern(
            regexp = "^(\\p{Lu}\\p{Ll}+)(\\s\\p{Lu}\\p{Ll}+)*$",
            message = "Each word must start with a capital letter, no numbers/special characters, no extra spaces"
    )
    private String name;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    @NotBlank(message = "Email is required")
    @Pattern(
            regexp ="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$" // may be 99% email hiện tại ^_^
    )
    private String email;

    @Column(name = "phone", nullable = false, length = 15, unique = true)
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Column(name = "address", nullable = false, length = 255)
    @NotBlank(message = "Address is required")
    private String address;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicle> vehicles = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY) // fetch là lấy dữ liệu liên quan khi cần thiết, với LAZY thì chỉ lấy khi truy cập
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
