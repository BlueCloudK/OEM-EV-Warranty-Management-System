package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.*;
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
@DisplayName("WorkLogRepository Integration Tests")
class WorkLogRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private WorkLogRepository workLogRepository;

    private User user1;
    private WarrantyClaim claim1;

    @BeforeEach
    void setUp() {
        // Create Role
        Role userRole = new Role();
        userRole.setRoleName("SC_TECHNICIAN");
        entityManager.persist(userRole);

        // Create User
        user1 = new User();
        user1.setUsername("tech1");
        user1.setEmail("tech1@example.com");
        user1.setPassword("password");
        user1.setRole(userRole);
        entityManager.persist(user1);

        // Create Customer
        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setName("Test Customer");
        customer.setPhone("0987654321");
        customer.setUser(user1);
        entityManager.persist(customer);

        // Create ServiceCenter
        ServiceCenter serviceCenter = new ServiceCenter();
        serviceCenter.setName("Test Service Center");
        serviceCenter.setAddress("123 Test St");
        serviceCenter.setPhone("111222333");
        serviceCenter.setOpeningHours("9-5");
        serviceCenter.setLatitude(BigDecimal.valueOf(10.0));
        serviceCenter.setLongitude(BigDecimal.valueOf(106.0));
        entityManager.persist(serviceCenter);

        // Create Vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName("Test Vehicle");
        vehicle.setVehicleModel("Model X");
        vehicle.setVehicleYear(2023);
        vehicle.setVehicleVin("VIN-WORKLOG-001");
        vehicle.setPurchaseDate(LocalDate.now());
        vehicle.setWarrantyStartDate(LocalDate.now());
        vehicle.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle.setMileage(1000);
        vehicle.setCustomer(customer);
        entityManager.persist(vehicle);

        // Create Part
        Part part = new Part();
        part.setPartName("Test Part");
        part.setPartNumber("PART-WORKLOG-001");
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

        // Create WarrantyClaim with ALL required fields
        claim1 = new WarrantyClaim();
        claim1.setClaimDate(LocalDateTime.now());
        claim1.setStatus(WarrantyClaimStatus.PROCESSING);
        claim1.setVehicle(vehicle);
        claim1.setInstalledPart(installedPart);
        claim1.setServiceCenter(serviceCenter);
        entityManager.persist(claim1);

        // Create WorkLog

        WorkLog workLog1 = new WorkLog();
        workLog1.setUser(user1);
        workLog1.setWarrantyClaim(claim1);
        workLog1.setStartTime(LocalDateTime.now());
        entityManager.persist(workLog1);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by warranty claim ID should return a page of work logs")
    void findByWarrantyClaimWarrantyClaimId_ShouldReturnPagedWorkLogs() {
        // Act
        Page<WorkLog> workLogPage = workLogRepository.findByWarrantyClaimWarrantyClaimId(claim1.getWarrantyClaimId(), PageRequest.of(0, 5));

        // Assert
        assertThat(workLogPage).isNotNull();
        assertThat(workLogPage.getTotalElements()).isEqualTo(1);
        assertThat(workLogPage.getContent().get(0).getWarrantyClaim()).isEqualTo(claim1);
    }

    @Test
    @DisplayName("Find by user ID should return a page of work logs")
    void findByUserUserId_ShouldReturnPagedWorkLogs() {
        // Act
        Page<WorkLog> workLogPage = workLogRepository.findByUserUserId(user1.getUserId(), PageRequest.of(0, 5));

        // Assert
        assertThat(workLogPage).isNotNull();
        assertThat(workLogPage.getTotalElements()).isEqualTo(1);
        assertThat(workLogPage.getContent().get(0).getUser()).isEqualTo(user1);
    }
}
