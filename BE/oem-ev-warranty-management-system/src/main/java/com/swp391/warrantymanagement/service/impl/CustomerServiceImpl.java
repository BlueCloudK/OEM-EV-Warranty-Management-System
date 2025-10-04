package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.mapper.CustomerMapper;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public PagedResponse<CustomerResponseDTO> getAllCustomersPage(Pageable pageable, String search) {
        // Pageable: Object chứa thông tin phân trang từ request
        // - page: số trang (0-based), VD: page=0 là trang đầu
        // - size: số items per page, VD: size=10 là 10 records/trang
        // - sort: thông tin sắp xếp, VD: sort=name,asc
        // Frontend gửi: GET /customers?page=0&size=10&sort=name,asc

        Page<Customer> customerPage;

        if (search != null && !search.trim().isEmpty()) {
            // Repository tự động áp dụng pagination từ Pageable object
            customerPage = customerRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            // Spring Data JPA tự động LIMIT và OFFSET dựa trên Pageable
            customerPage = customerRepository.findAll(pageable);
        }

        List<CustomerResponseDTO> responseDTOs = CustomerMapper.toResponseDTOList(customerPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
    }

    @Override
    public CustomerResponseDTO getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id).orElse(null);
        return CustomerMapper.toResponseDTO(customer);
    }

    @Override
    public CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO) {
        // Load User entity từ userId
        User user = userRepository.findById(requestDTO.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + requestDTO.getUserId());
        }

        // Convert DTO to Entity
        Customer customer = CustomerMapper.toEntity(requestDTO, user);

        // Save entity
        Customer savedCustomer = customerRepository.save(customer);

        // Convert entity back to response DTO
        return CustomerMapper.toResponseDTO(savedCustomer);
    }

    @Override
    public CustomerResponseDTO updateCustomer(UUID id, CustomerRequestDTO requestDTO) {
        Customer existingCustomer = customerRepository.findById(id).orElse(null);
        if (existingCustomer == null) {
            return null;
        }

        // Load User entity từ userId
        User user = userRepository.findById(requestDTO.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + requestDTO.getUserId());
        }

        // Update entity từ DTO
        CustomerMapper.updateEntity(existingCustomer, requestDTO, user);

        // Save updated entity
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        // Convert entity back to response DTO
        return CustomerMapper.toResponseDTO(updatedCustomer);
    }

    @Override
    public boolean deleteCustomer(UUID id) {
        if (!customerRepository.existsById(id)) {
            return false;
        }
        customerRepository.deleteById(id);
        return true;
    }

    @Override
    public PagedResponse<CustomerResponseDTO> searchCustomersByName(String name, Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findByNameContainingIgnoreCase(name, pageable);
        List<CustomerResponseDTO> responseDTOs = CustomerMapper.toResponseDTOList(customerPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
    }
}
