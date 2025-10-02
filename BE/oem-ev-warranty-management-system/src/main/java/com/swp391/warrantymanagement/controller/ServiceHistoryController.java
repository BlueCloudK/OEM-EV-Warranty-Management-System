package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/service-history")
@CrossOrigin
public class ServiceHistoryController {
    @Autowired
    private ServiceHistoryService serviceHistoryService;

    // Lấy tất cả lịch sử dịch vụ
    @GetMapping
    public ResponseEntity<List<ServiceHistory>> getAllServiceHistories() {
        List<ServiceHistory> serviceHistories = serviceHistoryService.getServiceHistories();
        return ResponseEntity.ok(serviceHistories);
    }

    // Lấy lịch sử dịch vụ theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceHistory> getServiceHistoryById(@PathVariable("id") Long id) {
        ServiceHistory serviceHistory = serviceHistoryService.getById(id);
        if (serviceHistory != null) {
            return ResponseEntity.ok(serviceHistory);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo lịch sử dịch vụ mới
    @PostMapping
    public ResponseEntity<ServiceHistory> createServiceHistory(@Valid @RequestBody ServiceHistory serviceHistory) {
        serviceHistory.setServiceHistoryId(null); // Đảm bảo ID null để tạo mới
        ServiceHistory savedServiceHistory = serviceHistoryService.createServiceHistory(serviceHistory);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedServiceHistory);
    }

    // Cập nhật lịch sử dịch vụ
    @PutMapping("/{id}")
    public ResponseEntity<ServiceHistory> updateServiceHistory(@PathVariable("id") Long id, @Valid @RequestBody ServiceHistory serviceHistory) {
        ServiceHistory existingServiceHistory = serviceHistoryService.getById(id);
        if (existingServiceHistory == null) {
            return ResponseEntity.notFound().build();
        }

        serviceHistory.setServiceHistoryId(id);
        ServiceHistory updatedServiceHistory = serviceHistoryService.updateServiceHistory(serviceHistory);
        return ResponseEntity.ok(updatedServiceHistory);
    }

    // Xóa lịch sử dịch vụ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceHistory(@PathVariable("id") Long id) {
        ServiceHistory existingServiceHistory = serviceHistoryService.getById(id);
        if (existingServiceHistory == null) {
            return ResponseEntity.notFound().build();
        }

        serviceHistoryService.deleteServiceHistory(id);
        return ResponseEntity.noContent().build();
    }

    // Lấy lịch sử dịch vụ theo vehicle ID - sử dụng database query hiệu quả
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ServiceHistory>> getServiceHistoryByVehicleId(@PathVariable("vehicleId") Long vehicleId) {
        List<ServiceHistory> serviceHistories = serviceHistoryService.getServiceHistoriesByVehicleId(vehicleId);
        return ResponseEntity.ok(serviceHistories);
    }

    // Lấy lịch sử dịch vụ theo loại dịch vụ - sử dụng database query hiệu quả
    @GetMapping("/type/{serviceType}")
    public ResponseEntity<List<ServiceHistory>> getServiceHistoryByType(@PathVariable("serviceType") String serviceType) {
        List<ServiceHistory> serviceHistories = serviceHistoryService.getServiceHistoriesByServiceType(serviceType);
        return ResponseEntity.ok(serviceHistories);
    }
}
