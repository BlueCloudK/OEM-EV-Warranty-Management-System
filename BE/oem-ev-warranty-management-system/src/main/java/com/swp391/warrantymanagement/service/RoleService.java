package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    Role findByRoleName(String roleName);
    Role getById(Long id);
    Role updateRole(Role role);
    void deleteRole(Long id);
    List<Role> getRoles();
}
