package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.CustomerService;
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
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(value = CustomerController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("CustomerController Tests")
class CustomerControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public CustomerService customerService() {
            return Mockito.mock(CustomerService.class);
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
    private CustomerService customerService;

    private CustomerRequestDTO customerRequestDTO;
    private CustomerResponseDTO customerResponseDTO;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        Mockito.reset(customerService);

        testCustomerId = UUID.randomUUID();

        customerRequestDTO = new CustomerRequestDTO();
        customerRequestDTO.setUserId(1L);
        customerRequestDTO.setName("Test Customer");
        customerRequestDTO.setPhone("0123456789");
        customerRequestDTO.setAddress("123 Test Street, Test City, Vietnam");

        customerResponseDTO = new CustomerResponseDTO();
        customerResponseDTO.setCustomerId(testCustomerId);
        customerResponseDTO.setName("Test Customer");
        customerResponseDTO.setPhone("0123456789");
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/customers should return 201 Created for authorized user")
    void createCustomer_Success() throws Exception {
        // Arrange
        when(customerService.createCustomer(any(CustomerRequestDTO.class))).thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequestDTO)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/customers/{id} should return 204 No Content for ADMIN")
    void deleteCustomer_Admin_Success() throws Exception {
        // Arrange
        when(customerService.deleteCustomer(testCustomerId)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/customers/" + testCustomerId)
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("DELETE /api/customers/{id} should return 403 Forbidden for non-ADMIN")
    void deleteCustomer_NonAdmin_Forbidden() throws Exception {
        // Arrange
        // We don't need to mock the service call here, as Spring Security should intercept it first.
        // If it reaches the service, it means authorization failed.

        // Act & Assert
        mockMvc.perform(delete("/api/customers/" + testCustomerId)
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers should return 200 OK with paged customers")
    void getAllCustomers_Success() throws Exception {
        // Arrange
        PagedResponse<CustomerResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(customerResponseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setTotalPages(1);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(customerService.getAllCustomersPage(any(), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/{id} should return 200 OK when customer exists")
    void getCustomerById_Success() throws Exception {
        // Arrange
        when(customerService.getCustomerById(testCustomerId)).thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/customers/" + testCustomerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.name").value("Test Customer"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/{id} should return 404 Not Found when customer does not exist")
    void getCustomerById_NotFound() throws Exception {
        // Arrange
        when(customerService.getCustomerById(testCustomerId)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/customers/" + testCustomerId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PUT /api/customers/{id} should return 200 OK when update is successful")
    void updateCustomer_Success() throws Exception {
        // Arrange
        when(customerService.updateCustomer(eq(testCustomerId), any(CustomerRequestDTO.class)))
                .thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/customers/" + testCustomerId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Customer"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/customers/{id} should return 404 Not Found when customer does not exist")
    void updateCustomer_NotFound() throws Exception {
        // Arrange
        when(customerService.updateCustomer(eq(testCustomerId), any(CustomerRequestDTO.class)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/customers/" + testCustomerId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequestDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/search should return 200 OK with search results")
    void searchCustomers_Success() throws Exception {
        // Arrange
        PagedResponse<CustomerResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(customerResponseDTO));
        pagedResponse.setTotalElements(1L);

        when(customerService.searchCustomersByName(anyString(), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/search")
                        .param("name", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/by-email should return 200 OK when customer exists")
    void getCustomerByEmail_Success() throws Exception {
        // Arrange
        when(customerService.getCustomerByEmail(anyString())).thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-email")
                        .param("email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Customer"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/by-email should return 404 Not Found when customer does not exist")
    void getCustomerByEmail_NotFound() throws Exception {
        // Arrange
        when(customerService.getCustomerByEmail(anyString())).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-email")
                        .param("email", "nonexistent@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/by-phone should return 200 OK when customer exists")
    void getCustomerByPhone_Success() throws Exception {
        // Arrange
        when(customerService.getCustomerByPhone(anyString())).thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-phone")
                        .param("phone", "0123456789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Customer"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/by-phone should return 404 Not Found when customer does not exist")
    void getCustomerByPhone_NotFound() throws Exception {
        // Arrange
        when(customerService.getCustomerByPhone(anyString())).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-phone")
                        .param("phone", "9999999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/customers/by-user/{userId} should return 200 OK with paged customers")
    void getCustomersByUserId_Success() throws Exception {
        // Arrange
        PagedResponse<CustomerResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(customerResponseDTO));
        pagedResponse.setTotalElements(1L);

        when(customerService.getCustomersByUserId(any(Long.class), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PUT /api/customers/profile should return 200 OK when profile update is successful")
    void updateCustomerProfile_Success() throws Exception {
        // Arrange
        when(customerService.updateCustomerProfile(any(CustomerRequestDTO.class), anyString()))
                .thenReturn(customerResponseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/customers/profile")
                        .with(csrf())
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Customer"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PUT /api/customers/profile should return 400 Bad Request when update fails")
    void updateCustomerProfile_Failure() throws Exception {
        // Arrange
        when(customerService.updateCustomerProfile(any(CustomerRequestDTO.class), anyString()))
                .thenThrow(new RuntimeException("Invalid token"));

        // Act & Assert
        mockMvc.perform(put("/api/customers/profile")
                        .with(csrf())
                        .header("Authorization", "Bearer invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerRequestDTO)))
                .andExpect(status().isBadRequest());
    }
}
