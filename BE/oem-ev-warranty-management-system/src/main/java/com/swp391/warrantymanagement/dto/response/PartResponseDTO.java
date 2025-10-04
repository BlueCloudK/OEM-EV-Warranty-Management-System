package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

/** Response DTO: Dữ liệu trả về FE cho Part */
@Data
public class PartResponseDTO {
    private String partId;
    private String partName;
    private String partNumber;
    private String manufacturer;
    private BigDecimal price;
    private Date installationDate;
    private Date warrantyExpirationDate;

    // Vehicle information
    private Long vehicleId;
    private String vehicleName;
    private String vehicleVin;
}
