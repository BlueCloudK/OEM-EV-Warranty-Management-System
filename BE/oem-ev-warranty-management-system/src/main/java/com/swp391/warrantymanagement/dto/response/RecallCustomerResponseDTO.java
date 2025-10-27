package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

@Data
public class RecallCustomerResponseDTO {
    private Boolean accepted;
    private String customerNote;
}
