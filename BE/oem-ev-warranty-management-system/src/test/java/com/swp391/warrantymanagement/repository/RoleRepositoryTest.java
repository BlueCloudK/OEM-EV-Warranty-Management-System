package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("RoleRepository Integration Tests")
class RoleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private RoleRepository roleRepository;

    private Role customerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        // Create and persist test roles
        customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        entityManager.persist(adminRole);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by role name should return the correct role")
    void findByRoleName_ShouldReturnCorrectRole() {
        // Act
        Optional<Role> foundRole = roleRepository.findByRoleName("CUSTOMER");

        // Assert
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getRoleName()).isEqualTo("CUSTOMER");
    }

    @Test
    @DisplayName("Find by non-existent role name should return empty")
    void findByRoleName_WithNonExistentName_ShouldReturnEmpty() {
        // Act
        Optional<Role> foundRole = roleRepository.findByRoleName("NON_EXISTENT");

        // Assert
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Save role should persist successfully")
    void saveRole_ShouldPersistSuccessfully() {
        // Arrange
        Role newRole = new Role();
        newRole.setRoleName("STAFF");

        // Act
        Role savedRole = roleRepository.save(newRole);

        // Assert
        assertThat(savedRole.getRoleId()).isNotNull();
        assertThat(savedRole.getRoleName()).isEqualTo("STAFF");
    }
}