package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Customer;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

// class đứng giữa Controller và Repository, nó sẽ đưa Object từ Repository lên Controller và ngược lại
@Service
public interface CustomerService {
    Customer getById(UUID id);
    Customer createCustomer(Customer customer);
    Customer updateCustomer(Customer customer);
    void deleteCustomer(UUID id);
    List<Customer> getCustomers();
}
