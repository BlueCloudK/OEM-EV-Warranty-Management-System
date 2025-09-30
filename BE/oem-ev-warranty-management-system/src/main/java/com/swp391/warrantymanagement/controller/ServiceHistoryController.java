package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/service-history")
@CrossOrigin
public class ServiceHistoryController {
    @Autowired
    private ServiceHistoryService serviceHistoryService;

    @GetMapping("/")
    public ResponseEntity<List<ServiceHistory>> getServiceHistories() {
        return ResponseEntity.ok(serviceHistoryService.getServiceHistories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceHistory> getServiceHistoryById(@PathVariable Long id) {
        ServiceHistory serviceHistory = serviceHistoryService.getById(id);
        if (serviceHistory != null) {
            return ResponseEntity.ok(serviceHistory);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<ServiceHistory> createServiceHistory(@RequestBody ServiceHistory serviceHistory) {
        return ResponseEntity.ok(serviceHistoryService.createServiceHistory(serviceHistory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceHistory(@PathVariable Long id) {
        serviceHistoryService.deleteServiceHistory(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<ServiceHistory> updateServiceHistory(@RequestBody ServiceHistory serviceHistory) {
        return ResponseEntity.ok(serviceHistoryService.updateServiceHistory(serviceHistory));
    }
}
