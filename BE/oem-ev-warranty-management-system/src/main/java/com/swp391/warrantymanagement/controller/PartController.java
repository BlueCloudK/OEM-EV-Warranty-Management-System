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


}
