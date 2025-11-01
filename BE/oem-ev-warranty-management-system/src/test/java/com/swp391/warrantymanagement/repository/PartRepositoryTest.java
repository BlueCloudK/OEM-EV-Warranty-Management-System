package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("PartRepository Integration Tests")
class PartRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PartRepository partRepository;

    @BeforeEach
    void setUp() {
        // Arrange: Create and persist test data before each test
        Part part1 = new Part();
        part1.setPartName("EV Battery Pack 90kWh");
        part1.setPartNumber("BAT-90KWH-001");
        part1.setManufacturer("PowerVolt");
        part1.setPrice(new BigDecimal("12000.00"));
        entityManager.persist(part1);

        Part part2 = new Part();
        part2.setPartName("Electric Motor V2");
        part2.setPartNumber("MOT-V2-002");
        part2.setManufacturer("DriveCorp");
        part2.setPrice(new BigDecimal("7500.00"));
        entityManager.persist(part2);

        Part part3 = new Part();
        part3.setPartName("On-Board Charger 22kW");
        part3.setPartNumber("CHG-22KW-003");
        part3.setManufacturer("PowerVolt");
        part3.setPrice(new BigDecimal("1500.00"));
        entityManager.persist(part3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by part number should return exact match")
    void findByPartNumber_ShouldReturnExactMatch() {
        Part result = partRepository.findByPartNumber("BAT-90KWH-001");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPartName()).isEqualTo("EV Battery Pack 90kWh");
        assertThat(result.getManufacturer()).isEqualTo("PowerVolt");
    }

    @Test
    @DisplayName("Find by part number with no match should return null")
    void findByPartNumber_NoMatch_ShouldReturnNull() {
        // Act
        Part result = partRepository.findByPartNumber("NON-EXISTENT-999");

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Find all parts should return all persisted parts")
    void findAll_ShouldReturnAllParts() {
        // Act
        Page<Part> result = partRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent()).hasSize(3);
    }

    @Test
    @DisplayName("Save part should persist successfully")
    void savePart_ShouldPersistSuccessfully() {
        // Arrange
        Part newPart = new Part();
        newPart.setPartName("Brake System Advanced");
        newPart.setPartNumber("BRK-ADV-004");
        newPart.setManufacturer("SafeDrive");
        newPart.setPrice(new BigDecimal("2500.00"));

        // Act
        Part savedPart = partRepository.save(newPart);

        // Assert
        assertThat(savedPart.getPartId()).isNotNull();
        assertThat(savedPart.getPartName()).isEqualTo("Brake System Advanced");
        assertThat(partRepository.findAll()).hasSize(4);
    }
}
