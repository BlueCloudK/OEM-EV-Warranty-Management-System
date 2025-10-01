package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceHistoryServiceImpl implements ServiceHistoryService {

    @Autowired // này là dùng reflection để tự động inject cái ServiceHistoryRepository vào đây
    private ServiceHistoryRepository serviceHistoryRepository;

    @Override
    public ServiceHistory getById(Long id) {
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
    public void deleteServiceHistory(Long id) {
        serviceHistoryRepository.deleteById(id);
    }

    @Override
    public List<ServiceHistory> getServiceHistories() {
        return serviceHistoryRepository.findAll();
    }

    // Implement methods mới sử dụng database queries hiệu quả
    @Override
    public List<ServiceHistory> getServiceHistoriesByVehicleId(Long vehicleId) {
        return serviceHistoryRepository.findByVehicleVehicleId(vehicleId);
    }

    @Override
    public List<ServiceHistory> getServiceHistoriesByServiceType(String serviceType) {
        return serviceHistoryRepository.findByServiceTypeContainingIgnoreCase(serviceType);
    }
}
