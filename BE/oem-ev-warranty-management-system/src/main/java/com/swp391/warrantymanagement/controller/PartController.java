package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.service.PartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    @Autowired
    private PartService partService;

    // Lấy tất cả linh kiện
    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        List<Part> parts = partService.getParts();
        return ResponseEntity.ok(parts);
    }

    // Lấy linh kiện theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable("id") String id) {
        Part part = partService.getById(id);
        if (part != null) {
            return ResponseEntity.ok(part);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo linh kiện mới
    @PostMapping
    public ResponseEntity<Part> createPart(@Valid @RequestBody Part part) {
        Part savedPart = partService.createPart(part);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPart);
    }

    // Cập nhật linh kiện
    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(@PathVariable("id") String id, @Valid @RequestBody Part part) {
        Part existingPart = partService.getById(id);
        if (existingPart == null) {
            return ResponseEntity.notFound().build();
        }

        part.setPartId(id);
        Part updatedPart = partService.updatePart(part);
        return ResponseEntity.ok(updatedPart);
    }

    // Xóa linh kiện
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable("id") String id) {
        Part existingPart = partService.getById(id);
        if (existingPart == null) {
            return ResponseEntity.notFound().build();
        }

        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }

    // Tìm kiếm linh kiện theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Part>> searchPartsByName(@RequestParam("name") String name) {
        List<Part> parts = partService.getParts()
                .stream()
                .filter(p -> p.getPartName().toLowerCase().contains(name.toLowerCase()))
                .toList();
        return ResponseEntity.ok(parts);
    }

    // Lấy linh kiện theo nhà sản xuất
    @GetMapping("/manufacturer/{manufacturer}")
    public ResponseEntity<List<Part>> getPartsByManufacturer(@PathVariable("manufacturer") String manufacturer) {
        List<Part> parts = partService.getParts()
                .stream()
                .filter(p -> p.getManufacturer().toLowerCase().contains(manufacturer.toLowerCase()))
                .toList();
        return ResponseEntity.ok(parts);
    }

    // Lấy linh kiện theo vehicle ID
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Part>> getPartsByVehicleId(@PathVariable("vehicleId") Long vehicleId) {
        List<Part> parts = partService.getParts()
                .stream()
                .filter(p -> p.getVehicle().getVehicleId().equals(vehicleId))
                .toList();
        return ResponseEntity.ok(parts);
    }
}
