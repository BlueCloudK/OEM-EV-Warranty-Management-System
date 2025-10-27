package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecallRequestResponseDTO {
    private Long recallRequestId;
    private String installedPartId;
    private String partId;
    private String partName;
    private Long vehicleId;
    private String vehicleName;
    private String customerId;
    private String customerName;
    private RecallRequestStatus status;
    private String reason;
    private String adminNote;
    private String customerNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
