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
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("WarrantyClaimRepository Integration Tests")
class WarrantyClaimRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private WarrantyClaimRepository warrantyClaimRepository;

    private Customer customer1;
    private UUID customer1Id;

    @BeforeEach
    void setUp() {
        // Create Role first
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        // Create User
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole(customerRole);
        entityManager.persist(user);

        // Create Customer
        customer1 = new Customer();
        customer1.setCustomerId(UUID.randomUUID());
        customer1.setName("Test Customer");
        customer1.setPhone("0987654321");
        customer1.setUser(user);
        entityManager.persist(customer1);
        customer1Id = customer1.getCustomerId();

        // Create Vehicle with all required fields
        Vehicle vehicle1 = new Vehicle();
        vehicle1.setVehicleName("Test Vehicle");
        vehicle1.setVehicleModel("Model X");
        vehicle1.setVehicleYear(2023);
        vehicle1.setVehicleVin("VIN123456789");
        vehicle1.setPurchaseDate(LocalDate.now());
        vehicle1.setWarrantyStartDate(LocalDate.now());
        vehicle1.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle1.setMileage(1000);
        vehicle1.setCustomer(customer1);
        entityManager.persist(vehicle1);

        // Create Part
        Part part = new Part();
        part.setPartName("Battery");
        part.setPartNumber("PART-001");
        part.setManufacturer("Tesla");
        part.setPrice(BigDecimal.valueOf(5000.00));
        entityManager.persist(part);

        // Create InstalledPart
        InstalledPart installedPart = new InstalledPart();
        installedPart.setInstallationDate(LocalDate.now().minusMonths(6));
        installedPart.setWarrantyExpirationDate(LocalDate.now().plusYears(2));
        installedPart.setPart(part);
        installedPart.setVehicle(vehicle1);
        entityManager.persist(installedPart);

        // Create WarrantyClaim 1 with all required fields
        WarrantyClaim claim1 = new WarrantyClaim();
        claim1.setClaimDate(LocalDateTime.now());
        claim1.setStatus(WarrantyClaimStatus.SUBMITTED);
        claim1.setVehicle(vehicle1);
        claim1.setInstalledPart(installedPart);
        entityManager.persist(claim1);

        // Create WarrantyClaim 2 with all required fields
        WarrantyClaim claim2 = new WarrantyClaim();
        claim2.setClaimDate(LocalDateTime.now());
        claim2.setStatus(WarrantyClaimStatus.PROCESSING);
        claim2.setVehicle(vehicle1);
        claim2.setInstalledPart(installedPart);
        entityManager.persist(claim2);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by status should return a page of claims")
    void findByStatus_ShouldReturnPagedClaims() {
        // Act
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatus(WarrantyClaimStatus.SUBMITTED, PageRequest.of(0, 5));

        // Assert
        assertThat(claimPage).isNotNull();
        assertThat(claimPage.getTotalElements()).isEqualTo(1);
        assertThat(claimPage.getContent().get(0).getStatus()).isEqualTo(WarrantyClaimStatus.SUBMITTED);
    }

    @Test
    @DisplayName("Find by status in should return claims with any of the given statuses")
    void findByStatusIn_ShouldReturnMatchingClaims() {
        // Act
        List<WarrantyClaimStatus> statuses = List.of(WarrantyClaimStatus.SUBMITTED, WarrantyClaimStatus.PROCESSING);
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatusIn(statuses, PageRequest.of(0, 5));

        // Assert
        assertThat(claimPage).isNotNull();
        assertThat(claimPage.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("Find by customer ID should return claims for that customer")
    void findByVehicleCustomerCustomerId_ShouldReturnMatchingClaims() {
        // Act
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByVehicleCustomerCustomerId(customer1Id, PageRequest.of(0, 5));

        // Assert
        assertThat(claimPage).isNotNull();
        assertThat(claimPage.getTotalElements()).isEqualTo(2);
    }
}
