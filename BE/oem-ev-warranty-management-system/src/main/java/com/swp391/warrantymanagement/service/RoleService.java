package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.CreateRoleRequestDTO;
import com.swp391.warrantymanagement.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    public Role findByRoleName(String roleName);
    public Role getById(int id);
    public Role createRole(CreateRoleRequestDTO role);
    public Role updateRole(Role role);
    public void deleteRole(int id);

    public List<Role> getRoles();
}
