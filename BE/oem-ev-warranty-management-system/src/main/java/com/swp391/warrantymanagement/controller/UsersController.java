package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Users;
import com.swp391.warrantymanagement.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
@CrossOrigin
public class UsersController {
    @Autowired
    private UsersService usersService;

    @GetMapping("/")
    public ResponseEntity<List<Users>> getUsers() {
        return ResponseEntity.ok(usersService.getUsers());
    }

    @GetMapping("/userId")
    public ResponseEntity<Users> getUserById(@PathVariable int id) {
        Users user = usersService.getById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Users> createUser(@RequestBody Users user) {
        return ResponseEntity.ok(usersService.createUser(user));
    }

    @DeleteMapping("/userId")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        usersService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Users> updateUser(@RequestBody Users user) {
        return ResponseEntity.ok(usersService.updateUser(user));
    }
}
