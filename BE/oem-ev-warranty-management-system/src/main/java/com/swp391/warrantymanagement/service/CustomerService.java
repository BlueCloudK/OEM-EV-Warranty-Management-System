package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Customer;
import java.util.List;
import org.springframework.stereotype.Service;

// class đứng giữa Controller và Repository, nó sẽ đưa Object từ Repository lên Controller và ngược lại
@Service
public interface CustomerService {
    Customer getById(Long id);
    Customer createCustomer(Customer customer);
    Customer updateCustomer(Customer customer);
    void deleteCustomer(Long id);
    List<Customer> getCustomers();
}
