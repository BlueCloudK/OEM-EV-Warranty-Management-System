package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.*;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.mapper.CustomerMapper;
import com.swp391.warrantymanagement.mapper.FeedbackMapper;
import com.swp391.warrantymanagement.mapper.VehicleMapper;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.exception.ResourceInUseException;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.service.CustomerService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation của CustomerService
 * Xử lý CRUD operations, search, và profile management cho Customer
 */
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Lấy danh sách customers với pagination và search
     *
     * @param pageable thông tin phân trang và sorting
     * @param search từ khóa tìm kiếm theo tên (optional)
     * @return PagedResponse với danh sách CustomerResponseDTO
     */
    @Override
    public PagedResponse<CustomerResponseDTO> getAllCustomersPage(Pageable pageable, String search) {
        Page<Customer> customerPage;

        if (search != null && !search.trim().isEmpty()) {
            customerPage = customerRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
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

    /**
     * Lấy customer theo ID
     *
     * @param id UUID của customer
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu customer không tồn tại
     */
    @Override
    public CustomerResponseDTO getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return CustomerMapper.toResponseDTO(customer);
    }

    /**
     * Tạo customer mới (dành cho ADMIN/STAFF)
     *
     * @param requestDTO chứa userId, name, phone
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu user không tồn tại
     * @throws IllegalArgumentException nếu phone đã tồn tại
     */
    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO) {
        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        String currentUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new IllegalStateException("Cannot create customer without being authenticated"));
        User currentUser = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        if (customerRepository.findByPhone(requestDTO.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        Customer customer = CustomerMapper.toEntity(requestDTO, user);
        Customer savedCustomer = customerRepository.save(customer);

        return CustomerMapper.toResponseDTO(savedCustomer);
    }

    /**
     * Cập nhật customer
     *
     * @param id UUID của customer
     * @param requestDTO chứa thông tin cập nhật
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu customer hoặc user không tồn tại
     * @throws IllegalArgumentException nếu phone đã được sử dụng bởi customer khác
     */
    @Override
    @Transactional
    public CustomerResponseDTO updateCustomer(UUID id, CustomerRequestDTO requestDTO) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        if (requestDTO.getPhone() != null && !requestDTO.getPhone().equals(existingCustomer.getPhone())) {
            customerRepository.findByPhone(requestDTO.getPhone()).ifPresent(phoneOwner -> {
                if (!phoneOwner.getCustomerId().equals(id)) {
                    throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
                }
            });
        }

        CustomerMapper.updateEntity(existingCustomer, requestDTO, user);
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        return CustomerMapper.toResponseDTO(updatedCustomer);
    }

    /**
     * Xóa customer (hard delete)
     *
     * @param id UUID của customer
     * @throws ResourceNotFoundException nếu customer không tồn tại
     * @throws ResourceInUseException nếu customer còn sở hữu vehicles
     */
    @Override
    @Transactional
    public void deleteCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (vehicleRepository.existsByCustomer((customer))) {
            throw new ResourceInUseException("Cannot delete customer with ID " + id + " because they still own one or more vehicles.");
        }

        customerRepository.delete(customer);
    }

    /**
     * Tìm kiếm customers theo tên với pagination
     *
     * @param name từ khóa tìm kiếm (case-insensitive)
     * @param pageable thông tin phân trang
     * @return PagedResponse với danh sách CustomerResponseDTO
     */
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

    /**
     * Tìm customer theo email (trong User entity)
     *
     * @param email email của user
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu user hoặc customer profile không tồn tại
     */
    @Override
    public CustomerResponseDTO getCustomerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user with email", email));

        return CustomerMapper.toResponseDTO(customer);
    }

    /**
     * Tìm customer theo phone
     *
     * @param phone số điện thoại
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu customer không tồn tại
     */
    @Override
    public CustomerResponseDTO getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "phone", phone));

        return CustomerMapper.toResponseDTO(customer);
    }

    /**
     * Lấy danh sách customers theo userId với pagination
     *
     * @param userId ID của user
     * @param pageable thông tin phân trang
     * @return PagedResponse với danh sách CustomerResponseDTO
     */
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

    /**
     * Cập nhật customer profile (dành cho CUSTOMER tự update)
     *
     * @param username username từ Security Context
     * @param requestDTO chứa thông tin cập nhật
     * @return CustomerResponseDTO
     * @throws ResourceNotFoundException nếu user hoặc customer profile không tồn tại
     * @throws IllegalStateException nếu user không có role CUSTOMER
     * @throws IllegalArgumentException nếu phone đã được sử dụng bởi customer khác
     */
    @Override
    @Transactional
    public CustomerResponseDTO updateCustomerProfile(String username, CustomerRequestDTO requestDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Role userRole = user.getRole();
        if (userRole == null || !"ROLE_CUSTOMER".equals(userRole.getRoleName())) {
            throw new IllegalStateException("Only users with CUSTOMER role can update their profile.");
        }

        Customer existingCustomer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        Optional<Customer> phoneOwnerOpt = customerRepository.findByPhone(requestDTO.getPhone());
        if (phoneOwnerOpt.isPresent() && !phoneOwnerOpt.get().getCustomerId().equals(existingCustomer.getCustomerId())) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        existingCustomer.setName(requestDTO.getName());
        existingCustomer.setPhone(requestDTO.getPhone());

        if (requestDTO.getAddress() != null) {
            user.setAddress(requestDTO.getAddress());
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);

        return CustomerMapper.toResponseDTO(updatedCustomer);
    }

    /**
     * Lấy customer profile đầy đủ với vehicles, claims, và feedbacks
     *
     * @param customerId UUID của customer
     * @return CustomerProfileResponseDTO với thông tin đầy đủ
     * @throws ResourceNotFoundException nếu customer không tồn tại
     */
    @Override
    @Transactional(readOnly = true)
    public CustomerProfileResponseDTO getCustomerFullProfile(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        CustomerProfileResponseDTO profile = new CustomerProfileResponseDTO();

        // Set customer và user info
        profile.setCustomerId(customer.getCustomerId());
        profile.setCustomerName(customer.getName());
        profile.setCustomerPhone(customer.getPhone());
        profile.setCustomerEmail(customer.getUser().getEmail());
        profile.setAddress(customer.getUser().getAddress());
        profile.setUserId(customer.getUser().getUserId());
        profile.setUsername(customer.getUser().getUsername());
        profile.setAccountCreatedAt(customer.getUser().getCreatedAt());

        // Aggregate vehicles
        List<VehicleResponseDTO> vehicles = customer.getVehicles().stream()
                .map(VehicleMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setVehicles(vehicles);
        profile.setTotalVehicles(vehicles.size());

        // Aggregate warranty claims từ vehicles
        List<WarrantyClaimResponseDTO> claims = customer.getVehicles().stream()
                .flatMap(vehicle -> vehicle.getWarrantyClaims().stream())
                .map(WarrantyClaimMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setWarrantyClaims(claims);
        profile.setTotalClaims(claims.size());

        // Calculate claim statistics
        long completedCount = claims.stream()
                .filter(claim -> claim.getStatus() == WarrantyClaimStatus.COMPLETED)
                .count();
        long pendingCount = claims.stream()
                .filter(claim -> claim.getStatus() != WarrantyClaimStatus.COMPLETED
                        && claim.getStatus() != WarrantyClaimStatus.REJECTED)
                .count();
        profile.setCompletedClaims((int) completedCount);
        profile.setPendingClaims((int) pendingCount);

        // Aggregate feedbacks
        List<FeedbackResponseDTO> feedbacks = customer.getFeedbacks().stream()
                .map(FeedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
        profile.setFeedbacks(feedbacks);
        profile.setTotalFeedbacks(feedbacks.size());

        return profile;
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileResponseDTO getCustomerProfileByUsername(String username) {
        // Step 1: Find the user by username.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Step 2: Find the associated customer profile.
        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        // Step 3: Reuse the existing logic to get the full profile.
        return getCustomerFullProfile(customer.getCustomerId());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerProfileResponseDTO> findCustomerProfileByUsername(String username) {
        // This method returns an Optional and does not throw an exception if not found.
        return userRepository.findByUsername(username)
                .flatMap(user ->
                        Optional.ofNullable(customerRepository.findByUser(user))
                                .map(customer -> getCustomerFullProfile(customer.getCustomerId()))
                );
    }
}
