package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Customers;
import com.swp391.warrantymanagement.service.CustomersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/customers")
@CrossOrigin
public class CustomersController {
    @Autowired
    private CustomersService customersService;

    @GetMapping("/")
    public ResponseEntity<List<Customers>> getCustomers() {
        return ResponseEntity.ok(customersService.getCustomers());
    }

    @GetMapping("/customerId")
    public ResponseEntity<Customers> getCustomerById(@PathVariable int id) {
        Customers customer = customersService.getById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Customers> createCustomer(@RequestBody Customers customer) {
        return ResponseEntity.ok(customersService.createCustomer(customer));
    }

    @DeleteMapping("/customerId")
    public ResponseEntity<Void> deleteCustomer(@PathVariable int id) {
        customersService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Customers> updateCustomer(@RequestBody Customers customer) {
        return ResponseEntity.ok(customersService.updateCustomer(customer));
    }
}
