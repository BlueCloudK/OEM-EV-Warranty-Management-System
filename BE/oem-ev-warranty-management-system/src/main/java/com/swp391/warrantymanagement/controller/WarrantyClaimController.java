package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.service.WarrantyClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    @Autowired
    private WarrantyClaimService warrantyClaimsService;


}
