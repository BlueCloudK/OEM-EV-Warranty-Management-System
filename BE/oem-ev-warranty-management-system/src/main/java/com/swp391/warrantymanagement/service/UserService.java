package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.User;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    User getById(Long id);
    User createUser(User user);
    User updateUser(User user);
    void deleteUser(Long id);
    List<User> getUsers();
}
