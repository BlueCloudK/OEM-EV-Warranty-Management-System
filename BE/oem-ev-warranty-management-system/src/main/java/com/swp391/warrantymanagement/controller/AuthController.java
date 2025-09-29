package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private final AuthService authService;

}
