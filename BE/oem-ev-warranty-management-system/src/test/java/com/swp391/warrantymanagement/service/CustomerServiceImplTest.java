package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.CustomerProfileResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Feedback;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.impl.CustomerServiceImpl;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService Unit Tests")
class CustomerServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private User user;
    private CustomerRequestDTO customerRequestDTO;
    private Role customerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        customerRole = new Role();
        customerRole.setRoleId(1L);
        customerRole.setRoleName("CUSTOMER");

        adminRole = new Role();
        adminRole.setRoleId(2L);
        adminRole.setRoleName("ADMIN");

        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setAddress("123 Test St");
        user.setPassword("password");
        user.setRole(customerRole);
        user.setCreatedAt(LocalDateTime.now()); // Initialize createdAt

        customerRequestDTO = new CustomerRequestDTO();
        customerRequestDTO.setUserId(1L);
        customerRequestDTO.setName("Test Customer");
        customerRequestDTO.setPhone("1234567890");
    }

    @Nested
    @DisplayName("Create Customer")
    class CreateCustomer {

        @Test
        @DisplayName("Should create customer successfully when created by ADMIN")
        void createCustomer_ByAdmin_Success() {
            // Arrange
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setRole(adminRole);
            adminUser.setCreatedAt(LocalDateTime.now());

            Customer savedCustomer = new Customer();
            savedCustomer.setCustomerId(UUID.randomUUID());
            savedCustomer.setName(customerRequestDTO.getName());
            savedCustomer.setPhone(customerRequestDTO.getPhone());
            savedCustomer.setUser(user);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.getName()).thenReturn("admin");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

            // Act
            CustomerResponseDTO result = customerService.createCustomer(customerRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Test Customer");
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Should throw exception when created by a CUSTOMER")
        void createCustomer_ByCustomer_ThrowsException() {
            // Arrange
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.getName()).thenReturn("testuser");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user)); // Current user is a CUSTOMER

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("Only ADMIN or STAFF can create customer records");
        }

        @Test
        @DisplayName("Should throw exception when phone number already exists")
        void createCustomer_DuplicatePhone_ThrowsException() {
            // Arrange
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setRole(adminRole);
            adminUser.setCreatedAt(LocalDateTime.now());

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.getName()).thenReturn("admin");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.of(new Customer())); // Phone exists

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).isEqualTo("Phone number already exists: 1234567890");
        }

        @Test
        @DisplayName("Should throw exception when user for customer record is not found")
        void createCustomer_UserNotFound_ThrowsException() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).isEqualTo("User not found with id: 1");
        }

        @Test
        @DisplayName("Should throw exception when user registration is incomplete - no username")
        void createCustomer_IncompleteUserNoUsername_ThrowsException() {
            // Arrange
            User incompleteUser = new User();
            incompleteUser.setUserId(1L);
            incompleteUser.setUsername(""); // Empty username
            incompleteUser.setEmail("test@example.com");
            incompleteUser.setAddress("123 Test St");
            incompleteUser.setPassword("password");
            incompleteUser.setRole(customerRole);

            when(userRepository.findById(1L)).thenReturn(Optional.of(incompleteUser));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("username is required");
        }

        @Test
        @DisplayName("Should throw exception when user registration is incomplete - no email")
        void createCustomer_IncompleteUserNoEmail_ThrowsException() {
            // Arrange
            User incompleteUser = new User();
            incompleteUser.setUserId(1L);
            incompleteUser.setUsername("testuser");
            incompleteUser.setEmail(""); // Empty email
            incompleteUser.setAddress("123 Test St");
            incompleteUser.setPassword("password");
            incompleteUser.setRole(customerRole);

            when(userRepository.findById(1L)).thenReturn(Optional.of(incompleteUser));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("email is required");
        }

        @Test
        @DisplayName("Should throw exception when user registration is incomplete - no address")
        void createCustomer_IncompleteUserNoAddress_ThrowsException() {
            // Arrange
            User incompleteUser = new User();
            incompleteUser.setUserId(1L);
            incompleteUser.setUsername("testuser");
            incompleteUser.setEmail("test@example.com");
            incompleteUser.setAddress(""); // Empty address
            incompleteUser.setPassword("password");
            incompleteUser.setRole(customerRole);

            when(userRepository.findById(1L)).thenReturn(Optional.of(incompleteUser));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("address is required");
        }

        @Test
        @DisplayName("Should throw exception when user registration is incomplete - no role")
        void createCustomer_IncompleteUserNoRole_ThrowsException() {
            // Arrange
            User incompleteUser = new User();
            incompleteUser.setUserId(1L);
            incompleteUser.setUsername("testuser");
            incompleteUser.setEmail("test@example.com");
            incompleteUser.setAddress("123 Test St");
            incompleteUser.setPassword("password");
            incompleteUser.setRole(null); // No role

            when(userRepository.findById(1L)).thenReturn(Optional.of(incompleteUser));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("role is required");
        }

        @Test
        @DisplayName("Should throw exception when user registration is incomplete - no password")
        void createCustomer_IncompleteUserNoPassword_ThrowsException() {
            // Arrange
            User incompleteUser = new User();
            incompleteUser.setUserId(1L);
            incompleteUser.setUsername("testuser");
            incompleteUser.setEmail("test@example.com");
            incompleteUser.setAddress("123 Test St");
            incompleteUser.setPassword(""); // Empty password
            incompleteUser.setRole(customerRole);

            when(userRepository.findById(1L)).thenReturn(Optional.of(incompleteUser));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> customerService.createCustomer(customerRequestDTO));
            assertThat(exception.getMessage()).contains("password is required");
        }

        @Test
        @DisplayName("Should create customer successfully when created by SC_STAFF")
        void createCustomer_ByScStaff_Success() {
            // Arrange
            Role scStaffRole = new Role();
            scStaffRole.setRoleId(3L);
            scStaffRole.setRoleName("SC_STAFF");

            User scStaffUser = new User();
            scStaffUser.setUsername("scstaff");
            scStaffUser.setRole(scStaffRole);
            scStaffUser.setCreatedAt(LocalDateTime.now());

            Customer savedCustomer = new Customer();
            savedCustomer.setCustomerId(UUID.randomUUID());
            savedCustomer.setName(customerRequestDTO.getName());
            savedCustomer.setPhone(customerRequestDTO.getPhone());
            savedCustomer.setUser(user);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.getName()).thenReturn("scstaff");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.findByUsername("scstaff")).thenReturn(Optional.of(scStaffUser));
            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

            // Act
            CustomerResponseDTO result = customerService.createCustomer(customerRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Should create customer successfully when created by EVM_STAFF")
        void createCustomer_ByEvmStaff_Success() {
            // Arrange
            Role evmStaffRole = new Role();
            evmStaffRole.setRoleId(4L);
            evmStaffRole.setRoleName("EVM_STAFF");

            User evmStaffUser = new User();
            evmStaffUser.setUsername("evmstaff");
            evmStaffUser.setRole(evmStaffRole);
            evmStaffUser.setCreatedAt(LocalDateTime.now());

            Customer savedCustomer = new Customer();
            savedCustomer.setCustomerId(UUID.randomUUID());
            savedCustomer.setName(customerRequestDTO.getName());
            savedCustomer.setPhone(customerRequestDTO.getPhone());
            savedCustomer.setUser(user);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);
            when(authentication.getName()).thenReturn("evmstaff");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(evmStaffUser));
            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

            // Act
            CustomerResponseDTO result = customerService.createCustomer(customerRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
        }
    }

    @Nested
    @DisplayName("Get Customer By ID")
    class GetCustomerById {

        @Test
        @DisplayName("Should return customer when found")
        void getCustomerById_Found_ReturnsCustomer() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            Customer customer = new Customer();
            customer.setCustomerId(customerId);
            customer.setName("Test Customer");
            customer.setPhone("1234567890");
            customer.setUser(user);

            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

            // Act
            CustomerResponseDTO result = customerService.getCustomerById(customerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Test Customer");
            verify(customerRepository).findById(customerId);
        }

        @Test
        @DisplayName("Should return null when customer not found")
        void getCustomerById_NotFound_ReturnsNull() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

            // Act
            CustomerResponseDTO result = customerService.getCustomerById(customerId);

            // Assert
            assertThat(result).isNull();
            verify(customerRepository).findById(customerId);
        }
    }

    @Nested
    @DisplayName("Update Customer")
    class UpdateCustomer {

        @Test
        @DisplayName("Should update customer successfully")
        void updateCustomer_Success() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(customerId);
            existingCustomer.setName("Old Name");
            existingCustomer.setPhone("0000000000");
            existingCustomer.setUser(user);

            customerRequestDTO.setName("New Name");
            customerRequestDTO.setPhone("1111111111");

            when(customerRepository.findById(customerId)).thenReturn(Optional.of(existingCustomer));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

            // Act
            CustomerResponseDTO result = customerService.updateCustomer(customerId, customerRequestDTO);

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(userRepository).findById(1L);
        }

        @Test
        @DisplayName("Should return null when customer not found")
        void updateCustomer_NotFound_ReturnsNull() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

            // Act
            CustomerResponseDTO result = customerService.updateCustomer(customerId, customerRequestDTO);

            // Assert
            assertThat(result).isNull();
            verify(customerRepository, never()).save(any(Customer.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void updateCustomer_UserNotFound_ThrowsException() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(customerId);
            existingCustomer.setUser(user);

            when(customerRepository.findById(customerId)).thenReturn(Optional.of(existingCustomer));
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomer(customerId, customerRequestDTO));
            assertThat(exception.getMessage()).contains("User not found with id: 1");
        }
    }

    @Nested
    @DisplayName("Delete Customer")
    class DeleteCustomer {

        @Test
        @DisplayName("Should delete customer successfully when exists")
        void deleteCustomer_Exists_ReturnsTrue() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            when(customerRepository.existsById(customerId)).thenReturn(true);
            doNothing().when(customerRepository).deleteById(customerId);

            // Act
            boolean result = customerService.deleteCustomer(customerId);

            // Assert
            assertThat(result).isTrue();
            verify(customerRepository).deleteById(customerId);
        }

        @Test
        @DisplayName("Should return false when customer does not exist")
        void deleteCustomer_NotExists_ReturnsFalse() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            when(customerRepository.existsById(customerId)).thenReturn(false);

            // Act
            boolean result = customerService.deleteCustomer(customerId);

            // Assert
            assertThat(result).isFalse();
            verify(customerRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Get Customer By Email")
    class GetCustomerByEmail {

        @Test
        @DisplayName("Should return customer when user with email exists")
        void getCustomerByEmail_UserExists_ReturnsCustomer() {
            // Arrange
            Customer customer = new Customer();
            customer.setCustomerId(UUID.randomUUID());
            customer.setName("Test Customer");
            customer.setUser(user);

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(customerRepository.findByUser(user)).thenReturn(customer);

            // Act
            CustomerResponseDTO result = customerService.getCustomerByEmail("test@example.com");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Test Customer");
        }

        @Test
        @DisplayName("Should return null when user not found")
        void getCustomerByEmail_UserNotFound_ReturnsNull() {
            // Arrange
            when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

            // Act
            CustomerResponseDTO result = customerService.getCustomerByEmail("notfound@example.com");

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when user exists but customer not found")
        void getCustomerByEmail_CustomerNotFound_ReturnsNull() {
            // Arrange
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(customerRepository.findByUser(user)).thenReturn(null);

            // Act
            CustomerResponseDTO result = customerService.getCustomerByEmail("test@example.com");

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("Get Customer By Phone")
    class GetCustomerByPhone {

        @Test
        @DisplayName("Should return customer when phone exists")
        void getCustomerByPhone_Exists_ReturnsCustomer() {
            // Arrange
            Customer customer = new Customer();
            customer.setCustomerId(UUID.randomUUID());
            customer.setName("Test Customer");
            customer.setPhone("1234567890");
            customer.setUser(user);

            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.of(customer));

            // Act
            CustomerResponseDTO result = customerService.getCustomerByPhone("1234567890");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPhone()).isEqualTo("1234567890");
        }

        @Test
        @DisplayName("Should return null when phone not found")
        void getCustomerByPhone_NotFound_ReturnsNull() {
            // Arrange
            when(customerRepository.findByPhone("0000000000")).thenReturn(Optional.empty());

            // Act
            CustomerResponseDTO result = customerService.getCustomerByPhone("0000000000");

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("Get All Customers Page")
    class GetAllCustomersPage {

        @Test
        @DisplayName("Should return paginated customers without search")
        void getAllCustomersPage_NoSearch_ReturnsPaginatedCustomers() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer1 = new Customer();
            customer1.setCustomerId(UUID.randomUUID());
            customer1.setName("Customer 1");
            customer1.setUser(user);
            customers.add(customer1);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findAll(pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(customerRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return all customers with empty search string")
        void getAllCustomersPage_EmptySearch_ReturnsAll() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer1 = new Customer();
            customer1.setCustomerId(UUID.randomUUID());
            customer1.setName("Customer 1");
            customer1.setUser(user);
            customers.add(customer1);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findAll(pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, "");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(customerRepository).findAll(pageable);
            verify(customerRepository, never()).findByNameContainingIgnoreCase(anyString(), any());
        }

        @Test
        @DisplayName("Should return all customers with whitespace search string")
        void getAllCustomersPage_WhitespaceSearch_ReturnsAll() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer1 = new Customer();
            customer1.setCustomerId(UUID.randomUUID());
            customer1.setName("Customer 1");
            customer1.setUser(user);
            customers.add(customer1);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findAll(pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, "   ");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(customerRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return paginated customers with search")
        void getAllCustomersPage_WithSearch_ReturnsFilteredCustomers() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer1 = new Customer();
            customer1.setCustomerId(UUID.randomUUID());
            customer1.setName("John Doe");
            customer1.setUser(user);
            customers.add(customer1);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findByNameContainingIgnoreCase("John", pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, "John");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(customerRepository).findByNameContainingIgnoreCase("John", pageable);
            verify(customerRepository, never()).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no customers found")
        void getAllCustomersPage_NoCustomers_ReturnsEmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Customer> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(customerRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getAllCustomersPage(pageable, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Search Customers By Name")
    class SearchCustomersByName {

        @Test
        @DisplayName("Should return customers matching search term")
        void searchCustomersByName_MatchingCustomers_ReturnsResults() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer = new Customer();
            customer.setCustomerId(UUID.randomUUID());
            customer.setName("John Smith");
            customer.setUser(user);
            customers.add(customer);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findByNameContainingIgnoreCase("Smith", pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.searchCustomersByName("Smith", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).contains("Smith");
            verify(customerRepository).findByNameContainingIgnoreCase("Smith", pageable);
        }

        @Test
        @DisplayName("Should return empty page when no matches found")
        void searchCustomersByName_NoMatches_ReturnsEmptyPage() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Customer> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(customerRepository.findByNameContainingIgnoreCase("NonExistent", pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.searchCustomersByName("NonExistent", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Customers By User ID")
    class GetCustomersByUserId {

        @Test
        @DisplayName("Should return customers for valid user ID")
        void getCustomersByUserId_ValidUserId_ReturnsCustomers() {
            // Arrange
            Long userId = 1L;
            Pageable pageable = PageRequest.of(0, 10);
            List<Customer> customers = new ArrayList<>();
            Customer customer = new Customer();
            customer.setCustomerId(UUID.randomUUID());
            customer.setName("Test Customer");
            customer.setUser(user);
            customers.add(customer);

            Page<Customer> customerPage = new PageImpl<>(customers, pageable, 1);
            when(customerRepository.findByUserUserId(userId, pageable)).thenReturn(customerPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getCustomersByUserId(userId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(customerRepository).findByUserUserId(userId, pageable);
        }

        @Test
        @DisplayName("Should return empty page when user has no customers")
        void getCustomersByUserId_NoCustomers_ReturnsEmptyPage() {
            // Arrange
            Long userId = 999L;
            Pageable pageable = PageRequest.of(0, 10);
            Page<Customer> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            when(customerRepository.findByUserUserId(userId, pageable)).thenReturn(emptyPage);

            // Act
            PagedResponse<CustomerResponseDTO> result = customerService.getCustomersByUserId(userId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Update Customer Profile")
    class UpdateCustomerProfile {

        @Test
        @DisplayName("Should update customer profile successfully")
        void updateCustomerProfile_Success() {
            // Arrange
            customerRequestDTO.setName("Updated Name");
            customerRequestDTO.setPhone("9876543210");
            customerRequestDTO.setAddress("New Address");

            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(UUID.randomUUID());
            existingCustomer.setName("Old Name");
            existingCustomer.setPhone("1234567890");
            existingCustomer.setUser(user);

            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(customerPage);
            when(customerRepository.findByPhone("9876543210")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

            // Act
            CustomerResponseDTO result = customerService.updateCustomerProfile(customerRequestDTO, "Bearer token");

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void updateCustomerProfile_UserNotFound_ThrowsException() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomerProfile(customerRequestDTO, "Bearer token"));
            assertThat(exception.getMessage()).isEqualTo("User not found");
        }

        @Test
        @DisplayName("Should throw exception when user is not CUSTOMER role")
        void updateCustomerProfile_NotCustomerRole_ThrowsException() {
            // Arrange
            user.setRole(adminRole);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomerProfile(customerRequestDTO, "Bearer token"));
            assertThat(exception.getMessage()).isEqualTo("Only customers can update their own profile");
        }

        @Test
        @DisplayName("Should throw exception when customer profile not found")
        void updateCustomerProfile_ProfileNotFound_ThrowsException() {
            // Arrange
            Page<Customer> emptyPage = new PageImpl<>(Collections.emptyList());

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(emptyPage);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomerProfile(customerRequestDTO, "Bearer token"));
            assertThat(exception.getMessage()).contains("Customer profile not found");
        }

        @Test
        @DisplayName("Should throw exception when phone already exists")
        void updateCustomerProfile_PhoneExists_ThrowsException() {
            // Arrange
            customerRequestDTO.setPhone("9876543210");

            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(UUID.randomUUID());
            existingCustomer.setUser(user);

            Customer phoneOwner = new Customer();
            phoneOwner.setCustomerId(UUID.randomUUID()); // Different customer
            phoneOwner.setPhone("9876543210");

            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(customerPage);
            when(customerRepository.findByPhone("9876543210")).thenReturn(Optional.of(phoneOwner));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomerProfile(customerRequestDTO, "Bearer token"));
            assertThat(exception.getMessage()).isEqualTo("Phone number already exists: 9876543210");
        }

        @Test
        @DisplayName("Should update successfully when phone belongs to same customer")
        void updateCustomerProfile_SamePhoneSameCustomer_Success() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            customerRequestDTO.setPhone("1234567890");
            customerRequestDTO.setAddress("Updated Address"); // Add address to trigger userRepository.save()

            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(customerId);
            existingCustomer.setPhone("1234567890");
            existingCustomer.setUser(user);

            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(customerPage);
            when(customerRepository.findByPhone("1234567890")).thenReturn(Optional.of(existingCustomer)); // Same customer
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

            // Act
            CustomerResponseDTO result = customerService.updateCustomerProfile(customerRequestDTO, "Bearer token");

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(userRepository).save(user); // Now this stubbing is used
        }

        @Test
        @DisplayName("Should update successfully when phone is not taken")
        void updateCustomerProfile_PhoneNotTaken_Success() {
            // Arrange
            customerRequestDTO.setPhone("9999999999");
            customerRequestDTO.setAddress("New Address"); // Add address to trigger userRepository.save()

            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(UUID.randomUUID());
            existingCustomer.setUser(user);

            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(customerPage);
            when(customerRepository.findByPhone("9999999999")).thenReturn(Optional.empty()); // Phone not taken
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

            // Act
            CustomerResponseDTO result = customerService.updateCustomerProfile(customerRequestDTO, "Bearer token");

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(userRepository).save(user); // Now this stubbing is used
        }

        @Test
        @DisplayName("Should update successfully when address is null")
        void updateCustomerProfile_NullAddress_Success() {
            // Arrange
            customerRequestDTO.setAddress(null); // Null address

            Customer existingCustomer = new Customer();
            existingCustomer.setCustomerId(UUID.randomUUID());
            existingCustomer.setUser(user);

            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(customerRepository.findByUserUserId(1L, Pageable.unpaged())).thenReturn(customerPage);
            when(customerRepository.findByPhone(anyString())).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

            // Act
            CustomerResponseDTO result = customerService.updateCustomerProfile(customerRequestDTO, "Bearer token");

            // Assert
            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
            verify(userRepository, never()).save(any(User.class)); // User not saved when address is null
        }
    }

    @Nested
    @DisplayName("Get Customer Full Profile")
    class GetCustomerFullProfile {

        @Test
        @DisplayName("Should return full customer profile with all details")
        void getCustomerFullProfile_Success() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            Customer customer = new Customer();
            customer.setCustomerId(customerId);
            customer.setName("Test Customer");
            customer.setPhone("1234567890");
            customer.setUser(user);

            // Set up vehicles with warranty claims
            List<Vehicle> vehicles = new ArrayList<>();
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleId(1L);

            // Set up warranty claims
            List<com.swp391.warrantymanagement.entity.WarrantyClaim> warrantyClaims = new ArrayList<>();
            com.swp391.warrantymanagement.entity.WarrantyClaim claim1 = new com.swp391.warrantymanagement.entity.WarrantyClaim();
            claim1.setStatus(com.swp391.warrantymanagement.enums.WarrantyClaimStatus.COMPLETED);
            claim1.setInstalledPart(new com.swp391.warrantymanagement.entity.InstalledPart());
            claim1.getInstalledPart().setPart(new com.swp391.warrantymanagement.entity.Part());

            com.swp391.warrantymanagement.entity.WarrantyClaim claim2 = new com.swp391.warrantymanagement.entity.WarrantyClaim();
            claim2.setStatus(com.swp391.warrantymanagement.enums.WarrantyClaimStatus.PROCESSING);
            claim2.setInstalledPart(new com.swp391.warrantymanagement.entity.InstalledPart());
            claim2.getInstalledPart().setPart(new com.swp391.warrantymanagement.entity.Part());

            warrantyClaims.add(claim1);
            warrantyClaims.add(claim2);
            vehicle.setWarrantyClaims(warrantyClaims);
            vehicles.add(vehicle);
            customer.setVehicles(vehicles);

            // Set up feedbacks
            List<Feedback> feedbacks = new ArrayList<>();
            Feedback feedback1 = new Feedback();
            feedback1.setFeedbackId(1L);
            feedback1.setRating(5);
            feedback1.setComment("Great service");
            feedbacks.add(feedback1);
            customer.setFeedbacks(feedbacks);

            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

            // Act
            CustomerProfileResponseDTO result = customerService.getCustomerFullProfile(customerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCustomerId()).isEqualTo(customerId);
            assertThat(result.getCustomerName()).isEqualTo("Test Customer");
            assertThat(result.getCustomerPhone()).isEqualTo("1234567890");
            assertThat(result.getCustomerEmail()).isEqualTo("test@example.com");
            assertThat(result.getUsername()).isEqualTo("testuser");
            assertThat(result.getTotalVehicles()).isEqualTo(1);
            assertThat(result.getTotalClaims()).isEqualTo(2);
            assertThat(result.getCompletedClaims()).isEqualTo(1);
            assertThat(result.getPendingClaims()).isEqualTo(1);
            assertThat(result.getTotalFeedbacks()).isEqualTo(1);
            verify(customerRepository).findById(customerId);
        }


        @Test
        @DisplayName("Should return profile with empty vehicles and feedbacks lists")
        void getCustomerFullProfile_EmptyLists_Success() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            Customer customer = new Customer();
            customer.setCustomerId(customerId);
            customer.setName("Test Customer");
            customer.setPhone("1234567890");
            customer.setUser(user);
            customer.setVehicles(new ArrayList<>()); // Empty list
            customer.setFeedbacks(new ArrayList<>()); // Empty list

            when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

            // Act
            CustomerProfileResponseDTO result = customerService.getCustomerFullProfile(customerId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalVehicles()).isEqualTo(0);
            assertThat(result.getTotalClaims()).isEqualTo(0);
            assertThat(result.getCompletedClaims()).isEqualTo(0);
            assertThat(result.getPendingClaims()).isEqualTo(0);
            assertThat(result.getTotalFeedbacks()).isEqualTo(0);
            verify(customerRepository).findById(customerId);
        }

        @Test
        @DisplayName("Should throw exception when customer not found")
        void getCustomerFullProfile_NotFound_ThrowsException() {
            // Arrange
            UUID customerId = UUID.randomUUID();
            when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class,
                () -> customerService.getCustomerFullProfile(customerId));
            assertThat(exception.getMessage()).contains("Customer not found with ID");
        }
    }
}
