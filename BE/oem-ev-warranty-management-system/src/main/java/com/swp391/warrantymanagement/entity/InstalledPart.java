package com.swp391.warrantymanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity // map/ánh xạ class này với bảng trong database
@Table(name = "installed_parts") // đặt tên bảng trong database
@Getter
@Setter
@AllArgsConstructor // tự động tạo constructor với tất cả các tham số
@NoArgsConstructor // tự động tạo constructor không tham số
// Tối ưu hóa việc so sánh và logging cho Entity:
// - @EqualsAndHashCode: Chỉ định rằng hai đối tượng InstalledPart được coi là bằng nhau nếu chúng có cùng `installedPartId`.
// - @ToString: Khi in đối tượng này ra (ví dụ: khi debug), không hiển thị các trường quan hệ để tránh lỗi đệ quy vô hạn và LazyInitializationException.
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // chỉ so sánh trường installedPartId
@ToString(exclude = {"part", "vehicle", "warrantyClaims"}) // không bao gồm trường part, vehicle và warrantyClaims
public class InstalledPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "installed_part_id")
    @EqualsAndHashCode.Include
    private Long installedPartId;

    @Column(name = "installation_date", nullable = false)
    private LocalDate installationDate;

    @Column(name = "warranty_expiration_date", nullable = false)
    private LocalDate warrantyExpirationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @OneToMany(mappedBy = "installedPart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> warrantyClaims = new ArrayList<>();
}
