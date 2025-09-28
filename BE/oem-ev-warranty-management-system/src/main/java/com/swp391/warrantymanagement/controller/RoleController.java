package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.CreateRoleRequestDTO;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/roles")
@CrossOrigin
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping("/")
    public ResponseEntity<List<Role>> getRoles() {
        return ResponseEntity.ok(roleService.getRoles());
    }

    @GetMapping("/roleId")
    public ResponseEntity<Role> getRoleById(@RequestParam String roleId) {
        Role role = roleService.findByRoleName(roleId);
        if (role != null) {
            return ResponseEntity.ok(role);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Role> createRole(@RequestBody CreateRoleRequestDTO role) {
        return ResponseEntity.ok(roleService.createRole(role));
    }

    @DeleteMapping("/roleId")
    public ResponseEntity<Void> deleteRole(@PathVariable int roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Role> updateRole(@RequestBody Role role) {
        return ResponseEntity.ok(roleService.updateRole(role));
    }
}
