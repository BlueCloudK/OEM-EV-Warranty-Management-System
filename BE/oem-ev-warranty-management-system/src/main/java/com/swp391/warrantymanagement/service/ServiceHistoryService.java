package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface ServiceHistoryService {
    ServiceHistory getById(Long id);
    ServiceHistory createServiceHistory(ServiceHistory serviceHistory);
    ServiceHistory updateServiceHistory(ServiceHistory serviceHistory);
    void deleteServiceHistory(Long id);
    List<ServiceHistory> getServiceHistories();
}
