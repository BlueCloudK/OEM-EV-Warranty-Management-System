package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("InstalledPartRepository Integration Tests")
class InstalledPartRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private InstalledPartRepository installedPartRepository;

    private Vehicle vehicle1;
    private Part part1;

    @BeforeEach
    void setUp() {
        // Create and persist dependent entities first
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole(customerRole);
        // Removed user.setCreatedAt(LocalDateTime.now());
        // Removed user.setUpdatedAt(LocalDateTime.now());
        entityManager.persist(user);

        Customer customer = new Customer();
        customer.setCustomerId(UUID.randomUUID());
        customer.setName("Test Customer");
        customer.setPhone("0987654321");
        customer.setUser(user);
        entityManager.persist(customer);

        vehicle1 = new Vehicle();
        vehicle1.setVehicleName("Model X");
        vehicle1.setVehicleModel("X");
        vehicle1.setVehicleYear(2020);
        vehicle1.setVehicleVin("VIN12345");
        vehicle1.setPurchaseDate(LocalDate.now().minusYears(2));
        vehicle1.setWarrantyStartDate(LocalDate.now().minusYears(2));
        vehicle1.setWarrantyEndDate(LocalDate.now().plusYears(1));
        vehicle1.setMileage(50000);
        vehicle1.setCustomer(customer);
        entityManager.persist(vehicle1);

        part1 = new Part();
        part1.setPartName("Battery");
        part1.setPartNumber("BAT-001");
        part1.setManufacturer("ABC");
        part1.setPrice(BigDecimal.valueOf(1000.0));
        entityManager.persist(part1);

        InstalledPart installedPart1 = new InstalledPart();
        installedPart1.setVehicle(vehicle1);
        installedPart1.setPart(part1);
        installedPart1.setInstallationDate(LocalDate.now().minusMonths(6));
        installedPart1.setWarrantyExpirationDate(LocalDate.now().plusMonths(6));
        entityManager.persist(installedPart1);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by vehicle ID should return a page of installed parts")
    void findByVehicleVehicleId_ShouldReturnPagedParts() {
        // Act
        Page<InstalledPart> installedPartPage = installedPartRepository.findByVehicleVehicleId(vehicle1.getVehicleId(), PageRequest.of(0, 5));

        // Assert
        assertThat(installedPartPage).isNotNull();
        assertThat(installedPartPage.getTotalElements()).isEqualTo(1);
        assertThat(installedPartPage.getContent().get(0).getVehicle()).isEqualTo(vehicle1);
    }

    @Test
    @DisplayName("Find by part ID should return a page of installed parts")
    void findByPartPartId_ShouldReturnPagedParts() {
        // Act
        Page<InstalledPart> installedPartPage = installedPartRepository.findByPartPartId(part1.getPartId(), PageRequest.of(0, 5));

        // Assert
        assertThat(installedPartPage).isNotNull();
        assertThat(installedPartPage.getTotalElements()).isEqualTo(1);
        assertThat(installedPartPage.getContent().get(0).getPart()).isEqualTo(part1);
    }

    @Test
    @DisplayName("Find by warranty expiration date before should return expiring parts")
    void findByWarrantyExpirationDateBefore_ShouldReturnExpiringParts() {
        // Act
        Page<InstalledPart> installedPartPage = installedPartRepository.findByWarrantyExpirationDateBefore(LocalDate.now().plusYears(2), PageRequest.of(0, 5));

        // Assert
        assertThat(installedPartPage).isNotNull();
        assertThat(installedPartPage.getTotalElements()).isEqualTo(1);
    }
}
