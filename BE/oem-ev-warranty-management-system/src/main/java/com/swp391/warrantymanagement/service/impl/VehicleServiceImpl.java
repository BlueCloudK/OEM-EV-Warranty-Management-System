package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.exception.DuplicateResourceException;
import com.swp391.warrantymanagement.exception.ResourceInUseException;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.mapper.VehicleMapper;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.VehicleService;import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service implementation quản lý thông tin xe điện EV.
 * Cung cấp các chức năng CRUD, tìm kiếm, lọc xe theo customer, VIN, model, brand, và theo warranty.
 *
 * <p><strong>Chức năng chính:</strong>
 * <ul>
 *   <li>CRUD operations: Tạo, đọc, cập nhật, xóa vehicle</li>
 *   <li>Tìm kiếm xe theo VIN (17 ký tự unique identifier), model, brand</li>
 *   <li>Lấy danh sách xe theo customerId hoặc JWT token của user đang login</li>
 *   <li>Theo dõi xe có warranty sắp hết hạn</li>
 * </ul>
 *
 * <p><strong>Business rules:</strong>
 * <ul>
 *   <li>VIN phải unique trong toàn hệ thống (như CMND/CCCD của xe)</li>
 *   <li>Vehicle phải thuộc về một customer hợp lệ</li>
 *   <li>Warranty mặc định: 3 năm kể từ năm sản xuất</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách tất cả xe với phân trang và tìm kiếm theo brand hoặc model.
     * Hỗ trợ tìm kiếm case-insensitive trong vehicleName (brand) và vehicleModel.
     *
     * @param pageable thông tin phân trang (page, size, sort)
     * @param search từ khóa tìm kiếm (optional) - tìm trong brand hoặc model
     * @return PagedResponse chứa danh sách VehicleResponseDTO và metadata phân trang
     */
    @Override
    public PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable, String search) {
        Page<Vehicle> vehiclePage;

        if (search != null && !search.trim().isEmpty()) {
            vehiclePage = vehicleRepository.findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(
                search, search, pageable);
        } else {
            vehiclePage = vehicleRepository.findAll(pageable);
        }

        List<VehicleResponseDTO> responseDTOs = VehicleMapper.toResponseDTOList(vehiclePage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            vehiclePage.getNumber(),
            vehiclePage.getSize(),
            vehiclePage.getTotalElements(),
            vehiclePage.getTotalPages(),
            vehiclePage.isFirst(),
            vehiclePage.isLast()
        );
    }

    /**
     * Lấy thông tin xe theo vehicleId.
     *
     * @param id vehicleId cần tìm
     * @return VehicleResponseDTO chứa thông tin xe
     * @throws ResourceNotFoundException nếu không tìm thấy vehicle với id này
     */
    @Override
    public VehicleResponseDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        return VehicleMapper.toResponseDTO(vehicle);
    }

    /**
     * Tạo mới vehicle và gán cho customer.
     *
     * <p><strong>Validation:</strong>
     * <ul>
     *   <li>Customer phải tồn tại trong database</li>
     *   <li>VIN phải unique (không được trùng với xe khác trong hệ thống)</li>
     * </ul>
     *
     * @param requestDTO thông tin vehicle cần tạo (VIN, name, model, year, customerId)
     * @return VehicleResponseDTO chứa thông tin xe vừa tạo kèm vehicleId được generate
     * @throws ResourceNotFoundException nếu không tìm thấy customer với customerId
     * @throws DuplicateResourceException nếu VIN đã tồn tại trong hệ thống
     */
    @Override
    @Transactional
    public VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO) {
        Customer customer = customerRepository.findById(UUID.fromString(requestDTO.getCustomerId()))
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", requestDTO.getCustomerId()));

        Optional.ofNullable(vehicleRepository.findByVehicleVin(requestDTO.getVehicleVin())).ifPresent(v -> {
            throw new DuplicateResourceException("Vehicle", "VIN", requestDTO.getVehicleVin());
        });

        Vehicle vehicle = VehicleMapper.toEntity(requestDTO, customer);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return VehicleMapper.toResponseDTO(savedVehicle);
    }

    /**
     * Cập nhật thông tin vehicle theo vehicleId.
     * Cho phép thay đổi VIN và transfer ownership sang customer khác.
     *
     * <p><strong>Validation:</strong>
     * <ul>
     *   <li>Vehicle phải tồn tại trong database</li>
     *   <li>Customer mới phải tồn tại trong database</li>
     *   <li>VIN mới phải unique (nếu thay đổi VIN, không được trùng với xe khác)</li>
     * </ul>
     *
     * @param id vehicleId cần cập nhật
     * @param requestDTO thông tin vehicle mới (VIN, name, model, year, customerId)
     * @return VehicleResponseDTO chứa thông tin xe đã cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy vehicle hoặc customer
     * @throws DuplicateResourceException nếu VIN mới đã tồn tại ở xe khác
     */
    @Override
    @Transactional
    public VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        Customer customer = customerRepository.findById(UUID.fromString(requestDTO.getCustomerId()))
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", requestDTO.getCustomerId()));

        Optional<Vehicle> existingVinVehicleOpt = vehicleRepository.findByVehicleVin(requestDTO.getVehicleVin());
        existingVinVehicleOpt.ifPresent(existingVinVehicle -> {
            if (!existingVinVehicle.getVehicleId().equals(id)) {
                throw new DuplicateResourceException("Vehicle", "VIN", requestDTO.getVehicleVin());
            }
        });

        VehicleMapper.updateEntity(existingVehicle, requestDTO, customer);
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);

        return VehicleMapper.toResponseDTO(updatedVehicle);
    }

    /**
     * Xóa vehicle theo vehicleId.
     * Chỉ cho phép xóa khi vehicle không có warranty claims hoặc service history liên quan.
     *
     * @param id vehicleId cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy vehicle với id này
     * @throws ResourceInUseException nếu vehicle có warranty claims hoặc service history liên quan
     */
    @Override
    @Transactional
    public Boolean deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        if (!vehicle.getWarrantyClaims().isEmpty() || !vehicle.getServiceHistories().isEmpty()) {
            throw new ResourceInUseException("Cannot delete vehicle with ID " + id + " because it has associated warranty claims or service history.");
        }

        vehicleRepository.delete(vehicle);
        return true;
    }

    /**
     * Lấy danh sách xe thuộc về customer cụ thể với phân trang.
     *
     * @param customerId customerId cần lọc xe
     * @param pageable thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách VehicleResponseDTO và metadata phân trang
     */
    @Override
    public PagedResponse<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId, Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleRepository.findByCustomerCustomerId(customerId, pageable);
        List<VehicleResponseDTO> responseDTOs = VehicleMapper.toResponseDTOList(vehiclePage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            vehiclePage.getNumber(),
            vehiclePage.getSize(),
            vehiclePage.getTotalElements(),
            vehiclePage.getTotalPages(),
            vehiclePage.isFirst(),
            vehiclePage.isLast()
        );
    }

    /**
     * Lấy danh sách xe của user đang login dựa trên username từ JWT token.
     * User phải có customer profile (role CUSTOMER) để xem được xe của mình.
     *
     * @param username username của user đang login (extract từ JWT token)
     * @param pageable thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách VehicleResponseDTO của customer
     * @throws ResourceNotFoundException nếu không tìm thấy user hoặc customer profile
     */
    @Override
    public PagedResponse<VehicleResponseDTO> getVehiclesByCurrentUser(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        return getVehiclesByCustomerId(customer.getCustomerId(), pageable);
    }

    /**
     * Tìm vehicle theo VIN (Vehicle Identification Number - 17 ký tự unique identifier).
     *
     * @param vin VIN cần tìm (17 ký tự alphanumeric)
     * @return VehicleResponseDTO chứa thông tin xe
     * @throws ResourceNotFoundException nếu không tìm thấy vehicle với VIN này
     */
    @Override
    public VehicleResponseDTO getVehicleByVin(String vin) {
        Vehicle vehicle = vehicleRepository.findByVehicleVin(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "VIN", vin));

        return VehicleMapper.toResponseDTO(vehicle);
    }

    /**
     * Tìm kiếm xe theo model và/hoặc brand với phân trang.
     * Hỗ trợ tìm kiếm case-insensitive và partial match.
     *
     * <p><strong>Các trường hợp tìm kiếm:</strong>
     * <ul>
     *   <li>Cả model và brand: AND condition - tìm xe khớp cả hai</li>
     *   <li>Chỉ model: tìm trong vehicleModel (bất kỳ brand nào)</li>
     *   <li>Chỉ brand: tìm trong vehicleName (bất kỳ model nào)</li>
     *   <li>Không có filter: trả về tất cả xe</li>
     * </ul>
     *
     * @param model từ khóa tìm trong vehicleModel (optional)
     * @param brand từ khóa tìm trong vehicleName (optional)
     * @param pageable thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách VehicleResponseDTO và metadata phân trang
     */
    @Override
    public PagedResponse<VehicleResponseDTO> searchVehicles(String model, String brand, Pageable pageable) {
        Page<Vehicle> vehiclePage;

        if (model != null && brand != null) {
            vehiclePage = vehicleRepository.findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(
                model, brand, pageable);
        } else if (model != null) {
            vehiclePage = vehicleRepository.findByVehicleModelContainingIgnoreCase(model, pageable);
        } else if (brand != null) {
            vehiclePage = vehicleRepository.findByVehicleNameContainingIgnoreCase(brand, pageable);
        } else {
            vehiclePage = vehicleRepository.findAll(pageable);
        }

        List<VehicleResponseDTO> responseDTOs = VehicleMapper.toResponseDTOList(vehiclePage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            vehiclePage.getNumber(),
            vehiclePage.getSize(),
            vehiclePage.getTotalElements(),
            vehiclePage.getTotalPages(),
            vehiclePage.isFirst(),
            vehiclePage.isLast()
        );
    }

    /**
     * Lấy danh sách xe có warranty sắp hết hạn trong số ngày chỉ định.
     * Tính toán dựa trên vehicleYear và warranty period mặc định 3 năm.
     *
     * @param daysFromNow số ngày tính từ hiện tại để lọc warranty sắp hết hạn
     * @param pageable thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách VehicleResponseDTO có warranty sắp hết hạn
     */
    @Override
    public PagedResponse<VehicleResponseDTO> getVehiclesWithExpiringWarranty(int daysFromNow, Pageable pageable) {
        int currentYear = LocalDate.now().getYear();
        int warrantyYears = 3;
        int cutoffYear = currentYear - warrantyYears + (daysFromNow / 365);

        Page<Vehicle> vehiclePage = vehicleRepository.findByVehicleYearLessThanEqual(cutoffYear, pageable);
        List<VehicleResponseDTO> responseDTOs = VehicleMapper.toResponseDTOList(vehiclePage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            vehiclePage.getNumber(),
            vehiclePage.getSize(),
            vehiclePage.getTotalElements(),
            vehiclePage.getTotalPages(),
            vehiclePage.isFirst(),
            vehiclePage.isLast()
        );
    }
}
