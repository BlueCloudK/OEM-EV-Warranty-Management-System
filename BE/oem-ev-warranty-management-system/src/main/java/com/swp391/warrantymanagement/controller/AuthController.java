package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) {
        return authService.login(username, password);
    }

    @GetMapping("/validate")
    public User validate(@RequestParam String token) {
        return authService.validateToken(token);
    }
}