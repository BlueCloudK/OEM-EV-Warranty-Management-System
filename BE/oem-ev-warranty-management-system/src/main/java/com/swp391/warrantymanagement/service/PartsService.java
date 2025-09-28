package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Parts;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface PartsService {
    public Parts getById(int id);
    public Parts createPart(Parts part);
    public Parts updatePart(Parts part);
    public void deletePart(int id);
    public List<Parts> getParts();
}
