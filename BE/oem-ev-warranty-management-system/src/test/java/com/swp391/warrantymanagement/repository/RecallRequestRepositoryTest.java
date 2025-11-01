package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("RecallRequestRepository Integration Tests")
class RecallRequestRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private RecallRequestRepository recallRequestRepository;

    private RecallRequest testRecallRequest;

    @BeforeEach
    void setUp() {
        // Create Role
        Role role = new Role();
        role.setRoleName("EVM_STAFF");
        entityManager.persist(role);

        // Create User
        User evmStaff = new User();
        evmStaff.setUsername("evmstaff");
        evmStaff.setEmail("evm@test.com");
        evmStaff.setPassword("password");
        evmStaff.setRole(role);
        entityManager.persist(evmStaff);

        // Create Customer
        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setName("Test Customer");
        customer.setPhone("0987654321");
        customer.setUser(evmStaff);
        entityManager.persist(customer);

        // Create Vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName("Test Vehicle");
        vehicle.setVehicleModel("Model X");
        vehicle.setVehicleYear(2023);
        vehicle.setVehicleVin("VIN-RECALL-001");
        vehicle.setPurchaseDate(LocalDate.now());
        vehicle.setWarrantyStartDate(LocalDate.now());
        vehicle.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle.setMileage(1000);
        vehicle.setCustomer(customer);
        entityManager.persist(vehicle);

        // Create Part
        Part part = new Part();
        part.setPartName("Faulty Battery");
        part.setPartNumber("PART-RECALL-001");
        part.setManufacturer("Test Manufacturer");
        part.setPrice(BigDecimal.valueOf(5000.00));
        entityManager.persist(part);

        // Create InstalledPart
        InstalledPart installedPart = new InstalledPart();
        installedPart.setInstallationDate(LocalDate.now().minusMonths(6));
        installedPart.setWarrantyExpirationDate(LocalDate.now().plusYears(2));
        installedPart.setPart(part);
        installedPart.setVehicle(vehicle);
        entityManager.persist(installedPart);

        // Create RecallRequest
        testRecallRequest = new RecallRequest();
        testRecallRequest.setInstalledPart(installedPart);
        testRecallRequest.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
        testRecallRequest.setReason("Battery defect detected");
        testRecallRequest.setCreatedBy(evmStaff);
        entityManager.persist(testRecallRequest);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by ID should return the correct recall request")
    void findById_ShouldReturnCorrectRecallRequest() {
        // Act
        Optional<RecallRequest> found = recallRequestRepository.findById(testRecallRequest.getRecallRequestId());

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getReason()).isEqualTo("Battery defect detected");
        assertThat(found.get().getStatus()).isEqualTo(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
    }

    @Test
    @DisplayName("Find all should return all recall requests")
    void findAll_ShouldReturnAllRecallRequests() {
        // Act
        List<RecallRequest> requests = recallRequestRepository.findAll();

        // Assert
        assertThat(requests).hasSize(1);
        assertThat(requests.get(0).getReason()).isEqualTo("Battery defect detected");
    }

    @Test
    @DisplayName("Save recall request should persist successfully")
    void saveRecallRequest_ShouldPersistSuccessfully() {
        // Arrange - get existing entities from setUp
        RecallRequest newRequest = new RecallRequest();
        newRequest.setInstalledPart(testRecallRequest.getInstalledPart());
        newRequest.setStatus(RecallRequestStatus.APPROVED_BY_ADMIN);
        newRequest.setReason("Safety recall for battery");
        newRequest.setCreatedBy(testRecallRequest.getCreatedBy());

        // Act
        RecallRequest saved = recallRequestRepository.save(newRequest);

        // Assert
        assertThat(saved.getRecallRequestId()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(RecallRequestStatus.APPROVED_BY_ADMIN);
        assertThat(recallRequestRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("Delete recall request should remove it from database")
    void deleteRecallRequest_ShouldRemoveFromDatabase() {
        // Arrange
        Long requestId = testRecallRequest.getRecallRequestId();

        // Act
        recallRequestRepository.delete(testRecallRequest);
        entityManager.flush();

        // Assert
        Optional<RecallRequest> found = recallRequestRepository.findById(requestId);
        assertThat(found).isEmpty();
        assertThat(recallRequestRepository.findAll()).isEmpty();
    }
}
