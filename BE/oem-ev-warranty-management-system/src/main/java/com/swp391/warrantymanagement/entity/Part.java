package com.swp391.warrantymanagement.entity;

import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import jakarta.persistence.*;
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
    private String partId;

    @Column(name = "part_name", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String partName;

    @Column(name = "part_number", nullable = false, length = 50, unique = true)
    private String partNumber;

    @Column(name = "manufacturer", nullable = false, length = 100, columnDefinition = "nvarchar(100)")
    private String manufacturer;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @OneToMany(mappedBy = "part") // xóa part thì không xóa installedPart
    private List<InstalledPart> installedParts = new ArrayList<>();

    @OneToMany(mappedBy = "part") // xóa part thì không xóa serviceHistoryDetail
    private List<ServiceHistoryDetail> serviceHistoryDetails = new ArrayList<>();

}
