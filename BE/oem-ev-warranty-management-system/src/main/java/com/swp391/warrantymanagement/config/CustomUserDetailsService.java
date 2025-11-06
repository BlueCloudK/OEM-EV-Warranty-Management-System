package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Custom UserDetailsService để load user từ database
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true) // REFACTOR: Bọc trong transaction để cho phép lazy-loading role
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // REFACTOR: Chỉ cần một lần truy vấn DB để lấy cả User và Role (thông qua lazy-loading).
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Lấy role trực tiếp từ đối tượng User.
        // Nhờ có @Transactional, JPA có thể fetch role khi cần.
        Role role = user.getRole();
        if (role == null) {
            throw new UsernameNotFoundException("Role not found for user: " + username);
        }

        // Convert authority từ role (single role)
        // FIX: Tự động thêm prefix "ROLE_" nếu chưa có để tương thích với Spring Security hasRole()
        String roleName = role.getRoleName();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(roleName)
        );

        // Return Spring Security UserDetails
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false) // Tạm thời disable check này do user không có field active (trong tương lai có thể thêm)
                .build();
    }
}
