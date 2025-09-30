package com.swp391.warrantymanagement.service;

import org.springframework.stereotype.Service;

@Service
public interface JwtService {
    public String generateToken(String username);
    String extractUsername(String token);
    boolean isTokenValid(String token);
}
