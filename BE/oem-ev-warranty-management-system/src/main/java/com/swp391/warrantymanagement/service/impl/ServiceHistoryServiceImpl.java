package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.ServiceHistoryDetail;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import com.swp391.warrantymanagement.mapper.ServiceHistoryMapper;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

/**
 * Service quản lý lịch sử bảo dưỡng/sửa chữa xe.
 * Theo dõi service history và parts đã sử dụng (composite key pattern).
 */
@Service
@RequiredArgsConstructor
public class ServiceHistoryServiceImpl implements ServiceHistoryService {

    private final ServiceHistoryRepository serviceHistoryRepository;
    private final PartRepository partRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    /**
     * Lấy tất cả service histories với pagination và search.
     *
     * @param pageable pagination parameters
     * @param search từ khóa tìm kiếm chung trong serviceType, description, vehicleName, hoặc VIN
     * @return PagedResponse với service histories
     */
    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable, String search) {
        Page<ServiceHistory> serviceHistoryPage;
        if (search != null && !search.trim().isEmpty()) {
            // Search in serviceType, description, vehicleName, and VIN
            serviceHistoryPage = serviceHistoryRepository.searchServiceHistoriesGeneral(search.trim(), pageable);
        } else {
            serviceHistoryPage = serviceHistoryRepository.findAll(pageable);
        }

        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    /**
     * Lấy service history theo ID.
     *
     * @param id service history ID
     * @return ServiceHistoryResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    public ServiceHistoryResponseDTO getServiceHistoryById(Long id) {
        ServiceHistory serviceHistory = serviceHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceHistory", "id", id));
        return ServiceHistoryMapper.toResponseDTO(serviceHistory);
    }

    /**
     * Tạo service history mới với part sử dụng (composite key pattern).
     *
     * @param requestDTO thông tin service history và partId
     * @return ServiceHistoryResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy part hoặc vehicle
     */
    @Override
    @Transactional
    public ServiceHistoryResponseDTO createServiceHistory(ServiceHistoryRequestDTO requestDTO) {
        Part part = partRepository.findById(requestDTO.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", requestDTO.getPartId()));

        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        ServiceHistory serviceHistory = ServiceHistoryMapper.toEntity(requestDTO, vehicle);
        ServiceHistory savedServiceHistory = serviceHistoryRepository.save(serviceHistory);

        // Tạo ServiceHistoryDetail với composite key
        ServiceHistoryDetail detail = new ServiceHistoryDetail();
        ServiceHistoryDetailId detailId = new ServiceHistoryDetailId();
        detailId.setServiceHistoryId(savedServiceHistory.getServiceHistoryId());
        detailId.setPartId(part.getPartId());

        detail.setId(detailId);
        detail.setServiceHistory(savedServiceHistory);
        detail.setPart(part);
        detail.setQuantity(1);

        savedServiceHistory.getServiceHistoryDetails().add(detail);
        savedServiceHistory = serviceHistoryRepository.save(savedServiceHistory);

        return ServiceHistoryMapper.toResponseDTO(savedServiceHistory);
    }

    /**
     * Cập nhật service history (không update parts).
     *
     * @param id service history ID
     * @param requestDTO thông tin mới
     * @return ServiceHistoryResponseDTO
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional
    public ServiceHistoryResponseDTO updateServiceHistory(Long id, ServiceHistoryRequestDTO requestDTO) {
        ServiceHistory existingServiceHistory = serviceHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceHistory", "id", id));

        ServiceHistoryMapper.updateEntity(existingServiceHistory, requestDTO);
        ServiceHistory updatedServiceHistory = serviceHistoryRepository.save(existingServiceHistory);

        return ServiceHistoryMapper.toResponseDTO(updatedServiceHistory);
    }

    /**
     * Xóa service history (cascade delete ServiceHistoryDetails).
     *
     * @param id service history ID
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    @Override
    @Transactional
    public void deleteServiceHistory(Long id) {
        if (!serviceHistoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceHistory", "id", id);
        }

        serviceHistoryRepository.deleteById(id);
    }

    /**
     * Lấy service histories theo vehicle ID.
     *
     * @param vehicleId vehicle ID
     * @param pageable pagination parameters
     * @return PagedResponse với service histories của vehicle
     */
    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId, Pageable pageable) {
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByVehicleVehicleId(vehicleId, pageable);
        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    /**
     * Lấy service histories theo part ID (through junction table).
     *
     * @param partId part ID
     * @param pageable pagination parameters
     * @return PagedResponse với service histories sử dụng part
     */
    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId, Pageable pageable) {
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByServiceHistoryDetailsPartPartId(partId, pageable);
        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    /**
     * Lấy service histories của current user (customer's vehicles).
     *
     * @param username username từ JWT
     * @param pageable pagination parameters
     * @return PagedResponse với service histories của customer
     * @throws ResourceNotFoundException nếu không tìm thấy user hoặc customer profile
     */
    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByCurrentUser(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByVehicleCustomerCustomerId(
            customer.getCustomerId(), pageable);

        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    /**
     * Lấy service histories trong khoảng thời gian (date range filter).
     *
     * @param startDate ngày bắt đầu (format: yyyy-MM-dd)
     * @param endDate ngày kết thúc (format: yyyy-MM-dd)
     * @param pageable pagination parameters
     * @return PagedResponse với service histories trong date range
     * @throws IllegalArgumentException nếu date format không hợp lệ
     */
    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByDateRange(String startDate, String endDate, Pageable pageable) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);

            Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByServiceDateBetween(
                start, end, pageable);

            List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

            return new PagedResponse<>(
                responseDTOs,
                serviceHistoryPage.getNumber(),
                serviceHistoryPage.getSize(),
                serviceHistoryPage.getTotalElements(),
                serviceHistoryPage.getTotalPages(),
                serviceHistoryPage.isFirst(),
                serviceHistoryPage.isLast()
            );
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd format.", e);
        }
    }
}
