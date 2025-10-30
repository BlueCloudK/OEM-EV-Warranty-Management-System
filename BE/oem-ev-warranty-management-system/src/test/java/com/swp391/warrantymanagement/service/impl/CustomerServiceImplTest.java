package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CustomerServiceImpl
 * Using Mockito to mock dependencies
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer testCustomer;
    private User testUser;
    private Role testRole;
    private CustomerRequestDTO testRequestDTO;
    private UUID testCustomerId;
    private Long testUserId;

    @BeforeEach
    void setUp() {
        // Setup test data
        testCustomerId = UUID.randomUUID();
        testUserId = 1L;

        testRole = new Role();
        testRole.setRoleId(3L);
        testRole.setRoleName("CUSTOMER");

        testUser = new User();
        testUser.setUserId(testUserId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(testRole);

        testCustomer = new Customer();
        testCustomer.setCustomerId(testCustomerId);
        testCustomer.setName("Test Customer");
        testCustomer.setEmail("customer@example.com");
        testCustomer.setPhone("0123456789");
        testCustomer.setAddress("123 Test Street");
        testCustomer.setUser(testUser);

        testRequestDTO = new CustomerRequestDTO();
        testRequestDTO.setUserId(testUserId);
        testRequestDTO.setName("Test Customer");
        testRequestDTO.setEmail("customer@example.com");
        testRequestDTO.setPhone("0123456789");
        testRequestDTO.setAddress("123 Test Street");
    }

    @Test
    void getAllCustomersPage_WithoutSearch_ShouldReturnPagedCustomers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Customer> customers = Arrays.asList(testCustomer);
        Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);

        when(customerRepository.findAll(pageable)).thenReturn(customerPage);

        // Act
        PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("Test Customer", result.getContent().get(0).getName());
        verify(customerRepository, times(1)).findAll(pageable);
    }

    @Test
    void getAllCustomersPage_WithSearch_ShouldReturnFilteredCustomers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        String searchTerm = "Test";
        List<Customer> customers = Arrays.asList(testCustomer);
        Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);

        when(customerRepository.findByNameContainingIgnoreCase(searchTerm, pageable))
                .thenReturn(customerPage);

        // Act
        PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, searchTerm);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(customerRepository, times(1)).findByNameContainingIgnoreCase(searchTerm, pageable);
    }

    @Test
    void getCustomerById_WhenCustomerExists_ShouldReturnCustomer() {
        // Arrange
        when(customerRepository.findById(testCustomerId)).thenReturn(Optional.of(testCustomer));

        // Act
        CustomerResponseDTO result = customerService.getCustomerById(testCustomerId);

        // Assert
        assertNotNull(result);
        assertEquals(testCustomerId, result.getCustomerId());
        assertEquals("Test Customer", result.getName());
        assertEquals("customer@example.com", result.getEmail());
        verify(customerRepository, times(1)).findById(testCustomerId);
    }

    @Test
    void getCustomerById_WhenCustomerNotExists_ShouldReturnNull() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        CustomerResponseDTO result = customerService.getCustomerById(nonExistentId);

        // Assert
        assertNull(result);
        verify(customerRepository, times(1)).findById(nonExistentId);
    }

    @Test
    void createCustomer_WhenUserExists_ShouldCreateAndReturnCustomer() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // Act
        CustomerResponseDTO result = customerService.createCustomer(testRequestDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Test Customer", result.getName());
        verify(userRepository, times(1)).findById(testUserId);
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void createCustomer_WhenUserNotExists_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            customerService.createCustomer(testRequestDTO);
        });

        assertTrue(exception.getMessage().contains("User not found"));
        verify(userRepository, times(1)).findById(testUserId);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void updateCustomer_WhenCustomerExists_ShouldUpdateAndReturnCustomer() {
        // Arrange
        when(customerRepository.findById(testCustomerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        CustomerRequestDTO updateDTO = new CustomerRequestDTO();
        updateDTO.setName("Updated Customer");
        updateDTO.setEmail("updated@example.com");
        updateDTO.setPhone("0987654321");
        updateDTO.setAddress("456 New Street");

        // Act
        CustomerResponseDTO result = customerService.updateCustomer(testCustomerId, updateDTO);

        // Assert
        assertNotNull(result);
        verify(customerRepository, times(1)).findById(testCustomerId);
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void updateCustomer_WhenCustomerNotExists_ShouldReturnNull() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        CustomerResponseDTO result = customerService.updateCustomer(nonExistentId, testRequestDTO);

        // Assert
        assertNull(result);
        verify(customerRepository, times(1)).findById(nonExistentId);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void deleteCustomer_WhenCustomerExists_ShouldReturnTrue() {
        // Arrange
        when(customerRepository.existsById(testCustomerId)).thenReturn(true);
        doNothing().when(customerRepository).deleteById(testCustomerId);

        // Act
        boolean result = customerService.deleteCustomer(testCustomerId);

        // Assert
        assertTrue(result);
        verify(customerRepository, times(1)).existsById(testCustomerId);
        verify(customerRepository, times(1)).deleteById(testCustomerId);
    }

    @Test
    void deleteCustomer_WhenCustomerNotExists_ShouldReturnFalse() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerRepository.existsById(nonExistentId)).thenReturn(false);

        // Act
        boolean result = customerService.deleteCustomer(nonExistentId);

        // Assert
        assertFalse(result);
        verify(customerRepository, times(1)).existsById(nonExistentId);
        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void getCustomerByEmail_WhenCustomerExists_ShouldReturnCustomer() {
        // Arrange
        String email = "customer@example.com";
        when(customerRepository.findByEmail(email)).thenReturn(testCustomer);

        // Act
        CustomerResponseDTO result = customerService.getCustomerByEmail(email);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(customerRepository, times(1)).findByEmail(email);
    }

    @Test
    void getCustomerByEmail_WhenCustomerNotExists_ShouldReturnNull() {
        // Arrange
        String email = "nonexistent@example.com";
        when(customerRepository.findByEmail(email)).thenReturn(null);

        // Act
        CustomerResponseDTO result = customerService.getCustomerByEmail(email);

        // Assert
        assertNull(result);
        verify(customerRepository, times(1)).findByEmail(email);
    }

    @Test
    void getCustomerByPhone_WhenCustomerExists_ShouldReturnCustomer() {
        // Arrange
        String phone = "0123456789";
        when(customerRepository.findByPhone(phone)).thenReturn(testCustomer);

        // Act
        CustomerResponseDTO result = customerService.getCustomerByPhone(phone);

        // Assert
        assertNotNull(result);
        assertEquals(phone, result.getPhone());
        verify(customerRepository, times(1)).findByPhone(phone);
    }

    @Test
    void searchCustomersByName_ShouldReturnMatchingCustomers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        String name = "Test";
        List<Customer> customers = Arrays.asList(testCustomer);
        Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);

        when(customerRepository.findByNameContainingIgnoreCase(name, pageable))
                .thenReturn(customerPage);

        // Act
        PagedResponse<CustomerResponseDTO> result = customerService.searchCustomersByName(name, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(customerRepository, times(1)).findByNameContainingIgnoreCase(name, pageable);
    }
}
