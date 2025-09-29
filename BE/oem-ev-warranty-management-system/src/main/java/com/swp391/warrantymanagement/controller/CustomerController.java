package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/customers")
@CrossOrigin
public class CustomerController {
    @Autowired
    private CustomerService customerService;


}
