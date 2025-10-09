package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for customer-related business logic.
 * Handles CRUD and search operations for customers using DTOs.
 */
public interface CustomerService {
    PagedResponse<CustomerResponseDTO> getAllCustomersPage(Pageable pageable, String search);
    CustomerResponseDTO getCustomerById(UUID id);
    CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO);
    CustomerResponseDTO updateCustomer(UUID id, CustomerRequestDTO requestDTO);
    boolean deleteCustomer(UUID id);
    PagedResponse<CustomerResponseDTO> searchCustomersByName(String name, Pageable pageable);
    CustomerResponseDTO getCustomerByEmail(String email);
    CustomerResponseDTO getCustomerByPhone(String phone);
    PagedResponse<CustomerResponseDTO> getCustomersByUserId(Long userId, Pageable pageable);
    CustomerResponseDTO updateCustomerProfile(CustomerRequestDTO requestDTO, String authorizationHeader);
}
