package com.swp391.warrantymanagement.repository;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("FeedbackRepository Integration Tests")
class FeedbackRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FeedbackRepository feedbackRepository;

    private ServiceCenter serviceCenter1;

    @BeforeEach
    void setUp() {
        // Create and persist dependent entities first
        serviceCenter1 = new ServiceCenter();
        serviceCenter1.setName("Test Service Center");
        serviceCenter1.setAddress("123 Test St");
        serviceCenter1.setPhone("111222333");
        serviceCenter1.setOpeningHours("9-5");
        serviceCenter1.setLatitude(BigDecimal.valueOf(10.0));
        serviceCenter1.setLongitude(BigDecimal.valueOf(106.0));
        entityManager.persist(serviceCenter1);

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

        // Create Vehicle with all required fields BEFORE persisting
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName("Test Vehicle");
        vehicle.setVehicleModel("Model X");
        vehicle.setVehicleYear(2023);
        vehicle.setVehicleVin("VIN-FEEDBACK-001");
        vehicle.setPurchaseDate(LocalDate.now());
        vehicle.setWarrantyStartDate(LocalDate.now());
        vehicle.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle.setMileage(1000);
        vehicle.setCustomer(customer);
        entityManager.persist(vehicle);

        // Create Part
        Part part = new Part();
        part.setPartName("Test Part");
        part.setPartNumber("PART-FEEDBACK-001");
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

        // Create WarrantyClaim 1 with all required fields
        WarrantyClaim claim1 = new WarrantyClaim();
        claim1.setClaimDate(LocalDateTime.now());
        claim1.setStatus(WarrantyClaimStatus.COMPLETED);
        claim1.setServiceCenter(serviceCenter1);
        claim1.setVehicle(vehicle);
        claim1.setInstalledPart(installedPart);
        entityManager.persist(claim1);

        // Create Feedback 1
        Feedback feedback1 = new Feedback();
        feedback1.setRating(5);
        feedback1.setWarrantyClaim(claim1);
        feedback1.setCustomer(customer);
        entityManager.persist(feedback1);

        // Create WarrantyClaim 2 for feedback2
        WarrantyClaim claim2 = new WarrantyClaim();
        claim2.setClaimDate(LocalDateTime.now());
        claim2.setStatus(WarrantyClaimStatus.COMPLETED);
        claim2.setServiceCenter(serviceCenter1);
        claim2.setVehicle(vehicle);
        claim2.setInstalledPart(installedPart);
        entityManager.persist(claim2);

        // Create Feedback 2
        Feedback feedback2 = new Feedback();
        feedback2.setRating(3);
        feedback2.setWarrantyClaim(claim2);
        feedback2.setCustomer(customer);
        entityManager.persist(feedback2);

        entityManager.flush();
    }

    @Test
    @DisplayName("Get average rating should return the correct average")
    void getAverageRating_ShouldReturnCorrectAverage() {
        // Act
        Double average = feedbackRepository.getAverageRating();

        // Assert
        assertThat(average).isEqualTo(4.0);
    }

    @Test
    @DisplayName("Get average rating by service center should return the correct average")
    void getAverageRatingByServiceCenter_ShouldReturnCorrectAverage() {
        // Act
        Double average = feedbackRepository.getAverageRatingByServiceCenter(serviceCenter1.getServiceCenterId());

        // Assert
        assertThat(average).isEqualTo(4.0);
    }

    @Test
    @DisplayName("Count by rating should return the correct count")
    void countByRating_ShouldReturnCorrectCount() {
        // Act
        Long count = feedbackRepository.countByRating(5);

        // Assert
        assertThat(count).isEqualTo(1L);
    }
}
