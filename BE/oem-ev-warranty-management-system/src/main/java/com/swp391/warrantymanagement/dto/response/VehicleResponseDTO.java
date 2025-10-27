package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/** Response DTO: Dữ liệu trả về FE cho Vehicle */
@Data
public class VehicleResponseDTO {
    private Long vehicleId;
    private String vehicleName;
    private String vehicleModel;
    private int vehicleYear;
    private String vehicleVin;
    private LocalDate purchaseDate;
    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private Integer mileage; // Số km đã đi

    // Customer information
    private UUID customerId;
    private String customerName;
}
