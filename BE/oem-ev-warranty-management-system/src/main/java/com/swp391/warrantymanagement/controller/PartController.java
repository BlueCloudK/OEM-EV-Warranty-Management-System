package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    public String showList(Model model) { // Model là thùng chứa dữ liệu trả về view
        model.addAttribute("parts", partService.getParts()); // thêm dữ liệu vào model

        return "parts"; // trả view parts.html có thung chứa dữ liệu trong model
    }
}
