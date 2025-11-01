package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.ServiceHistory;
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
@DisplayName("ServiceHistoryRepository Integration Tests")
class ServiceHistoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ServiceHistoryRepository serviceHistoryRepository;

    private Vehicle vehicle1, vehicle2;
    private Customer customer1;
    private Part part1;

    @BeforeEach
    void setUp() {
        // Arrange: Create and persist test data
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole(customerRole);
        entityManager.persist(user);

        customer1 = new Customer();
        customer1.setCustomerId(UUID.randomUUID());
        customer1.setName("Test Customer");
        customer1.setPhone("0987654321");
        customer1.setUser(user);
        entityManager.persist(customer1);

        vehicle1 = new Vehicle();
        vehicle1.setVehicleName("Car1");
        vehicle1.setVehicleModel("Model1");
        vehicle1.setVehicleYear(2020);
        vehicle1.setVehicleVin("VIN123");
        vehicle1.setPurchaseDate(LocalDate.now());
        vehicle1.setWarrantyStartDate(LocalDate.now());
        vehicle1.setWarrantyEndDate(LocalDate.now().plusYears(1));
        vehicle1.setMileage(10000);
        vehicle1.setCustomer(customer1);
        entityManager.persist(vehicle1);

        vehicle2 = new Vehicle();
        vehicle2.setVehicleName("Car2");
        vehicle2.setVehicleModel("Model2");
        vehicle2.setVehicleYear(2021);
        vehicle2.setVehicleVin("VIN456");
        vehicle2.setPurchaseDate(LocalDate.now());
        vehicle2.setWarrantyStartDate(LocalDate.now());
        vehicle2.setWarrantyEndDate(LocalDate.now().plusYears(1));
        vehicle2.setMileage(20000);
        vehicle2.setCustomer(customer1);
        entityManager.persist(vehicle2);

        part1 = new Part();
        part1.setPartName("Brake Pad");
        part1.setPartNumber("PN-001");
        part1.setManufacturer("Manufacturer A");
        part1.setPrice(BigDecimal.valueOf(100.0));
        entityManager.persist(part1);

        ServiceHistory history1 = new ServiceHistory();
        history1.setVehicle(vehicle1);
        history1.setServiceType("Brake Inspection");
        history1.setServiceDate(LocalDate.of(2023, 5, 10));
        entityManager.persist(history1);

        ServiceHistory history2 = new ServiceHistory();
        history2.setVehicle(vehicle2);
        history2.setServiceType("Oil Change");
        history2.setServiceDate(LocalDate.of(2023, 6, 15));
        entityManager.persist(history2);

        ServiceHistory history3 = new ServiceHistory();
        history3.setVehicle(vehicle1);
        history3.setServiceType("Tire Rotation");
        history3.setServiceDate(LocalDate.of(2023, 7, 20));
        entityManager.persist(history3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by vehicle ID should return correct histories")
    void findByVehicleVehicleId_ShouldReturnMatchingHistories() {
        // Act
        Page<ServiceHistory> result = serviceHistoryRepository.findByVehicleVehicleId(vehicle1.getVehicleId(), PageRequest.of(0, 5));

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(ServiceHistory::getServiceType).containsExactlyInAnyOrder("Brake Inspection", "Tire Rotation");
    }

    @Test
    @DisplayName("Find by customer ID should return all histories for that customer's vehicles")
    void findByVehicleCustomerCustomerId_ShouldReturnMatchingHistories() {
        // Act
        Page<ServiceHistory> result = serviceHistoryRepository.findByVehicleCustomerCustomerId(customer1.getCustomerId(), PageRequest.of(0, 5));

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(3);
    }

    @Test
    @DisplayName("Find by date between should return correct histories")
    void findByServiceDateBetween_ShouldReturnMatchingHistories() {
        // Arrange
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 7, 30);

        // Act
        Page<ServiceHistory> result = serviceHistoryRepository.findByServiceDateBetween(startDate, endDate, PageRequest.of(0, 5));

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(ServiceHistory::getServiceType).containsExactlyInAnyOrder("Oil Change", "Tire Rotation");
    }

    @Test
    @DisplayName("Find all service histories should return all persisted histories")
    void findAll_ShouldReturnAllServiceHistories() {
        // Act
        Page<ServiceHistory> result = serviceHistoryRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent()).extracting(ServiceHistory::getServiceType)
            .containsExactlyInAnyOrder("Brake Inspection", "Oil Change", "Tire Rotation");
    }
}