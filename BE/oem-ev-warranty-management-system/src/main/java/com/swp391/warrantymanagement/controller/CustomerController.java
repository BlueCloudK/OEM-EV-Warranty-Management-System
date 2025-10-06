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

import java.util.UUID;

@RestController
@RequestMapping("api/customers")
@CrossOrigin
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    // Lấy tất cả customers với pagination
    @GetMapping
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        PagedResponse<CustomerResponseDTO> customersPage = customerService.getAllCustomersPage(
            PageRequest.of(page, size), search);
        return ResponseEntity.ok(customersPage);
    }

    // Lấy customer theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable UUID id) {
        CustomerResponseDTO customer = customerService.getCustomerById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo customer mới
    @PostMapping
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO requestDTO) {
        CustomerResponseDTO responseDTO = customerService.createCustomer(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Cập nhật customer
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable UUID id,
                                                             @Valid @RequestBody CustomerRequestDTO requestDTO) {
        CustomerResponseDTO updatedCustomer = customerService.updateCustomer(id, requestDTO);
        if (updatedCustomer != null) {
            return ResponseEntity.ok(updatedCustomer);
        }
        return ResponseEntity.notFound().build();
    }

    // Xóa customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        boolean deleted = customerService.deleteCustomer(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Tìm kiếm customer theo tên
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> searchCustomers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<CustomerResponseDTO> customersPage = customerService.searchCustomersByName(
            name, PageRequest.of(page, size));
        return ResponseEntity.ok(customersPage);
    }

    // Tìm customer theo email
    @GetMapping("/by-email")
    public ResponseEntity<CustomerResponseDTO> getCustomerByEmail(@RequestParam String email) {
        CustomerResponseDTO customer = customerService.getCustomerByEmail(email);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }

    // Tìm customer theo phone
    @GetMapping("/by-phone")
    public ResponseEntity<CustomerResponseDTO> getCustomerByPhone(@RequestParam String phone) {
        CustomerResponseDTO customer = customerService.getCustomerByPhone(phone);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }

    // Lấy customers theo userId
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<PagedResponse<CustomerResponseDTO>> getCustomersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<CustomerResponseDTO> customersPage = customerService.getCustomersByUserId(
            userId, PageRequest.of(page, size));
        return ResponseEntity.ok(customersPage);
    }

    // API cho Customer tự cập nhật profile của mình
    @PutMapping("/profile")
    public ResponseEntity<CustomerResponseDTO> updateCustomerProfile(
            @Valid @RequestBody CustomerRequestDTO requestDTO,
            @RequestHeader("Authorization") String authorizationHeader) {

        try {
            CustomerResponseDTO updatedCustomer = customerService.updateCustomerProfile(requestDTO, authorizationHeader);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
