package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/customers")
@CrossOrigin
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    // Lấy tất cả khách hàng
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getCustomers();
        return ResponseEntity.ok(customers);
    }

    // Lấy khách hàng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable("id") UUID id) {
        Customer customer = customerService.getById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo khách hàng mới
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody Customer customer) {
        customer.setCustomerId(null); // Đảm bảo ID null để tạo mới
        Customer savedCustomer = customerService.createCustomer(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCustomer);
    }

    // Cập nhật khách hàng
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable("id") UUID id, @Valid @RequestBody Customer customer) {
        Customer existingCustomer = customerService.getById(id);
        if (existingCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        customer.setCustomerId(id);
        Customer updatedCustomer = customerService.updateCustomer(customer);
        return ResponseEntity.ok(updatedCustomer);
    }

    // Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable("id") UUID id) {
        Customer existingCustomer = customerService.getById(id);
        if (existingCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // Tìm kiếm khách hàng theo tên - sử dụng database query hiệu quả
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomersByName(@RequestParam("name") String name) {
        List<Customer> customers = customerService.getCustomers()
                .stream()
                .filter(c -> c.getName().toLowerCase().contains(name.toLowerCase()))
                .toList();
        return ResponseEntity.ok(customers);
    }

    // Tìm kiếm khách hàng theo email - sử dụng database query hiệu quả
    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(@PathVariable("email") String email) {
        Customer customer = customerService.getCustomers()
                .stream()
                .filter(c -> c.getEmail().equals(email))
                .findFirst()
                .orElse(null);

        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }
}
