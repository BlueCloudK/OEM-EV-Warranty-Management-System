package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.stereotype.Service;

// class đứng giữa Controller và Repository, nó sẽ đưa Object từ Repository lên Controller và ngược lại
@Service
public interface AuthService {
    String login(String username, String rawPassword);
    User validateToken(String token);
    String requestPasswordReset(String email);
    void resetPassword(String token, String newPassword);
}
