package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CustomerController
 * Using MockMvc to test REST endpoints
 */
@WebMvcTest(CustomerController.class)
@AutoConfigureMockMvc
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    private CustomerResponseDTO testCustomerResponse;
    private CustomerRequestDTO testCustomerRequest;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        testCustomerId = UUID.randomUUID();

        testCustomerResponse = new CustomerResponseDTO();
        testCustomerResponse.setCustomerId(testCustomerId);
        testCustomerResponse.setName("Test Customer");
        testCustomerResponse.setEmail("customer@example.com");
        testCustomerResponse.setPhone("0123456789");
        testCustomerResponse.setAddress("123 Test Street");

        testCustomerRequest = new CustomerRequestDTO();
        testCustomerRequest.setUserId(1L);
        testCustomerRequest.setName("Test Customer");
        testCustomerRequest.setPhone("0123456789");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllCustomers_WithAdminRole_ShouldReturnPagedCustomers() throws Exception {
        // Arrange
        PagedResponse<CustomerResponseDTO> pagedResponse = new PagedResponse<>(
                Arrays.asList(testCustomerResponse),
                0, 10, 1, 1, true, true
        );

        when(customerService.getAllCustomersPage(any(PageRequest.class), eq(null)))
                .thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Customer"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getAllCustomers_WithCustomerRole_ShouldReturnForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCustomerById_WhenCustomerExists_ShouldReturnCustomer() throws Exception {
        // Arrange
        when(customerService.getCustomerById(testCustomerId))
                .thenReturn(testCustomerResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", testCustomerId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.name").value("Test Customer"))
                .andExpect(jsonPath("$.email").value("customer@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCustomerById_WhenCustomerNotExists_ShouldReturnNotFound() throws Exception {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerService.getCustomerById(nonExistentId))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/customers/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCustomer_WithValidData_ShouldReturnCreatedCustomer() throws Exception {
        // Arrange
        when(customerService.createCustomer(any(CustomerRequestDTO.class)))
                .thenReturn(testCustomerResponse);

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCustomerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Customer"))
                .andExpect(jsonPath("$.email").value("customer@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCustomer_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Arrange
        CustomerRequestDTO invalidRequest = new CustomerRequestDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCustomer_WhenCustomerExists_ShouldReturnUpdatedCustomer() throws Exception {
        // Arrange
        CustomerRequestDTO updateRequest = new CustomerRequestDTO();
        updateRequest.setName("Updated Customer");
        updateRequest.setPhone("0987654321");

        CustomerResponseDTO updatedResponse = new CustomerResponseDTO();
        updatedResponse.setCustomerId(testCustomerId);
        updatedResponse.setName("Updated Customer");
        updatedResponse.setEmail("updated@example.com");

        when(customerService.updateCustomer(eq(testCustomerId), any(CustomerRequestDTO.class)))
                .thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(put("/api/customers/{id}", testCustomerId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Customer"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCustomer_WhenCustomerNotExists_ShouldReturnNotFound() throws Exception {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerService.updateCustomer(eq(nonExistentId), any(CustomerRequestDTO.class)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/customers/{id}", nonExistentId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCustomerRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCustomer_WhenCustomerExists_ShouldReturnNoContent() throws Exception {
        // Arrange
        when(customerService.deleteCustomer(testCustomerId))
                .thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/customers/{id}", testCustomerId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCustomer_WhenCustomerNotExists_ShouldReturnNotFound() throws Exception {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(customerService.deleteCustomer(nonExistentId))
                .thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/customers/{id}", nonExistentId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    void deleteCustomer_WithStaffRole_ShouldReturnForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/customers/{id}", testCustomerId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchCustomers_ShouldReturnMatchingCustomers() throws Exception {
        // Arrange
        PagedResponse<CustomerResponseDTO> pagedResponse = new PagedResponse<>(
                Arrays.asList(testCustomerResponse),
                0, 10, 1, 1, true, true
        );

        when(customerService.searchCustomersByName(eq("Test"), any(PageRequest.class)))
                .thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/search")
                        .param("name", "Test")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Customer"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCustomerByEmail_WhenCustomerExists_ShouldReturnCustomer() throws Exception {
        // Arrange
        when(customerService.getCustomerByEmail("customer@example.com"))
                .thenReturn(testCustomerResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-email")
                        .param("email", "customer@example.com")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("customer@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCustomerByPhone_WhenCustomerExists_ShouldReturnCustomer() throws Exception {
        // Arrange
        when(customerService.getCustomerByPhone("0123456789"))
                .thenReturn(testCustomerResponse);

        // Act & Assert
        mockMvc.perform(get("/api/customers/by-phone")
                        .param("phone", "0123456789")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("0123456789"));
    }
}
