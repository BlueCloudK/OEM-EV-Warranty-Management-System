package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private com.swp391.warrantymanagement.repository.WarrantyClaimRepository warrantyClaimRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
    }

    @Nested
    @DisplayName("Update User Role")
    class UpdateUserRole {

        @Test
        @DisplayName("Should update user role successfully")
        void updateUserRole_Success() {
            // Arrange
            Long userId = 1L;
            Long newRoleId = 2L;
            Role newRole = new Role();
            newRole.setRoleId(newRoleId);
            newRole.setRoleName("ADMIN");

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(roleRepository.findById(newRoleId)).thenReturn(Optional.of(newRole));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            User updatedUser = userService.updateUserRole(userId, newRoleId);

            // Assert
            assertThat(updatedUser.getRole()).isEqualTo(newRole);
            verify(userRepository).findById(userId);
            verify(roleRepository).findById(newRoleId);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void updateUserRole_UserNotFound_ThrowsException() {
            // Arrange
            Long nonExistentUserId = 999L;
            when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> userService.updateUserRole(nonExistentUserId, 2L));
            assertThat(exception.getMessage()).isEqualTo("User not found with id: " + nonExistentUserId);
            verify(roleRepository, never()).findById(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when role not found")
        void updateUserRole_RoleNotFound_ThrowsException() {
            // Arrange
            Long userId = 1L;
            Long nonExistentRoleId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(roleRepository.findById(nonExistentRoleId)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> userService.updateUserRole(userId, nonExistentRoleId));
            assertThat(exception.getMessage()).isEqualTo("Role not found with id: " + nonExistentRoleId);
            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Delete User")
    class DeleteUser {

        @Test
        @DisplayName("Should delete user and their tokens successfully")
        void deleteUser_Success() {
            // Arrange
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            doNothing().when(tokenRepository).deleteByUser(user);
            doNothing().when(userRepository).delete(user);

            // Act
            userService.deleteUser(userId);

            // Assert
            verify(tokenRepository).deleteByUser(user);
            verify(userRepository).delete(user);
        }
    }

    @Nested
    @DisplayName("Reset User Password")
    class ResetUserPassword {

        @Test
        @DisplayName("Should reset password with custom password")
        void resetPassword_WithCustomPassword_Success() {
            // Arrange
            Long userId = 1L;
            String newPassword = "NewPassword123!";
            String encodedPassword = "encodedNewPassword123";

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            String result = userService.resetUserPassword(userId, newPassword);

            // Assert
            assertThat(result).isEqualTo(newPassword);
            assertThat(user.getPassword()).isEqualTo(encodedPassword);
            verify(passwordEncoder).encode(newPassword);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should generate random password when custom password is null")
        void resetPassword_WithNullPassword_GeneratesRandom() {
            // Arrange
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(anyString())).thenReturn("encodedRandomPassword");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            String result = userService.resetUserPassword(userId, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.length()).isEqualTo(12); // Random password length
            verify(passwordEncoder).encode(anyString());
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should generate random password when custom password is empty")
        void resetPassword_WithEmptyPassword_GeneratesRandom() {
            // Arrange
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(anyString())).thenReturn("encodedRandomPassword");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            String result = userService.resetUserPassword(userId, "   ");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.length()).isEqualTo(12);
            verify(passwordEncoder).encode(anyString());
        }
    }

    @Nested
    @DisplayName("Get All Users - Filter Logic")
    class GetAllUsersFilters {

        private Pageable pageable;
        private Role adminRole;

        @BeforeEach
        void setUp() {
            pageable = PageRequest.of(0, 10);
            adminRole = new Role();
            adminRole.setRoleId(1L);
            adminRole.setRoleName("ADMIN");
        }

        @Test
        @DisplayName("Should get all users without any filter")
        void getAllUsers_NoFilter_Success() {
            // Arrange
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(userRepository.findAll(any(Pageable.class))).thenReturn(userPage);

            // Act
            Page<User> result = userService.getAllUsers(pageable, null, null);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter by search only")
        void getAllUsers_SearchOnly_Success() {
            // Arrange
            String search = "testuser";
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(userRepository.findByUsernameContainingIgnoreCase(eq(search), any(Pageable.class)))
                .thenReturn(userPage);

            // Act
            Page<User> result = userService.getAllUsers(pageable, search, null);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findByUsernameContainingIgnoreCase(eq(search), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter by role only")
        void getAllUsers_RoleOnly_Success() {
            // Arrange
            String roleName = "ADMIN";
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(roleRepository.findByRoleName(roleName)).thenReturn(Optional.of(adminRole));
            when(userRepository.findByRole(eq(adminRole), any(Pageable.class))).thenReturn(userPage);

            // Act
            Page<User> result = userService.getAllUsers(pageable, null, roleName);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(roleRepository).findByRoleName(roleName);
            verify(userRepository).findByRole(eq(adminRole), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter by both search and role")
        void getAllUsers_SearchAndRole_Success() {
            // Arrange
            String search = "testuser";
            String roleName = "ADMIN";
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(roleRepository.findByRoleName(roleName)).thenReturn(Optional.of(adminRole));
            when(userRepository.findByRole(eq(adminRole), any(Pageable.class))).thenReturn(userPage);

            // Act
            Page<User> result = userService.getAllUsers(pageable, search, roleName);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(roleRepository).findByRoleName(roleName);
            verify(userRepository).findByRole(eq(adminRole), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw exception when role not found")
        void getAllUsers_RoleNotFound_ThrowsException() {
            // Arrange
            String roleName = "INVALID_ROLE";
            when(roleRepository.findByRoleName(roleName)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getAllUsers(pageable, null, roleName));
            assertThat(exception.getMessage()).contains("Role not found");
        }

        @Test
        @DisplayName("Should filter by search with empty role string")
        void getAllUsers_SearchWithEmptyRole_Success() {
            // Arrange
            String search = "testuser";
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(userRepository.findByUsernameContainingIgnoreCase(eq(search), any(Pageable.class)))
                .thenReturn(userPage);

            // Act
            Page<User> result = userService.getAllUsers(pageable, search, "   ");

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findByUsernameContainingIgnoreCase(eq(search), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Search By Username - Validation")
    class SearchByUsername {

        @Test
        @DisplayName("Should search users by username successfully")
        void searchByUsername_Success() {
            // Arrange
            String username = "testuser";
            Pageable pageable = PageRequest.of(0, 10);
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(userRepository.findByUsernameContainingIgnoreCase(eq(username), any(Pageable.class)))
                .thenReturn(userPage);

            // Act
            Page<User> result = userService.searchByUsername(username, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findByUsernameContainingIgnoreCase(eq(username), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw exception when username is null")
        void searchByUsername_NullUsername_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.searchByUsername(null, pageable));
            assertThat(exception.getMessage()).contains("Username search parameter cannot be empty");
        }

        @Test
        @DisplayName("Should throw exception when username is empty")
        void searchByUsername_EmptyUsername_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.searchByUsername("   ", pageable));
            assertThat(exception.getMessage()).contains("Username search parameter cannot be empty");
        }
    }

    @Nested
    @DisplayName("Get Users By Role - Validation")
    class GetUsersByRole {

        private Role adminRole;

        @BeforeEach
        void setUp() {
            adminRole = new Role();
            adminRole.setRoleId(1L);
            adminRole.setRoleName("ADMIN");
        }

        @Test
        @DisplayName("Should get users by role successfully")
        void getUsersByRole_Success() {
            // Arrange
            String roleName = "ADMIN";
            Pageable pageable = PageRequest.of(0, 10);
            Page<User> userPage = new PageImpl<>(List.of(user));
            when(roleRepository.findByRoleName(roleName)).thenReturn(Optional.of(adminRole));
            when(userRepository.findByRole(eq(adminRole), any(Pageable.class))).thenReturn(userPage);

            // Act
            Page<User> result = userService.getUsersByRole(roleName, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(roleRepository).findByRoleName(roleName);
            verify(userRepository).findByRole(eq(adminRole), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw exception when role name is null")
        void getUsersByRole_NullRoleName_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUsersByRole(null, pageable));
            assertThat(exception.getMessage()).contains("Role name cannot be empty");
        }

        @Test
        @DisplayName("Should throw exception when role name is empty")
        void getUsersByRole_EmptyRoleName_ThrowsException() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUsersByRole("   ", pageable));
            assertThat(exception.getMessage()).contains("Role name cannot be empty");
        }

        @Test
        @DisplayName("Should throw exception when role not found")
        void getUsersByRole_RoleNotFound_ThrowsException() {
            // Arrange
            String roleName = "INVALID_ROLE";
            Pageable pageable = PageRequest.of(0, 10);
            when(roleRepository.findByRoleName(roleName)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUsersByRole(roleName, pageable));
            assertThat(exception.getMessage()).contains("Role not found");
        }
    }

    @Nested
    @DisplayName("Update User - Multiple Fields")
    class UpdateUser {

        @Test
        @DisplayName("Should update username successfully")
        void updateUser_UpdateUsername_Success() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("username", "newusername");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByUsername("newusername")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getUsername()).isEqualTo("newusername");
            verify(userRepository).existsByUsername("newusername");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception when username already exists")
        void updateUser_DuplicateUsername_ThrowsException() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("username", "existinguser");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByUsername("existinguser")).thenReturn(true);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUser(1L, updateRequest));
            assertThat(exception.getMessage()).contains("Username already exists");
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update email successfully")
        void updateUser_UpdateEmail_Success() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("email", "newemail@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getEmail()).isEqualTo("newemail@example.com");
            verify(userRepository).existsByEmail("newemail@example.com");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void updateUser_DuplicateEmail_ThrowsException() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("email", "existing@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUser(1L, updateRequest));
            assertThat(exception.getMessage()).contains("Email already exists");
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update address successfully")
        void updateUser_UpdateAddress_Success() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("address", "New Address 123");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getAddress()).isEqualTo("New Address 123");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should update multiple fields at once")
        void updateUser_MultipleFields_Success() {
            // Arrange
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("username", "newusername");
            updateRequest.put("email", "newemail@example.com");
            updateRequest.put("address", "New Address");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByUsername("newusername")).thenReturn(false);
            when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getUsername()).isEqualTo("newusername");
            assertThat(result.getEmail()).isEqualTo("newemail@example.com");
            assertThat(result.getAddress()).isEqualTo("New Address");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should allow same username for the same user")
        void updateUser_SameUsername_Success() {
            // Arrange
            user.setUsername("testuser");
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("username", "testuser");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByUsername("testuser")).thenReturn(true);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getUsername()).isEqualTo("testuser");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should allow same email for the same user")
        void updateUser_SameEmail_Success() {
            // Arrange
            user.setEmail("test@example.com");
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("email", "test@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            User result = userService.updateUser(1L, updateRequest);

            // Assert
            assertThat(result.getEmail()).isEqualTo("test@example.com");
            verify(userRepository).save(user);
        }
    }

    @Nested
    @DisplayName("Get User By ID")
    class GetUserById {

        @Test
        @DisplayName("Should get user by id successfully")
        void getUserById_Success() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            // Act
            User result = userService.getUserById(1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1L);
            verify(userRepository).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getUserById_NotFound_ThrowsException() {
            // Arrange
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUserById(999L));
            assertThat(exception.getMessage()).contains("User not found");
        }
    }

    @Nested
    @DisplayName("Get User Statistics")
    class GetUserStatistics {

        @Test
        @DisplayName("Should get user statistics successfully")
        void getUserStatistics_Success() {
            // Arrange
            Role adminRole = new Role();
            adminRole.setRoleName("ADMIN");
            Role userRole = new Role();
            userRole.setRoleName("USER");

            // Set role for user to avoid NullPointerException
            user.setRole(userRole);

            when(userRepository.count()).thenReturn(10L);
            when(roleRepository.findAll()).thenReturn(List.of(adminRole, userRole));
            when(userRepository.countByRole(adminRole)).thenReturn(2L);
            when(userRepository.countByRole(userRole)).thenReturn(8L);

            Page<User> recentUsers = new PageImpl<>(List.of(user));
            when(userRepository.findAll(any(Pageable.class))).thenReturn(recentUsers);

            // Act
            Map<String, Object> stats = userService.getUserStatistics();

            // Assert
            assertThat(stats.get("totalUsers")).isEqualTo(10L);
            assertThat(stats).containsKey("usersByRole");
            assertThat(stats).containsKey("recentRegistrations");
            verify(userRepository).count();
            verify(roleRepository).findAll();
        }

        @Test
        @DisplayName("Should reset password with a given new password")
        void resetUserPassword_WithProvidedPassword() {
            // Arrange
            Long userId = 1L;
            String newPassword = "newStrongPassword123";
            String encodedNewPassword = "encodedNewStrongPassword123";

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);

            // Act
            String returnedPassword = userService.resetUserPassword(userId, newPassword);

            // Assert
            assertThat(returnedPassword).isEqualTo(newPassword);
            assertThat(user.getPassword()).isEqualTo(encodedNewPassword);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should generate a random password when none is provided")
        void resetUserPassword_WithGeneratedPassword() {
            // Arrange
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "encoded_" + invocation.getArgument(0));

            // Act
            String returnedPassword = userService.resetUserPassword(userId, null);

            // Assert
            assertThat(returnedPassword).isNotNull();
            assertThat(returnedPassword.length()).isEqualTo(12);
            assertThat(user.getPassword()).isEqualTo("encoded_" + returnedPassword);
            verify(userRepository).save(user);
        }
    }

    @Nested
    @DisplayName("Get User Full Profile")
    class GetUserFullProfile {

        @Test
        @DisplayName("Should return full user profile")
        void getUserFullProfile_Success() {
            // Arrange
            Long userId = 1L;
            Role role = new Role();
            role.setRoleId(1L);
            role.setRoleName("EVM_STAFF");

            user.setRole(role);
            user.setAddress("123 Test Street");

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(warrantyClaimRepository.findByAssignedToUserId(eq(userId), any(Pageable.class)))
                .thenReturn(Page.empty());

            // Act
            UserProfileResponseDTO result = userService.getUserFullProfile(userId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(userId);
            assertThat(result.getUsername()).isEqualTo("testuser");
            assertThat(result.getEmail()).isEqualTo("test@example.com");
            assertThat(result.getRoleName()).isEqualTo("EVM_STAFF");
            assertThat(result.getRoleId()).isEqualTo(1L);
            verify(userRepository).findById(userId);
            verify(warrantyClaimRepository).findByAssignedToUserId(eq(userId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void getUserFullProfile_NotFound_ThrowsException() {
            // Arrange
            Long userId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUserFullProfile(userId));
            assertThat(exception.getMessage()).contains("User not found");
            verify(userRepository).findById(userId);
        }
    }
}
