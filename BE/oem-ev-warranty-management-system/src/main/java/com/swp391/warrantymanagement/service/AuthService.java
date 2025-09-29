package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Token;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    Token createToken(Long userId);
    Token findByToken(String token);
    void deleteToken(String token);
    Boolean checkToken(String token);
}
