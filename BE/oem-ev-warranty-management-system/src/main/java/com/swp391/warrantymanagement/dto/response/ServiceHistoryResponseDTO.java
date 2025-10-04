package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.util.Date;

/** Response DTO: Dữ liệu trả về FE cho ServiceHistory */
@Data
public class ServiceHistoryResponseDTO {
    private Long serviceHistoryId;
    private Date serviceDate;
    private String serviceType;
    private String description;

    // Part information
    private String partId;
    private String partName;

    // Vehicle information
    private Long vehicleId;
    private String vehicleName;
    private String vehicleVin;
}
