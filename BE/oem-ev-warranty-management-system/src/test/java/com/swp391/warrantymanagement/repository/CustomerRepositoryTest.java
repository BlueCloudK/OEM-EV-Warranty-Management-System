package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("CustomerRepository Integration Tests")
class CustomerRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CustomerRepository customerRepository;

    private User user1;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        // Create and persist Role first
        customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        // Create and persist User, linking to the Role
        user1 = new User();
        user1.setUsername("customeruser");
        user1.setEmail("customer@example.com");
        user1.setPassword("password"); // Password is required for User entity
        user1.setRole(customerRole);
        entityManager.persist(user1);

        // Create and persist Customer, linking to the User
        Customer customer1 = new Customer();
        customer1.setCustomerId(UUID.randomUUID()); // UUID is required for Customer
        customer1.setName("John Doe");
        customer1.setPhone("1234567890");
        customer1.setUser(user1);
        entityManager.persist(customer1);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by phone should return the correct customer")
    void findByPhone_ShouldReturnCorrectCustomer() {
        // Act
        Optional<Customer> foundCustomer = customerRepository.findByPhone("1234567890");

        // Assert
        assertThat(foundCustomer).isPresent();
        assertThat(foundCustomer.get().getName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Find by user should return the correct customer")
    void findByUser_ShouldReturnCorrectCustomer() {
        // Act
        Customer foundCustomer = customerRepository.findByUser(user1);

        // Assert
        assertThat(foundCustomer).isNotNull();
        assertThat(foundCustomer.getName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Exists by user ID should return true for existing user")
    void existsByUserUserId_ShouldReturnTrue() {
        // Act
        boolean exists = customerRepository.existsByUserUserId(user1.getUserId());

        // Assert
        assertThat(exists).isTrue();
    }
}
