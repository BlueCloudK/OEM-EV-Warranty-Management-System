package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.UUID;

@RestController
@RequestMapping("api/customers")
@CrossOrigin
public class CustomerController {
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);
    @Autowired
    private CustomerService customerService;

    // Lấy tất cả customers với pagination (ADMIN/SC_STAFF/EVM_STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        logger.info("Get all customers request: page={}, size={}, search={}", page, size, search);
        PagedResponse<CustomerResponseDTO> customersPage = customerService.getAllCustomersPage(
                PageRequest.of(page, size), search);
        logger.info("Get all customers success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    // Lấy customer theo ID (ADMIN/SC_STAFF/EVM_STAFF only)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable UUID id) {
        logger.info("Get customer by id: {}", id);
        CustomerResponseDTO customer = customerService.getCustomerById(id);
        if (customer != null) {
            logger.info("Customer found: {}", id);
            return ResponseEntity.ok(customer);
        }
        logger.warn("Customer not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Tạo customer mới (ADMIN/SC_STAFF/EVM_STAFF only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO requestDTO) {
        logger.info("Create customer request: {}", requestDTO);
        CustomerResponseDTO responseDTO = customerService.createCustomer(requestDTO);
        logger.info("Customer created: {}", responseDTO.getCustomerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Cập nhật customer (ADMIN/SC_STAFF/EVM_STAFF only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable UUID id,
                                                              @Valid @RequestBody CustomerRequestDTO requestDTO) {
        logger.info("Update customer request: id={}, data={}", id, requestDTO);
        CustomerResponseDTO updatedCustomer = customerService.updateCustomer(id, requestDTO);
        if (updatedCustomer != null) {
            logger.info("Customer updated: {}", id);
            return ResponseEntity.ok(updatedCustomer);
        }
        logger.warn("Customer not found for update: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Xóa customer (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        logger.info("Delete customer request: {}", id);
        boolean deleted = customerService.deleteCustomer(id);
        if (deleted) {
            logger.info("Customer deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Customer not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Tìm kiếm customer theo tên
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> searchCustomers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Search customers by name: {}, page={}, size={}", name, page, size);
        PagedResponse<CustomerResponseDTO> customersPage = customerService.searchCustomersByName(
                name, PageRequest.of(page, size));
        logger.info("Search customers by name success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    // Tìm customer theo email
    @GetMapping("/by-email")
    public ResponseEntity<CustomerResponseDTO> getCustomerByEmail(@RequestParam String email) {
        logger.info("Get customer by email: {}", email);
        CustomerResponseDTO customer = customerService.getCustomerByEmail(email);
        if (customer != null) {
            logger.info("Customer found by email: {}", email);
            return ResponseEntity.ok(customer);
        }
        logger.warn("Customer not found by email: {}", email);
        return ResponseEntity.notFound().build();
    }

    // Tìm customer theo phone
    @GetMapping("/by-phone")
    public ResponseEntity<CustomerResponseDTO> getCustomerByPhone(@RequestParam String phone) {
        logger.info("Get customer by phone: {}", phone);
        CustomerResponseDTO customer = customerService.getCustomerByPhone(phone);
        if (customer != null) {
            logger.info("Customer found by phone: {}", phone);
            return ResponseEntity.ok(customer);
        }
        logger.warn("Customer not found by phone: {}", phone);
        return ResponseEntity.notFound().build();
    }

    // Lấy customers theo userId
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getCustomersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get customers by userId: {}, page={}, size={}", userId, page, size);
        PagedResponse<CustomerResponseDTO> customersPage = customerService.getCustomersByUserId(
                userId, PageRequest.of(page, size));
        logger.info("Get customers by userId success, totalElements={}", customersPage.getTotalElements());
        return ResponseEntity.ok(customersPage);
    }

    // API cho Customer tự cập nhật profile của mình
    @PutMapping("/profile")
    public ResponseEntity<CustomerResponseDTO> updateCustomerProfile(
            @Valid @RequestBody CustomerRequestDTO requestDTO,
            @RequestHeader("Authorization") String authorizationHeader) {
        logger.info("Update customer profile request");
        try {
            CustomerResponseDTO updatedCustomer = customerService.updateCustomerProfile(requestDTO, authorizationHeader);
            logger.info("Customer profile updated: {}", updatedCustomer.getCustomerId());
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            logger.error("Update customer profile failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
