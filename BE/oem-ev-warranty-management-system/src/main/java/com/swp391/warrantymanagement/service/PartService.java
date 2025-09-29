package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Part;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface PartService {
    Part getById(Long id);
    Part createPart(Part part);
    Part updatePart(Part part);
    void deletePart(Long id);
    List<Part> getParts();
}
