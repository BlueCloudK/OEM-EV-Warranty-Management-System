package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.util.UUID;

/** Response DTO: Dữ liệu trả về FE cho Vehicle */
@Data
public class VehicleResponseDTO {
    private Long vehicleId;
    private String vehicleName;
    private String vehicleModel;
    private int vehicleYear;
    private String vehicleVin;

    // Customer information
    private UUID customerId;
    private String customerName;
}
