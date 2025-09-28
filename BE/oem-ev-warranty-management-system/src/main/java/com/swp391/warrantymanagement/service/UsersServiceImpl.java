package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Users;
import com.swp391.warrantymanagement.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsersServiceImpl implements UsersService {

    @Autowired // Automatically injects VehiclesRepository dependency
    private UsersRepository usersRepository;

    @Override
    public Users getById(int id) {
        return usersRepository.findById(id).orElse(null);
    }

    @Override
    public Users createUser(Users user) {
        return usersRepository.save(user);
    }

    @Override
    public Users updateUser(Users user) {
        Users existingUser = usersRepository.findById(user.getUserId()).orElse(null);
        if (existingUser != null) {
            return usersRepository.save(user);
        }
        return null;
    }

    @Override
    public void deleteUser(int id) {
        usersRepository.deleteById(id);
    }

    @Override
    public List<Users> getUsers() {
        return usersRepository.findAll();
    }
}
