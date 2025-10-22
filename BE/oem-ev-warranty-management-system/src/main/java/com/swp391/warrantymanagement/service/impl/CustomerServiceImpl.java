package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.*;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.mapper.CustomerMapper;
import com.swp391.warrantymanagement.mapper.FeedbackMapper;
import com.swp391.warrantymanagement.mapper.VehicleMapper;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public PagedResponse<CustomerResponseDTO> getAllCustomersPage(Pageable pageable, String search) {
        // Pageable: Object chứa thông tin phân trang từ request
        // - page: số trang (0-based), VD: page=0 là trang đầu
        // - size: số items per page, VD: size=10 là 10 records/trang
        // - sort: thông tin sắp xếp, VD: sort=name,asc
        // Frontend gửi: GET /customers?page=0&size=10&sort=name,asc

        Page<Customer> customerPage;

        if (search != null && !search.trim().isEmpty()) {
            // Repository tự động áp dụng pagination từ Pageable object
            customerPage = customerRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            // Spring Data JPA tự động LIMIT và OFFSET dựa trên Pageable
            customerPage = customerRepository.findAll(pageable);
        }

        List<CustomerResponseDTO> responseDTOs = CustomerMapper.toResponseDTOList(customerPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
    }

    @Override
    public CustomerResponseDTO getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id).orElse(null);
        return CustomerMapper.toResponseDTO(customer);
    }

    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO) {
        // Validate User tồn tại và có đầy đủ thông tin đăng ký
        User user = userRepository.findById(requestDTO.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + requestDTO.getUserId());
        }

        // Kiểm tra User đã có đầy đủ thông tin đăng ký chưa
        validateUserRegistrationComplete(user);

        // THAY ĐỔI LOGIC: Chỉ ADMIN hoặc STAFF mới được tạo Customer record cho khách hàng
        // Kiểm tra role của người ĐANG TẠO Customer (current authenticated user)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("Current user not found"));

        String currentUserRole = currentUser.getRole().getRoleName();
        if (!currentUserRole.equals("ADMIN") && !currentUserRole.equals("SC_STAFF") && !currentUserRole.equals("EVM_STAFF")) {
            throw new RuntimeException("Only ADMIN or STAFF can create customer records. Customers should update their own profile instead.");
        }

        // Validate phone không trùng lặp (phone là unique trong Customer entity)
        if (customerRepository.findByPhone(requestDTO.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already exists: " + requestDTO.getPhone());
        }

        // Convert DTO to Entity
        Customer customer = CustomerMapper.toEntity(requestDTO, user);

        // Save entity
        Customer savedCustomer = customerRepository.save(customer);

        // Convert entity back to response DTO
        return CustomerMapper.toResponseDTO(savedCustomer);
    }

    /**
     * Validate User đã hoàn thành đăng ký đầy đủ thông tin
     */
    private void validateUserRegistrationComplete(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("User registration incomplete: username is required");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("User registration incomplete: email is required");
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new RuntimeException("User registration incomplete: address is required");
        }

        if (user.getRole() == null) {
            throw new RuntimeException("User registration incomplete: role is required");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("User registration incomplete: password is required");
        }

        // Kiểm tra User account đã được kích hoạt (nếu có field isActive)
        // if (!user.isActive()) {
        //     throw new RuntimeException("User account is not activated");
        // }
    }

    @Override
    @Transactional
    public CustomerResponseDTO updateCustomer(UUID id, CustomerRequestDTO requestDTO) {
        Customer existingCustomer = customerRepository.findById(id).orElse(null);
        if (existingCustomer == null) {
            return null;
        }

        // Load User entity từ userId
        User user = userRepository.findById(requestDTO.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + requestDTO.getUserId());
        }

        // Update entity từ DTO
        CustomerMapper.updateEntity(existingCustomer, requestDTO, user);

        // Save updated entity
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        // Convert entity back to response DTO
        return CustomerMapper.toResponseDTO(updatedCustomer);
    }

    @Override
    @Transactional
    public boolean deleteCustomer(UUID id) {
        if (!customerRepository.existsById(id)) {
            return false;
        }
        customerRepository.deleteById(id);
        return true;
    }

    @Override
    public PagedResponse<CustomerResponseDTO> searchCustomersByName(String name, Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findByNameContainingIgnoreCase(name, pageable);
        List<CustomerResponseDTO> responseDTOs = CustomerMapper.toResponseDTOList(customerPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
    }

    @Override
    public CustomerResponseDTO getCustomerByEmail(String email) {
        // Email không còn trong Customer entity, giờ email trong User entity
        // Cần tìm User theo email, sau đó tìm Customer theo User
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        Customer customer = customerRepository.findByUser(user);
        return customer != null ? CustomerMapper.toResponseDTO(customer) : null;
    }

    @Override
    public CustomerResponseDTO getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone).orElse(null);
        return customer != null ? CustomerMapper.toResponseDTO(customer) : null;
    }

    @Override
    public PagedResponse<CustomerResponseDTO> getCustomersByUserId(Long userId, Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findByUserUserId(userId, pageable);
        List<CustomerResponseDTO> responseDTOs = CustomerMapper.toResponseDTOList(customerPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
    }

    @Override
    @Transactional
    public CustomerResponseDTO updateCustomerProfile(CustomerRequestDTO requestDTO, String authorizationHeader) {
        // Extract JWT token từ Authorization header
//        String token = authorizationHeader.replace("Bearer ", "");

        // Sử dụng JwtService để extract username từ token
        // TODO: Inject JwtService để sử dụng
        // String username = jwtService.extractUsername(token);
        // User currentUser = userRepository.findByUsername(username);

        // Tạm thời validate bằng userId trong requestDTO
        User user = userRepository.findById(requestDTO.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Chỉ cho phép role CUSTOMER cập nhật profile
        if (!user.getRole().getRoleName().equals("CUSTOMER")) {
            throw new RuntimeException("Only customers can update their own profile");
        }

        // Tìm Customer record của User này
        Customer existingCustomer = customerRepository.findByUserUserId(user.getUserId(), Pageable.unpaged())
                .getContent().stream().findFirst().orElse(null);

        if (existingCustomer == null) {
            throw new RuntimeException("Customer profile not found. Please contact administrator to create your profile.");
        }

        // Validate phone không trùng với customer khác (trừ chính mình)
        Customer phoneOwner = customerRepository.findByPhone(requestDTO.getPhone()).orElse(null);
        if (phoneOwner != null && !phoneOwner.getCustomerId().equals(existingCustomer.getCustomerId())) {
            throw new RuntimeException("Phone number already exists: " + requestDTO.getPhone());
        }

        // Update customer profile
        CustomerMapper.updateEntity(existingCustomer, requestDTO, user);
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        return CustomerMapper.toResponseDTO(updatedCustomer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileResponseDTO getCustomerFullProfile(UUID customerId) {
        // Find customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        // Build profile DTO
        CustomerProfileResponseDTO profile = new CustomerProfileResponseDTO();

        // Basic customer info
        profile.setCustomerId(customer.getCustomerId());
        profile.setCustomerName(customer.getName());
        profile.setCustomerEmail(customer.getUser().getEmail());
        profile.setCustomerPhone(customer.getPhone());
        profile.setAddress(customer.getUser().getAddress());

        // User account info
        profile.setUserId(customer.getUser().getUserId());
        profile.setUsername(customer.getUser().getUsername());
        profile.setAccountCreatedAt(customer.getUser().getCreatedAt());

        // Vehicles
        List<VehicleResponseDTO> vehicles = customer.getVehicles().stream()
                .map(VehicleMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setVehicles(vehicles);
        profile.setTotalVehicles(vehicles.size());

        // Warranty claims
        List<WarrantyClaimResponseDTO> claims = customer.getVehicles().stream()
                .flatMap(vehicle -> vehicle.getWarrantyClaims().stream())
                .map(WarrantyClaimMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setWarrantyClaims(claims);
        profile.setTotalClaims(claims.size());

        // Count completed and pending claims
        long completedCount = claims.stream()
                .filter(claim -> claim.getStatus() == WarrantyClaimStatus.COMPLETED)
                .count();
        long pendingCount = claims.stream()
                .filter(claim -> claim.getStatus() != WarrantyClaimStatus.COMPLETED
                        && claim.getStatus() != WarrantyClaimStatus.REJECTED)
                .count();
        profile.setCompletedClaims((int) completedCount);
        profile.setPendingClaims((int) pendingCount);

        // Feedbacks
        List<FeedbackResponseDTO> feedbacks = customer.getFeedbacks().stream()
                .map(FeedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setFeedbacks(feedbacks);
        profile.setTotalFeedbacks(feedbacks.size());

        return profile;
    }
}
