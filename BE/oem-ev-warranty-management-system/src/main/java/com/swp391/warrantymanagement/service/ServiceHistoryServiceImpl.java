package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceHistoryServiceImpl implements ServiceHistoryService {

    @Autowired // Automatically injects VehiclesRepository dependency
    private ServiceHistoryRepository serviceHistoryRepository;

    @Override
    public ServiceHistory getById(int id) {
        return serviceHistoryRepository.findById(id).orElse(null);
    }

    @Override
    public ServiceHistory createServiceHistory(ServiceHistory serviceHistory) {
        return serviceHistoryRepository.save(serviceHistory);
    }

    @Override
    public ServiceHistory updateServiceHistory(ServiceHistory serviceHistory) {
        ServiceHistory existingServiceHistory = serviceHistoryRepository.findById(serviceHistory.getServiceHistoryId()).orElse(null);
        if (existingServiceHistory != null) {
            return serviceHistoryRepository.save(serviceHistory);
        }
        return null;
    }

    @Override
    public void deleteServiceHistory(int id) {
        serviceHistoryRepository.deleteById(id);
    }

    @Override
    public List<ServiceHistory> getServiceHistories() {
        return serviceHistoryRepository.findAll();
    }
}
