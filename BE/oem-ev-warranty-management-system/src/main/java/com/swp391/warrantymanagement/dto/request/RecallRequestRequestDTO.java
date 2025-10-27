package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RecallRequestRequestDTO {
    @NotBlank(message = "Installed part ID is required")
    private String installedPartId;

    @NotBlank(message = "Recall reason is required")
    @Size(min = 10, max = 1000, message = "Recall reason must be between 10 and 1000 characters")
    private String reason;
}

