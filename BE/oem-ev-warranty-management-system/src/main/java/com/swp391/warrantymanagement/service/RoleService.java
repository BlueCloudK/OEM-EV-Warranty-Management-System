package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Role;

import java.util.List;

/**
 * Service xử lý Role (RBAC - Role-Based Access Control).
 * <p>
 * <strong>Tại sao không implement CRUD operations:</strong>
 * <ul>
 *     <li>Roles là <strong>master data</strong> được khởi tạo sẵn qua {@link com.swp391.warrantymanagement.config.DataInitializer}
 *     (ROLE_ADMIN, ROLE_EVM_STAFF, ROLE_SC_STAFF, ROLE_SC_TECHNICIAN, ROLE_CUSTOMER).</li>
 *     <li><strong>Security reason:</strong> Tránh rủi ro bảo mật khi cho phép thay đổi/xóa roles động
 *     (vd: vô tình xóa ROLE_ADMIN → mất quyền quản trị hệ thống).</li>
 *     <li><strong>Stability:</strong> Role structure cố định giúp hệ thống ổn định, dễ maintain và test.
 *     Nếu cần thay đổi roles, phải thông qua database migration chứ không phải runtime.</li>
 * </ul>
 * <p>
 * <strong>Khi nào cần uncomment:</strong> Khi business yêu cầu dynamic role management
 * (vd: cho phép Admin tạo custom roles với permissions tùy chỉnh).
 */
public interface RoleService {
    // Methods commented out - roles are pre-initialized in database
    // Uncomment nếu cần dynamic role management trong tương lai
    //
    //    Role findByRoleName(String roleName);
    //    Role getById(Long id);
    //    Role updateRole(Role role);
    //    void deleteRole(Long id);
    //    List<Role> getRoles();
}
