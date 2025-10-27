package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RecallCustomerResponseDTO {
    @NotNull(message = "Customer response (accepted/rejected) is required")
    private Boolean accepted;

    @Size(max = 1000, message = "Customer note cannot exceed 1000 characters")
    private String customerNote;
}
