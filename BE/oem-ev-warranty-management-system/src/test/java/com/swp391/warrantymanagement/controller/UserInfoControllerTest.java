package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.response.CustomerProfileResponseDTO;
import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.CustomerService;
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
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UserInfoController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@Import(UserInfoControllerTest.ControllerTestConfig.class)
@DisplayName("UserInfoController Tests")
class UserInfoControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        public CustomerService customerService() {
            return Mockito.mock(CustomerService.class);
        }

        @Bean
        public UserRepository userRepository() {
            return Mockito.mock(UserRepository.class);
        }

        @Bean
        public CustomerRepository customerRepository() {
            return Mockito.mock(CustomerRepository.class);
        }


        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        Mockito.reset(userService, customerService, userRepository, customerRepository);
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"CUSTOMER"})
    @DisplayName("GET /api/me should return current user info")
    void getCurrentUser_Success() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.hasCustomerRole").value(true))
                .andExpect(jsonPath("$.isAuthenticated").value(true));
    }

    @Test
    @DisplayName("GET /api/me should be inaccessible without authentication")
    void getCurrentUser_Unauthorized() throws Exception {
        // Note: Spring Security returns 403 (Forbidden) for anonymous users accessing authenticated endpoints
        // because it treats anonymous as a special authenticated state (not truly unauthenticated).
        // In a real REST API with stateless JWT authentication, this would be 401.
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isForbidden()); // Changed from isUnauthorized() to isForbidden()
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/admin/test should return 200 OK for ADMIN")
    void adminOnlyPost_Admin_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");
        requestData.put("value", "123");

        // Act & Assert
        mockMvc.perform(post("/api/admin/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin action performed successfully"))
                .andExpect(jsonPath("$.performedBy").value("admin"));
    }

    @Test
    @WithMockUser(username = "staff", roles = {"SC_STAFF"})
    @DisplayName("POST /api/admin/test should return 403 Forbidden for SC_STAFF")
    void adminOnlyPost_Staff_Forbidden() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");

        // Act & Assert
        mockMvc.perform(post("/api/admin/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    @DisplayName("POST /api/admin/test should return 403 Forbidden for CUSTOMER")
    void adminOnlyPost_Customer_Forbidden() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");

        // Act & Assert
        mockMvc.perform(post("/api/admin/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staff", roles = {"SC_STAFF"})
    @DisplayName("POST /api/staff/test should return 200 OK for SC_STAFF")
    void staffPost_Staff_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("task", "update");

        // Act & Assert
        mockMvc.perform(post("/api/staff/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Staff action performed"))
                .andExpect(jsonPath("$.performedBy").value("staff"))
                .andExpect(jsonPath("$.isStaff").value(true));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/staff/test should return 200 OK for ADMIN")
    void staffPost_Admin_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("task", "update");

        // Act & Assert
        mockMvc.perform(post("/api/staff/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Staff action performed"))
                .andExpect(jsonPath("$.isAdmin").value(true));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    @DisplayName("POST /api/staff/test should return 403 Forbidden for CUSTOMER")
    void staffPost_Customer_Forbidden() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("task", "update");

        // Act & Assert
        mockMvc.perform(post("/api/staff/test")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/dynamic-auth should return admin permissions for ADMIN")
    void dynamicAuth_Admin_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");

        // Act & Assert
        mockMvc.perform(post("/api/dynamic-auth")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin can do everything"))
                .andExpect(jsonPath("$.user").value("admin"));
    }

    @Test
    @WithMockUser(username = "staff", roles = {"SC_STAFF"})
    @DisplayName("POST /api/dynamic-auth should return staff permissions for SC_STAFF")
    void dynamicAuth_Staff_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");

        // Act & Assert
        mockMvc.perform(post("/api/dynamic-auth")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Staff has limited permissions"))
                .andExpect(jsonPath("$.user").value("staff"));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    @DisplayName("POST /api/dynamic-auth should return customer permissions for CUSTOMER")
    void dynamicAuth_Customer_Success() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("action", "test");

        // Act & Assert
        mockMvc.perform(post("/api/dynamic-auth")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Customer can only view"))
                .andExpect(jsonPath("$.user").value("customer"));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    @DisplayName("GET /api/profile should return customer profile for CUSTOMER role")
    void getMyProfile_Customer_Success() throws Exception {
        // Arrange
        Role customerRole = new Role();
        customerRole.setRoleId(1L);
        customerRole.setRoleName("CUSTOMER");

        User user = new User();
        user.setUserId(1L);
        user.setUsername("customer");
        user.setRole(customerRole);

        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setUser(user);

        CustomerProfileResponseDTO profileDTO = new CustomerProfileResponseDTO();
        profileDTO.setCustomerId(customer.getCustomerId());
        profileDTO.setCustomerName("Test Customer");

        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(user));
        when(customerRepository.findByUser(user)).thenReturn(customer);
        when(customerService.getCustomerFullProfile(customer.getCustomerId())).thenReturn(profileDTO);

        // Act & Assert
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Test Customer"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/profile should return user profile for ADMIN role")
    void getMyProfile_Admin_Success() throws Exception {
        // Arrange
        Role adminRole = new Role();
        adminRole.setRoleId(2L);
        adminRole.setRoleName("ADMIN");

        User user = new User();
        user.setUserId(2L);
        user.setUsername("admin");
        user.setRole(adminRole);

        UserProfileResponseDTO profileDTO = new UserProfileResponseDTO();
        profileDTO.setUserId(2L);
        profileDTO.setUsername("admin");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(userService.getUserFullProfile(2L)).thenReturn(profileDTO);

        // Act & Assert
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"));
    }

    @Test
    @WithMockUser(username = "customer_no_profile", roles = {"CUSTOMER"})
    @DisplayName("GET /api/profile should return 404 when customer profile not found")
    void getMyProfile_CustomerProfileNotFound() throws Exception {
        // Arrange
        Role customerRole = new Role();
        customerRole.setRoleId(1L);
        customerRole.setRoleName("CUSTOMER");

        User user = new User();
        user.setUserId(3L);
        user.setUsername("customer_no_profile");
        user.setRole(customerRole);

        when(userRepository.findByUsername("customer_no_profile")).thenReturn(Optional.of(user));
        when(customerRepository.findByUser(user)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/me/basic should return basic user info for ADMIN")
    void getMyBasicInfo_Admin_Success() throws Exception {
        // Arrange
        Role adminRole = new Role();
        adminRole.setRoleId(2L);
        adminRole.setRoleName("ADMIN");

        User user = new User();
        user.setUserId(2L);
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        user.setRole(adminRole);

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        // Act & Assert
        mockMvc.perform(get("/api/me/basic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.roleName").value("ADMIN"));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    @DisplayName("GET /api/me/basic should return basic info with customerId for CUSTOMER")
    void getMyBasicInfo_Customer_Success() throws Exception {
        // Arrange
        Role customerRole = new Role();
        customerRole.setRoleId(1L);
        customerRole.setRoleName("CUSTOMER");

        User user = new User();
        user.setUserId(1L);
        user.setUsername("customer");
        user.setEmail("customer@example.com");
        user.setRole(customerRole);

        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setUser(user);
        customer.setName("Test Customer");
        customer.setPhone("0123456789");

        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(user));
        when(customerRepository.findByUser(user)).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(get("/api/me/basic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("customer"))
                .andExpect(jsonPath("$.roleName").value("CUSTOMER"))
                .andExpect(jsonPath("$.customerId").exists())
                .andExpect(jsonPath("$.customerName").value("Test Customer"))
                .andExpect(jsonPath("$.phone").value("0123456789"));
    }

    @Test
    @DisplayName("GET /api/me/basic should return 403 Forbidden without authentication")
    void getMyBasicInfo_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/me/basic"))
                .andExpect(status().isForbidden());
    }
}
