package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Customers;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface CustomersService {
    public Customers getById(int id);
    public Customers createCustomer(Customers customer);
    public Customers updateCustomer(Customers customer);
    public void deleteCustomer(int id);
    public List<Customers> getCustomers();
}
