package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Users;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface UsersService {
    public Users getById(int id);
    public Users createUser(Users user);
    public Users updateUser(Users user);
    public void deleteUser(int id);
    public List<Users> getUsers();
}
