package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for vehicle-related business logic.
 * Handles CRUD and search operations for vehicles using DTOs with proper business rules.
 *
 * Performance Strategy:
 * - Pageable for operations that can return many records (getAllVehicles, search, etc.)
 * - Single DTO for operations that return exactly one record (getById, getByVin)
 * - List for operations that naturally return a small, fixed set (customer's vehicles if limited)
 */
@Service
public interface VehicleService {
    // ============= CRUD Operations =============
    VehicleResponseDTO getVehicleById(Long id); // Single record - no pagination needed
    VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO);
    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO);
    boolean deleteVehicle(Long id);

    // ============= Mass Data Operations - MUST have Pageable =============
    /**
     * Get all vehicles with search capability - ADMIN/STAFF only
     * @param pageable pagination info
     * @param search search term for vehicle name/model (optional)
     * @return paginated vehicle list
     */
    PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable, String search);

    /**
     * Search vehicles by multiple criteria - can return many results
     * @param model vehicle model filter (optional)
     * @param brand vehicle brand filter (optional)
     * @param pageable pagination info
     * @return paginated search results
     */
    PagedResponse<VehicleResponseDTO> searchVehicles(String model, String brand, Pageable pageable);

    /**
     * Get vehicles with warranty expiring soon - business intelligence
     * @param daysFromNow number of days to check ahead
     * @param pageable pagination info
     * @return paginated list of vehicles with expiring warranty
     */
    PagedResponse<VehicleResponseDTO> getVehiclesWithExpiringWarranty(int daysFromNow, Pageable pageable);

    // ============= Customer-specific Operations =============
    /**
     * Get vehicles by customer ID - ADMIN/STAFF only
     * @param customerId target customer ID
     * @param pageable pagination info (customer might have many vehicles)
     * @return paginated vehicle list for customer
     */
    PagedResponse<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId, Pageable pageable);

    /**
     * Get current user's vehicles - CUSTOMER only
     * @param authorizationHeader JWT token
     * @param pageable pagination info
     * @return paginated list of user's vehicles
     */
    PagedResponse<VehicleResponseDTO> getVehiclesByCurrentUser(String authorizationHeader, Pageable pageable);

    // ============= Single Record Operations - NO Pageable needed =============
    /**
     * Get vehicle by VIN - returns exactly one record or null
     * @param vin vehicle identification number (unique)
     * @return single vehicle or null
     */
    VehicleResponseDTO getVehicleByVin(String vin);

    // ============= Alternative: Simple List for small datasets =============
    /**
     * Get customer's vehicles as simple list (if customer vehicle count is always small)
     * Alternative to paginated version for better performance when count is guaranteed small
     * @param customerId target customer ID
     * @return list of customer's vehicles (max recommended: 20-50 items)
     */
    List<VehicleResponseDTO> getVehiclesByCustomerIdSimple(UUID customerId);
}
