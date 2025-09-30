package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/")
    public ResponseEntity<List<Customer>> getCustomers() {
        return ResponseEntity.ok(customerService.getCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable UUID id) {
        Customer customer = customerService.getById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Customer> updateCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.updateCustomer(customer));
    }
}
