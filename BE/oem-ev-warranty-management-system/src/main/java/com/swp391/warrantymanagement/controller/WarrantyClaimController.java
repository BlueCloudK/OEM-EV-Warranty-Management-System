package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    @Autowired
    private WarrantyClaimService warrantyClaimService;

    @GetMapping("/all") // http://localhost:8080/api/warranty-claims/all
    public String showList(Model model) { // Model là thùng chứa dữ liệu trả về view
        model.addAttribute("parts", warrantyClaimService.getWarrantyClaims()); // thêm dữ liệu vào model
        return "parts"; // trả view parts.html có thung chứa dữ liệu trong model
    }

    @GetMapping("/edit/{id}") // http://localhost:8080/api/warranty-claims/edit/{id}
    public String editPart(@PathVariable("id") Long id, Model model) { // Model là thùng chứa dữ liệu trả về view
        model.addAttribute("selectedOne", warrantyClaimService.getById(id)); // thêm dữ liệu vào model
        model.addAttribute("formMode", "edit");
        return "part-form"; // trả view parts.html có thung chứa dữ liệu trong model
    }

    @GetMapping("/edit/new") // http://localhost:8080/api/warranty-claims/edit/new
    public String createPart(Model model) { // Model là thùng chứa dữ liệu trả về view
        model.addAttribute("selectedOne", new WarrantyClaim()); // thêm dữ liệu vào model
        model.addAttribute("formMode", "create");
        return "part-form"; // trả view parts.html có thung chứa dữ liệu trong model
    }

    @PostMapping("/save") // http://localhost:8080/api/warranty-claims/save
    public String savePart(@Valid @ModelAttribute("selectedOne") WarrantyClaim warrantyClaim, BindingResult bindingResult
    , Model model, @RequestParam("formMode") String formMode) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("formMode", (warrantyClaim.getWarrantyClaimId() == null) ? "create" : "edit");
            return "part-form"; // nếu có lỗi thì trả về form để sửa
        }
        // Kiểm tra id để quyết định tạo mới hay cập nhật
        if (warrantyClaim.getWarrantyClaimId() == null) {
            // Tạo mới warranty claim
            warrantyClaimService.createWarrantyClaim(warrantyClaim);
        } else {
            // Cập nhật warranty claim có sẵn
            warrantyClaimService.updateWarrantyClaim(warrantyClaim);
        }
        return "redirect:/api/warranty-claims/all"; // redirect về trang danh sách
    }

    @GetMapping("/delete/{id}") // http://localhost:8080/api/warranty-claims/delete/{id}
    public String deletePart(@PathVariable("id") Long id) {
        warrantyClaimService.deleteWarrantyClaim(id);
        return "redirect:/api/warranty-claims/all"; // redirect về trang danh sách
    }
}
