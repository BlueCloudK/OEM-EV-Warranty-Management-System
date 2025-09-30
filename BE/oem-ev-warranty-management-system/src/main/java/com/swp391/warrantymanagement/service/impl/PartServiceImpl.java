package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartServiceImpl implements PartService {
    @Autowired
    private PartRepository partRepository;

    @Override
    public Part getById(String id) {
        return partRepository.findById(id).orElse(null);
    }

    @Override
    public Part createPart(Part part) {
        return partRepository.save(part);
    }

    @Override
    public Part updatePart(Part part) {
        Part existingPart = partRepository.findById(part.getPartId()).orElse(null);
        if (existingPart != null) {
            return partRepository.save(part);
        }
        return null;
    }

    @Override
    public void deletePart(String id) {
        partRepository.deleteById(id);
    }

    @Override
    public List<Part> getParts() {
        return partRepository.findAll();
    }
}
