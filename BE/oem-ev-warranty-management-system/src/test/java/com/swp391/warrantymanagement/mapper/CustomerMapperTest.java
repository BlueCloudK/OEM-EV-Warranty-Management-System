package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CustomerMapper
 */
class CustomerMapperTest {

    private Customer testCustomer;
    private User testUser;
    private Role testRole;
    private CustomerRequestDTO testRequestDTO;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        testCustomerId = UUID.randomUUID();

        testRole = new Role();
        testRole.setRoleId(3L);
        testRole.setRoleName("CUSTOMER");

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("user@example.com");
        testUser.setAddress("123 User Street");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setRole(testRole);

        testCustomer = new Customer();
        testCustomer.setCustomerId(testCustomerId);
        testCustomer.setName("Test Customer");
        testCustomer.setPhone("0123456789");
        testCustomer.setUser(testUser);

        testRequestDTO = new CustomerRequestDTO();
        testRequestDTO.setUserId(1L);
        testRequestDTO.setName("Test Customer");
        testRequestDTO.setPhone("0123456789");
        testRequestDTO.setEmail("customer@example.com");
        testRequestDTO.setAddress("456 Customer Street");
    }

    @Test
    void toEntity_WithValidRequestDTO_ShouldCreateEntity() {
        // Act
        Customer result = CustomerMapper.toEntity(testRequestDTO, testUser);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCustomerId());
        assertEquals("Test Customer", result.getName());
        assertEquals("0123456789", result.getPhone());
        assertEquals(testUser, result.getUser());
    }

    @Test
    void toEntity_WithNullRequestDTO_ShouldReturnNull() {
        // Act
        Customer result = CustomerMapper.toEntity(null, testUser);

        // Assert
        assertNull(result);
    }

    @Test
    void updateEntity_WithValidData_ShouldUpdateEntity() {
        // Arrange
        Customer existingCustomer = new Customer();
        existingCustomer.setCustomerId(testCustomerId);
        existingCustomer.setName("Old Name");
        existingCustomer.setPhone("0000000000");

        CustomerRequestDTO updateDTO = new CustomerRequestDTO();
        updateDTO.setName("Updated Name");
        updateDTO.setPhone("9999999999");

        // Act
        CustomerMapper.updateEntity(existingCustomer, updateDTO, testUser);

        // Assert
        assertEquals("Updated Name", existingCustomer.getName());
        assertEquals("9999999999", existingCustomer.getPhone());
        assertEquals(testUser, existingCustomer.getUser());
    }

    @Test
    void updateEntity_WithNullEntity_ShouldDoNothing() {
        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> {
            CustomerMapper.updateEntity(null, testRequestDTO, testUser);
        });
    }

    @Test
    void updateEntity_WithNullRequestDTO_ShouldDoNothing() {
        // Arrange
        Customer existingCustomer = new Customer();
        existingCustomer.setName("Original Name");

        // Act
        CustomerMapper.updateEntity(existingCustomer, null, testUser);

        // Assert
        assertEquals("Original Name", existingCustomer.getName());
    }

    @Test
    void toResponseDTO_WithValidEntity_ShouldCreateResponseDTO() {
        // Act
        CustomerResponseDTO result = CustomerMapper.toResponseDTO(testCustomer);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomerId, result.getCustomerId());
        assertEquals("Test Customer", result.getName());
        assertEquals("0123456789", result.getPhone());
        assertEquals(1L, result.getUserId());
        assertEquals("testuser", result.getUsername());
        assertEquals("user@example.com", result.getEmail());
        assertEquals("123 User Street", result.getAddress());
        assertNotNull(result.getCreatedAt());
    }

    @Test
    void toResponseDTO_WithEntityWithoutUser_ShouldCreateResponseDTOWithoutUserData() {
        // Arrange
        Customer customerWithoutUser = new Customer();
        customerWithoutUser.setCustomerId(testCustomerId);
        customerWithoutUser.setName("Test Customer");
        customerWithoutUser.setPhone("0123456789");
        customerWithoutUser.setUser(null);

        // Act
        CustomerResponseDTO result = CustomerMapper.toResponseDTO(customerWithoutUser);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomerId, result.getCustomerId());
        assertEquals("Test Customer", result.getName());
        assertEquals("0123456789", result.getPhone());
        assertNull(result.getUserId());
        assertNull(result.getUsername());
        assertNull(result.getEmail());
        assertNull(result.getAddress());
    }

    @Test
    void toResponseDTO_WithNullEntity_ShouldReturnNull() {
        // Act
        CustomerResponseDTO result = CustomerMapper.toResponseDTO(null);

        // Assert
        assertNull(result);
    }

    @Test
    void toResponseDTOList_WithValidList_ShouldConvertAllEntities() {
        // Arrange
        Customer customer2 = new Customer();
        customer2.setCustomerId(UUID.randomUUID());
        customer2.setName("Second Customer");
        customer2.setPhone("0987654321");
        customer2.setUser(testUser);

        List<Customer> customers = Arrays.asList(testCustomer, customer2);

        // Act
        List<CustomerResponseDTO> result = CustomerMapper.toResponseDTOList(customers);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test Customer", result.get(0).getName());
        assertEquals("Second Customer", result.get(1).getName());
    }

    @Test
    void toResponseDTOList_WithEmptyList_ShouldReturnEmptyList() {
        // Arrange
        List<Customer> emptyList = Arrays.asList();

        // Act
        List<CustomerResponseDTO> result = CustomerMapper.toResponseDTOList(emptyList);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void toResponseDTOList_WithNullList_ShouldReturnNull() {
        // Act
        List<CustomerResponseDTO> result = CustomerMapper.toResponseDTOList(null);

        // Assert
        assertNull(result);
    }

    @Test
    void toEntity_ShouldGenerateNewUUID() {
        // Act
        Customer entity1 = CustomerMapper.toEntity(testRequestDTO, testUser);
        Customer entity2 = CustomerMapper.toEntity(testRequestDTO, testUser);

        // Assert
        assertNotNull(entity1.getCustomerId());
        assertNotNull(entity2.getCustomerId());
        assertNotEquals(entity1.getCustomerId(), entity2.getCustomerId());
    }
}
