package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.ServiceCenter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("ServiceCenterRepository Integration Tests")
class ServiceCenterRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    private ServiceCenter testServiceCenter;

    @BeforeEach
    void setUp() {
        // Create and persist ServiceCenter
        testServiceCenter = new ServiceCenter();
        testServiceCenter.setName("Downtown Service Center");
        testServiceCenter.setAddress("123 Main Street, Hanoi");
        testServiceCenter.setPhone("0123456789");
        testServiceCenter.setOpeningHours("8:00 AM - 6:00 PM");
        testServiceCenter.setLatitude(new BigDecimal("21.028511"));
        testServiceCenter.setLongitude(new BigDecimal("105.804817"));
        entityManager.persist(testServiceCenter);

        // Create another service center for search tests
        ServiceCenter anotherCenter = new ServiceCenter();
        anotherCenter.setName("Airport Service Center");
        anotherCenter.setAddress("456 Airport Road, HCMC");
        anotherCenter.setPhone("0987654321");
        anotherCenter.setOpeningHours("7:00 AM - 9:00 PM");
        anotherCenter.setLatitude(new BigDecimal("10.762622"));
        anotherCenter.setLongitude(new BigDecimal("106.660172"));
        entityManager.persist(anotherCenter);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by phone should return the correct service center")
    void findByPhone_ShouldReturnCorrectServiceCenter() {
        // Act
        Optional<ServiceCenter> foundCenter = serviceCenterRepository.findByPhone("0123456789");

        // Assert
        assertThat(foundCenter).isPresent();
        assertThat(foundCenter.get().getName()).isEqualTo("Downtown Service Center");
    }

    @Test
    @DisplayName("Find by non-existent phone should return empty")
    void findByPhone_WithNonExistentPhone_ShouldReturnEmpty() {
        // Act
        Optional<ServiceCenter> foundCenter = serviceCenterRepository.findByPhone("9999999999");

        // Assert
        assertThat(foundCenter).isEmpty();
    }

    @Test
    @DisplayName("Find all service centers should return all persisted centers")
    void findAll_ShouldReturnAllServiceCenters() {
        // Act
        Page<ServiceCenter> centers = serviceCenterRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(centers).isNotNull();
        assertThat(centers.getTotalElements()).isEqualTo(2);
        assertThat(centers.getContent()).hasSize(2);
    }

    @Test
    @DisplayName("Save service center should persist successfully")
    void saveServiceCenter_ShouldPersistSuccessfully() {
        // Arrange
        ServiceCenter newCenter = new ServiceCenter();
        newCenter.setName("New Service Center");
        newCenter.setAddress("789 New Street");
        newCenter.setPhone("5555555555");
        newCenter.setOpeningHours("8:00 AM - 8:00 PM");
        newCenter.setLatitude(new BigDecimal("11.123456"));
        newCenter.setLongitude(new BigDecimal("107.123456"));

        // Act
        ServiceCenter savedCenter = serviceCenterRepository.save(newCenter);

        // Assert
        assertThat(savedCenter.getServiceCenterId()).isNotNull();
        assertThat(savedCenter.getName()).isEqualTo("New Service Center");
        assertThat(serviceCenterRepository.findAll()).hasSize(3);
    }
}


