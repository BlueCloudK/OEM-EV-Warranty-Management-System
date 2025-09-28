package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Parts;
import com.swp391.warrantymanagement.service.PartsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartsController {
    @Autowired
    private PartsService partsService;

    @GetMapping("/")
    public ResponseEntity<List<Parts>> getParts() {
        return ResponseEntity.ok(partsService.getParts());
    }

    @GetMapping("/partId")
    public ResponseEntity<Parts> getPartById(@PathVariable int id) {
        Parts part = partsService.getById(id);
        if (part != null) {
            return ResponseEntity.ok(part);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Parts> createPart(@RequestBody Parts part) {
        return ResponseEntity.ok(partsService.createPart(part));
    }

    @DeleteMapping("/partId")
    public ResponseEntity<Void> deletePart(@PathVariable int id) {
        partsService.deletePart(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Parts> updatePart(@RequestBody Parts part) {
        return ResponseEntity.ok(partsService.updatePart(part));
    }
}
