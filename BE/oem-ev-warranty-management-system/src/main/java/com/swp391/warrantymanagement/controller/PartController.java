package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// 1. Chịu trách nhiệm nhận request từ client
// 2. Gọi service xử lý nghiệp vụ
// 3. Trả về response cho client
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    @Autowired
    private PartService partService; // tự IoC Container của Spring inject(tiêm)

    @GetMapping
    public ResponseEntity<List<Part>> getParts() {
        return ResponseEntity.ok(partService.getParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable String id) {
        Part part = partService.getById(id);
        if (part == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(part);
    }

    @PostMapping
    public ResponseEntity<Part> create(@RequestBody Part part) {
        Part created = partService.createPart(part);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping
    public ResponseEntity<Part> update(@RequestBody Part part) {
        Part updated = partService.updatePart(part);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
