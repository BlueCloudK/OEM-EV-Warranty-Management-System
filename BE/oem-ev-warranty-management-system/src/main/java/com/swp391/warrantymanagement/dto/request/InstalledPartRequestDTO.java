package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * InstalledPartRequestDTO - Used by Dealer Staff (SC_STAFF) to install a part on a vehicle
 * Links an existing Part to a Vehicle with installation details
 */
@Data
public class InstalledPartRequestDTO {
    @NotBlank(message = "Installed part ID is required")
    @Size(max = 50, message = "Installed part ID cannot exceed 50 characters")
    private String installedPartId;

    @NotBlank(message = "Part ID is required")
    @Size(max = 50, message = "Part ID cannot exceed 50 characters")
    private String partId;

    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;

    @NotNull(message = "Installation date is required")
    @PastOrPresent(message = "Installation date cannot be in the future")
    private LocalDate installationDate;

    @NotNull(message = "Warranty expiration date is required")
    @Future(message = "Warranty expiration date must be in the future")
    private LocalDate warrantyExpirationDate;
}
