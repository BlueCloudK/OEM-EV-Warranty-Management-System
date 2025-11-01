package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("PartRequestRepository Integration Tests")
class PartRequestRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PartRequestRepository partRequestRepository;

    private ServiceCenter serviceCenter1;

    @BeforeEach
    void setUp() {
        // Create Role
        Role role = new Role();
        role.setRoleName("SC_TECHNICIAN");
        entityManager.persist(role);

        // Create User
        User user = new User();
        user.setUsername("technician1");
        user.setEmail("tech1@test.com");
        user.setPassword("password");
        user.setRole(role);
        entityManager.persist(user);

        // Create Customer
        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setName("Test Customer");
        customer.setPhone("0987654321");
        customer.setUser(user);
        entityManager.persist(customer);

        // Create ServiceCenter
        serviceCenter1 = new ServiceCenter();
        serviceCenter1.setName("Test Service Center");
        serviceCenter1.setAddress("123 Test St");
        serviceCenter1.setPhone("111222333");
        serviceCenter1.setOpeningHours("9-5");
        serviceCenter1.setLatitude(BigDecimal.valueOf(10.0));
        serviceCenter1.setLongitude(BigDecimal.valueOf(106.0));
        entityManager.persist(serviceCenter1);

        // Create Vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName("Test Vehicle");
        vehicle.setVehicleModel("Model X");
        vehicle.setVehicleYear(2023);
        vehicle.setVehicleVin("VIN-PARTREQ-001");
        vehicle.setPurchaseDate(LocalDate.now());
        vehicle.setWarrantyStartDate(LocalDate.now());
        vehicle.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle.setMileage(1000);
        vehicle.setCustomer(customer);
        entityManager.persist(vehicle);

        // Create Part
        Part part = new Part();
        part.setPartName("Test Part");
        part.setPartNumber("PART-REQ-001");
        part.setManufacturer("Test Manufacturer");
        part.setPrice(BigDecimal.valueOf(1000.00));
        entityManager.persist(part);

        // Create InstalledPart
        InstalledPart installedPart = new InstalledPart();
        installedPart.setInstallationDate(LocalDate.now().minusMonths(6));
        installedPart.setWarrantyExpirationDate(LocalDate.now().plusYears(2));
        installedPart.setPart(part);
        installedPart.setVehicle(vehicle);
        entityManager.persist(installedPart);

        // Create WarrantyClaim
        WarrantyClaim warrantyClaim = new WarrantyClaim();
        warrantyClaim.setClaimDate(LocalDateTime.now());
        warrantyClaim.setStatus(WarrantyClaimStatus.PROCESSING);
        warrantyClaim.setVehicle(vehicle);
        warrantyClaim.setInstalledPart(installedPart);
        warrantyClaim.setServiceCenter(serviceCenter1);
        entityManager.persist(warrantyClaim);

        // Create PartRequest 1 with all required fields
        PartRequest request1 = new PartRequest();
        request1.setRequestDate(LocalDateTime.now());
        request1.setIssueDescription("Battery cell malfunction detected");
        request1.setStatus(PartRequestStatus.PENDING);
        request1.setQuantity(1);
        request1.setServiceCenter(serviceCenter1);
        request1.setRequestedBy(user);
        request1.setWarrantyClaim(warrantyClaim);
        request1.setFaultyPart(part);
        entityManager.persist(request1);

        // Create PartRequest 2 with all required fields
        PartRequest request2 = new PartRequest();
        request2.setRequestDate(LocalDateTime.now().minusDays(1));
        request2.setIssueDescription("Motor replacement needed");
        request2.setStatus(PartRequestStatus.APPROVED);
        request2.setQuantity(1);
        request2.setApprovedDate(LocalDateTime.now());
        request2.setServiceCenter(serviceCenter1);
        request2.setRequestedBy(user);
        request2.setWarrantyClaim(warrantyClaim);
        request2.setFaultyPart(part);
        entityManager.persist(request2);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by status should return a page of part requests")
    void findByStatus_ShouldReturnPagedRequests() {
        // Act
        Page<PartRequest> requestPage = partRequestRepository.findByStatus(PartRequestStatus.PENDING, PageRequest.of(0, 5));

        // Assert
        assertThat(requestPage).isNotNull();
        assertThat(requestPage.getTotalElements()).isEqualTo(1);
        assertThat(requestPage.getContent().get(0).getStatus()).isEqualTo(PartRequestStatus.PENDING);
    }

    @Test
    @DisplayName("Find pending requests should return only pending requests")
    void findPendingRequests_ShouldReturnOnlyPending() {
        // Act
        Page<PartRequest> requestPage = partRequestRepository.findPendingRequests(PageRequest.of(0, 5));

        // Assert
        assertThat(requestPage).isNotNull();
        assertThat(requestPage.getTotalElements()).isEqualTo(1);
        assertThat(requestPage.getContent().get(0).getStatus()).isEqualTo(PartRequestStatus.PENDING);
    }

    @Test
    @DisplayName("Count by status should return the correct count")
    void countByStatus_ShouldReturnCorrectCount() {
        // Act
        Long count = partRequestRepository.countByStatus(PartRequestStatus.APPROVED);

        // Assert
        assertThat(count).isEqualTo(1L);
    }
}
