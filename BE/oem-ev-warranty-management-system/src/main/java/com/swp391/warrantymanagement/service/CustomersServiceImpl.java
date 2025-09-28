package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Customers;
import com.swp391.warrantymanagement.repository.CustomersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomersServiceImpl implements CustomersService {

    @Autowired // này là dùng reflection để tự động inject cái CustomersRepository vào đây
    private CustomersRepository customersRepository;

    @Override
    public Customers getById(int id) {
        return customersRepository.findById(id).orElse(null);
    }

    @Override
    public Customers createCustomer(Customers customer) {
        return customersRepository.save(customer);
    }

    @Override
    public Customers updateCustomer(Customers customer) {
        Customers existingCustomer = customersRepository.findById(customer.getCustomerId()).orElse(null);
        if (existingCustomer != null) {
            return customersRepository.save(customer);
        }
        return null;
    }

    @Override
    public void deleteCustomer(int id) {
        customersRepository.deleteById(id);
    }

    @Override
    public List<Customers> getCustomers() {
        return customersRepository.findAll();
    }
}
