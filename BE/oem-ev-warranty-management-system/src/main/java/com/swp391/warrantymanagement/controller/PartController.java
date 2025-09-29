package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    @Autowired
    private PartService partsService;


}
