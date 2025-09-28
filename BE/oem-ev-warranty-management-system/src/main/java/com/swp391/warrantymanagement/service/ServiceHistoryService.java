package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface ServiceHistoryService {
    public ServiceHistory getById(int id);
    public ServiceHistory createServiceHistory(ServiceHistory serviceHistory);
    public ServiceHistory updateServiceHistory(ServiceHistory serviceHistory);
    public void deleteServiceHistory(int id);
    public List<ServiceHistory> getServiceHistories();
}
