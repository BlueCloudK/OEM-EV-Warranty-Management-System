package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService{

    @Autowired // này là dùng reflection để tự động inject cái CustomerRepository vào đây
    private CustomerRepository customersRepository;

    @Override
    public Customer getById(Long id) {
        return customersRepository.findById(id).orElse(null);
    }

    @Override
    public Customer createCustomer(Customer customer) {
        return customersRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        Customer existingCustomer = customersRepository.findById(customer.getCustomerId()).orElse(null);
        if (existingCustomer != null) {
            return customersRepository.save(customer);
        }
        return null;
    }

    @Override
    public void deleteCustomer(Long id) {
        customersRepository.deleteById(id);
    }

    @Override
    public List<Customer> getCustomers() {
        return customersRepository.findAll();
    }
}
