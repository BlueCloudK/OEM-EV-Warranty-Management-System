package com.swp391.warrantymanagement.service.impl;

//import com.swp391.warrantymanagement.entity.Role;
//import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.service.RoleService;
//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {
//
//    @Autowired // này là dùng reflection để tự động inject cái RoleRepository vào đây
//    private RoleRepository roleRepository;
//
//    // Constructor
//    @Override
//    public Role findByRoleName(String roleName) {
//        return roleRepository.findByRoleName(roleName);
//    }
//
//    // CRUD methods
//    @Override
//    public Role getById(Long id) {
//        return roleRepository.findById(id).orElse(null);
//    }
//
//    // Create and Update can use the same save method
//    @Override
//    public Role updateRole(Role role) {
//        Role existingRole = roleRepository.findById(role.getRoleId()).orElse(null);
//        if (existingRole != null) {
//            existingRole.setRoleName(role.getRoleName());
//            return roleRepository.save(existingRole);
//        }
//        return existingRole;
//    }
//
//    // Create and Update can use the same save method
//    @Override
//    public void deleteRole(Long id) {
//        roleRepository.deleteById(id);
//    }
//
//    // Create and Update can use the same save method
//    @Override
//    public List<Role> getRoles() {
//        return roleRepository.findAll();
//    }
}
