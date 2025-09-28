package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Parts;
import com.swp391.warrantymanagement.repository.PartsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartsServiceImpl implements PartsService {

    @Autowired // này là dùng reflection để tự động inject cái PartsRepository vào đây
    private PartsRepository partsRepository;

    @Override
    public Parts getById(int id) {
        return partsRepository.findById(id).orElse(null);
    }

    @Override
    public Parts createPart(Parts part) {
        return partsRepository.save(part);
    }

    @Override
    public Parts updatePart(Parts part) {
        Parts existingPart = partsRepository.findById(part.getPartId()).orElse(null);
        if (existingPart != null) {
            return partsRepository.save(part);
        }
        return null;
    }

    @Override
    public void deletePart(int id) {
        partsRepository.deleteById(id);
    }

    @Override
    public List<Parts> getParts() {
        return partsRepository.findAll();
    }
}
