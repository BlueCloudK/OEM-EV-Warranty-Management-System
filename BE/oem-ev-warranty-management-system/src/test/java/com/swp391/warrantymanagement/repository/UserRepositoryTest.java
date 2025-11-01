package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("UserRepository Integration Tests")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private Role testRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create and persist Role
        testRole = new Role();
        testRole.setRoleName("CUSTOMER");
        entityManager.persist(testRole);

        // Create and persist User
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setRole(testRole);
        entityManager.persist(testUser);

        // Create another user
        User anotherUser = new User();
        anotherUser.setUsername("admin");
        anotherUser.setEmail("admin@example.com");
        anotherUser.setPassword("admin123");
        anotherUser.setRole(testRole);
        entityManager.persist(anotherUser);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by username should return the correct user")
    void findByUsername_ShouldReturnCorrectUser() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("testuser");

        // Assert
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Find by email should return the correct user")
    void findByEmail_ShouldReturnCorrectUser() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        // Assert
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Exists by username should return true for existing username")
    void existsByUsername_ShouldReturnTrue() {
        // Act
        boolean exists = userRepository.existsByUsername("testuser");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Exists by username should return false for non-existent username")
    void existsByUsername_WithNonExistentUsername_ShouldReturnFalse() {
        // Act
        boolean exists = userRepository.existsByUsername("nonexistent");

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Exists by email should return true for existing email")
    void existsByEmail_ShouldReturnTrue() {
        // Act
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Find by role should return users with that role")
    void findByRole_ShouldReturnUsersWithRole() {
        // Act
        Page<User> users = userRepository.findByRole(testRole, PageRequest.of(0, 10));

        // Assert
        assertThat(users).isNotNull();
        assertThat(users.getTotalElements()).isEqualTo(2);
        assertThat(users.getContent()).extracting(User::getUsername)
                .containsExactlyInAnyOrder("testuser", "admin");
    }

    @Test
    @DisplayName("Find by non-existent email should return empty")
    void findByEmail_WithNonExistentEmail_ShouldReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Save user should persist successfully")
    void saveUser_ShouldPersistSuccessfully() {
        // Arrange
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("newpassword");
        newUser.setRole(testRole);

        // Act
        User savedUser = userRepository.save(newUser);

        // Assert
        assertThat(savedUser.getUserId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("newuser");
        assertThat(userRepository.findAll()).hasSize(3);
    }
}

