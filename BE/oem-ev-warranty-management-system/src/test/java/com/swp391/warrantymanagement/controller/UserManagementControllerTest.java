package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.UserService;
import com.swp391.warrantymanagement.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UserManagementController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("UserManagementController Tests")
class UserManagementControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @BeforeEach
    void setUp() {
        Mockito.reset(userService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users should return 200 OK for ADMIN")
    void getAllUsers_Admin_Success() throws Exception {
        // Arrange
        Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(userService.getAllUsers(any(PageRequest.class), any(), any())).thenReturn(emptyPage);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/admin/users should return 403 Forbidden for non-ADMIN")
    void getAllUsers_Staff_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/{userId} should return 200 OK when user exists")
    void getUserById_Success() throws Exception {
        // Arrange
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("CUSTOMER");

        User user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setRole(role);

        when(userService.getUserById(1L)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/{userId} should return 404 Not Found when user does not exist")
    void getUserById_NotFound() throws Exception {
        // Arrange
        when(userService.getUserById(1L)).thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/search should return 200 OK with search results")
    void searchUsers_Success() throws Exception {
        // Arrange
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("CUSTOMER");

        User user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setRole(role);

        Page<User> userPage = new PageImpl<>(Arrays.asList(user), PageRequest.of(0, 10), 1);
        when(userService.searchByUsername(eq("test"), any(PageRequest.class))).thenReturn(userPage);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/search")
                        .param("username", "test")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/search should return 400 Bad Request on error")
    void searchUsers_BadRequest() throws Exception {
        // Arrange
        when(userService.searchByUsername(anyString(), any(PageRequest.class)))
                .thenThrow(new RuntimeException("Search failed"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/search")
                        .param("username", "test"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/by-role/{roleName} should return 200 OK with users by role")
    void getUsersByRole_Success() throws Exception {
        // Arrange
        Role customerRole = new Role();
        customerRole.setRoleId(1L);
        customerRole.setRoleName("CUSTOMER");

        User user1 = new User();
        user1.setUserId(1L);
        user1.setUsername("customer1");
        user1.setRole(customerRole);

        User user2 = new User();
        user2.setUserId(2L);
        user2.setUsername("customer2");
        user2.setRole(customerRole);

        Page<User> userPage = new PageImpl<>(Arrays.asList(user1, user2), PageRequest.of(0, 10), 2);
        when(userService.getUsersByRole(eq("CUSTOMER"), any(PageRequest.class))).thenReturn(userPage);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/by-role/CUSTOMER")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/by-role/{roleName} should return 400 Bad Request on error")
    void getUsersByRole_BadRequest() throws Exception {
        // Arrange
        when(userService.getUsersByRole(anyString(), any(PageRequest.class)))
                .thenThrow(new RuntimeException("Invalid role"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/by-role/INVALID_ROLE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/admin/users/{userId} should return 200 OK when update is successful")
    void updateUser_Success() throws Exception {
        // Arrange
        Map<String, Object> updateRequest = new HashMap<>();
        updateRequest.put("email", "newemail@example.com");
        updateRequest.put("address", "New Address 123");

        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("CUSTOMER");

        User updatedUser = new User();
        updatedUser.setUserId(1L);
        updatedUser.setUsername("testuser");
        updatedUser.setEmail("newemail@example.com");
        updatedUser.setRole(role);

        when(userService.updateUser(eq(1L), any(Map.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User updated successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/admin/users/{userId} should return 400 Bad Request on error")
    void updateUser_BadRequest() throws Exception {
        // Arrange
        Map<String, Object> updateRequest = new HashMap<>();
        updateRequest.put("email", "invalid-email");

        when(userService.updateUser(eq(1L), any(Map.class)))
                .thenThrow(new RuntimeException("Invalid email format"));

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/admin/users/{userId}/role should return 200 OK when role update is successful")
    void updateUserRole_Success() throws Exception {
        // Arrange
        Role newRole = new Role();
        newRole.setRoleId(2L);
        newRole.setRoleName("SC_STAFF");

        User updatedUser = new User();
        updatedUser.setUserId(1L);
        updatedUser.setUsername("testuser");
        updatedUser.setRole(newRole);

        when(userService.updateUserRole(eq(1L), eq(2L))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(patch("/api/admin/users/1/role")
                        .param("newRoleId", "2")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User role updated successfully"))
                .andExpect(jsonPath("$.newRoleName").value("SC_STAFF"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/admin/users/{userId}/role should return 400 Bad Request on error")
    void updateUserRole_BadRequest() throws Exception {
        // Arrange
        when(userService.updateUserRole(eq(1L), eq(999L)))
                .thenThrow(new RuntimeException("Role not found"));

        // Act & Assert
        mockMvc.perform(patch("/api/admin/users/1/role")
                        .param("newRoleId", "999")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/admin/users/{id} should return 200 OK for ADMIN")
    void deleteUser_Admin_Success() throws Exception {
        // Arrange
        doNothing().when(userService).deleteUser(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("DELETE /api/admin/users/{id} should return 403 Forbidden for non-ADMIN")
    void deleteUser_Staff_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/admin/users/{id} should return 400 Bad Request on error")
    void deleteUser_BadRequest() throws Exception {
        // Arrange
        Mockito.doThrow(new RuntimeException("Cannot delete user with active claims"))
                .when(userService).deleteUser(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/1")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/admin/users/{userId}/reset-password should return 200 OK with auto-generated password when newPassword is null")
    void resetUserPassword_NullPassword_Success() throws Exception {
        // Arrange
        String autoGeneratedPassword = "AutoGen123!";
        when(userService.resetUserPassword(eq(1L), isNull())).thenReturn(autoGeneratedPassword);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users/1/reset-password")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User password reset successfully"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.newPassword").value(autoGeneratedPassword))
                .andExpect(jsonPath("$.note").value("Please share this password securely with the user"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/admin/users/{userId}/reset-password should return 200 OK with auto-generated password when newPassword is empty")
    void resetUserPassword_EmptyPassword_Success() throws Exception {
        // Arrange
        String autoGeneratedPassword = "AutoGen456!";
        when(userService.resetUserPassword(eq(1L), eq(""))).thenReturn(autoGeneratedPassword);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users/1/reset-password")
                        .param("newPassword", "")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User password reset successfully"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.newPassword").value(autoGeneratedPassword))
                .andExpect(jsonPath("$.note").value("Please share this password securely with the user"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/admin/users/{userId}/reset-password should return 200 OK without password when newPassword is provided")
    void resetUserPassword_WithPassword_Success() throws Exception {
        // Arrange
        String newPassword = "MyNewPassword123!";
        when(userService.resetUserPassword(eq(1L), eq(newPassword))).thenReturn(newPassword);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users/1/reset-password")
                        .param("newPassword", newPassword)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User password reset successfully"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.newPassword").doesNotExist())
                .andExpect(jsonPath("$.note").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/admin/users/{userId}/reset-password should return 400 Bad Request on error")
    void resetUserPassword_BadRequest() throws Exception {
        // Arrange
        when(userService.resetUserPassword(eq(1L), any()))
                .thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        mockMvc.perform(post("/api/admin/users/1/reset-password")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/statistics should return 200 OK with statistics")
    void getUserStatistics_Success() throws Exception {
        // Arrange
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalUsers", 100L);
        statistics.put("activeUsers", 85L);
        statistics.put("usersByRole", Map.of(
            "CUSTOMER", 50L,
            "SC_STAFF", 20L,
            "SC_TECHNICIAN", 15L,
            "EVM_STAFF", 10L,
            "ADMIN", 5L
        ));

        when(userService.getUserStatistics()).thenReturn(statistics);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.activeUsers").value(85))
                .andExpect(jsonPath("$.usersByRole.CUSTOMER").value(50))
                .andExpect(jsonPath("$.usersByRole.ADMIN").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/statistics should return 400 Bad Request on error")
    void getUserStatistics_BadRequest() throws Exception {
        // Arrange
        when(userService.getUserStatistics())
                .thenThrow(new RuntimeException("Database connection failed"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/statistics"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Database connection failed"));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/admin/users/{userId}/reset-password should return 403 Forbidden for non-ADMIN")
    void resetUserPassword_Staff_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/admin/users/1/reset-password")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/admin/users/statistics should return 403 Forbidden for non-ADMIN")
    void getUserStatistics_Customer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/users/statistics"))
                .andExpect(status().isForbidden());
    }
}
