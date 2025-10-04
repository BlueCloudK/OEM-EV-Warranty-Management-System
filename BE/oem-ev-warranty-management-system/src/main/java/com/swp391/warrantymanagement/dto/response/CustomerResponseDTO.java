package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.util.Date;
import java.util.UUID;

/** Response DTO: Dữ liệu trả về FE cho Customer */
@Data
public class CustomerResponseDTO {
    private UUID customerId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Date createdAt;

    // User information
    private Long userId;
    private String username;
}
