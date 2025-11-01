package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.PartService;
import com.swp391.warrantymanagement.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(PartControllerTest.ControllerTestConfig.class)
@WebMvcTest(value = PartController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("PartController Tests")
class PartControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public PartService partService() {
            return Mockito.mock(PartService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }


        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PartService partService;

    private PartResponseDTO partResponseDTO;
    private PartRequestDTO partRequestDTO;

    @BeforeEach
    void setUp() {
        Mockito.reset(partService);

        partResponseDTO = new PartResponseDTO();
        partResponseDTO.setPartId(1L);
        partResponseDTO.setPartName("Test Part");
        partResponseDTO.setPartNumber("PN-123");
        partResponseDTO.setManufacturer("TestCorp");
        partResponseDTO.setPrice(new BigDecimal("100.00"));

        partRequestDTO = new PartRequestDTO();
        partRequestDTO.setPartName("Test Part");
        partRequestDTO.setPartNumber("PN-123");
        partRequestDTO.setManufacturer("TestCorp");
        partRequestDTO.setPrice(new BigDecimal("100.00"));
    }

    @Nested
    @DisplayName("POST /api/parts")
    class CreatePart {

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 201 Created when part is created successfully")
        void createPart_Success() throws Exception {
            // Arrange
            when(partService.createPart(any(PartRequestDTO.class))).thenReturn(partResponseDTO);

            // Act & Assert
            mockMvc.perform(post("/api/parts")
                            .with(csrf()) // Add CSRF token for POST requests
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.partId").value(1L))
                    .andExpect(jsonPath("$.partName").value("Test Part"));
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 403 Forbidden for unauthorized user")
        void createPart_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(post("/api/parts")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 400 Bad Request when part number already exists")
        void createPart_DuplicatePartNumber_ReturnsBadRequest() throws Exception {
            // Arrange
            when(partService.createPart(any(PartRequestDTO.class))).thenThrow(new RuntimeException("Part number already exists"));

            // Act & Assert
            mockMvc.perform(post("/api/parts")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/parts")
    class GetAllParts {

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 200 OK with paged parts")
        void getAllParts_Success() throws Exception {
            // Arrange
            PagedResponse<PartResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(partResponseDTO));
            pagedResponse.setTotalElements(1L);
            pagedResponse.setPage(0);
            pagedResponse.setSize(10);

            when(partService.getAllPartsPage(any(), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/parts")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.content[0].partName").value("Test Part"));
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK for SC_STAFF with search parameter")
        void getAllParts_WithSearch_Success() throws Exception {
            // Arrange
            PagedResponse<PartResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(partResponseDTO));
            pagedResponse.setTotalElements(1L);

            when(partService.getAllPartsPage(any(), eq("Test"))).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/parts")
                            .param("search", "Test"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getAllParts_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/parts"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/parts/{id}")
    class GetPartById {

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 200 OK when part exists")
        void getPartById_Success() throws Exception {
            // Arrange
            when(partService.getPartById(1L)).thenReturn(partResponseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/parts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.partId").value(1L))
                    .andExpect(jsonPath("$.partName").value("Test Part"));
        }

        @Test
        @WithMockUser(roles = "SC_TECHNICIAN")
        @DisplayName("Should return 200 OK for SC_TECHNICIAN")
        void getPartById_ScTechnician_Success() throws Exception {
            // Arrange
            when(partService.getPartById(1L)).thenReturn(partResponseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/parts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.partId").value(1L));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when part does not exist")
        void getPartById_NotFound() throws Exception {
            // Arrange
            when(partService.getPartById(1L)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/api/parts/1"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getPartById_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/parts/1"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /api/parts/{id}")
    class UpdatePart {

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 200 OK when part is updated successfully")
        void updatePart_Success() throws Exception {
            // Arrange
            PartRequestDTO updateDTO = new PartRequestDTO();
            updateDTO.setPartName("Updated Part");
            updateDTO.setPartNumber("PN-123");
            updateDTO.setManufacturer("TestCorp");
            updateDTO.setPrice(new BigDecimal("150.00"));

            PartResponseDTO updatedResponse = new PartResponseDTO();
            updatedResponse.setPartId(1L);
            updatedResponse.setPartName("Updated Part");
            updatedResponse.setPrice(new BigDecimal("150.00"));

            when(partService.updatePart(eq(1L), any(PartRequestDTO.class))).thenReturn(updatedResponse);

            // Act & Assert
            mockMvc.perform(put("/api/parts/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.partName").value("Updated Part"))
                    .andExpect(jsonPath("$.price").value(150.00));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when part does not exist")
        void updatePart_NotFound() throws Exception {
            // Arrange
            when(partService.updatePart(eq(1L), any(PartRequestDTO.class))).thenReturn(null);

            // Act & Assert
            mockMvc.perform(put("/api/parts/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 403 Forbidden for SC_STAFF")
        void updatePart_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(put("/api/parts/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 400 Bad Request when update fails")
        void updatePart_BadRequest() throws Exception {
            // Arrange
            when(partService.updatePart(eq(1L), any(PartRequestDTO.class)))
                    .thenThrow(new RuntimeException("Update failed"));

            // Act & Assert
            mockMvc.perform(put("/api/parts/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partRequestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/parts/{id}")
    class DeletePart {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 204 No Content when part is deleted successfully")
        void deletePart_Success() throws Exception {
            // Arrange
            when(partService.deletePart(1L)).thenReturn(true);

            // Act & Assert
            mockMvc.perform(delete("/api/parts/1")
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when part does not exist")
        void deletePart_NotFound() throws Exception {
            // Arrange
            when(partService.deletePart(1L)).thenReturn(false);

            // Act & Assert
            mockMvc.perform(delete("/api/parts/1")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 403 Forbidden for EVM_STAFF")
        void deletePart_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(delete("/api/parts/1")
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/parts/by-manufacturer")
    class GetPartsByManufacturer {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK with paged parts by manufacturer")
        void getPartsByManufacturer_Success() throws Exception {
            // Arrange
            PagedResponse<PartResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(partResponseDTO));
            pagedResponse.setTotalElements(1L);

            when(partService.getPartsByManufacturer(eq("TestCorp"), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/parts/by-manufacturer")
                            .param("manufacturer", "TestCorp")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.content[0].manufacturer").value("TestCorp"));
        }

        @Test
        @WithMockUser(roles = "SC_TECHNICIAN")
        @DisplayName("Should return 200 OK for SC_TECHNICIAN")
        void getPartsByManufacturer_ScTechnician_Success() throws Exception {
            // Arrange
            PagedResponse<PartResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(partResponseDTO));
            pagedResponse.setTotalElements(1L);

            when(partService.getPartsByManufacturer(eq("TestCorp"), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/parts/by-manufacturer")
                            .param("manufacturer", "TestCorp"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getPartsByManufacturer_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/parts/by-manufacturer")
                            .param("manufacturer", "TestCorp"))
                    .andExpect(status().isForbidden());
        }
    }
}
