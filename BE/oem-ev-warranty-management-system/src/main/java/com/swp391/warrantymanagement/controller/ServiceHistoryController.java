package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/service-history")
@CrossOrigin
public class ServiceHistoryController {
    @Autowired
    private ServiceHistoryService serviceHistoryService;


}
