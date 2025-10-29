package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;

/**
 * PartResponseDTO - Returns part information to frontend
 * Contains only part details (NO vehicle information)
 */
@Data
public class PartResponseDTO {
    private Long partId;
    private String partName;
    private String partNumber;
    private String manufacturer;
    private BigDecimal price;
}
