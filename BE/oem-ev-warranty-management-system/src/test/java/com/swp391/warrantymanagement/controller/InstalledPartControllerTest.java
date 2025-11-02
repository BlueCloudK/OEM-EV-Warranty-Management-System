package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.InstalledPartService;
import com.swp391.warrantymanagement.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(value = InstalledPartController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("InstalledPartController Tests")
class InstalledPartControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public InstalledPartService installedPartService() {
            return Mockito.mock(InstalledPartService.class);
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

        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            return mapper;
        }
    }

    @Autowired
    private InstalledPartService installedPartService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private InstalledPartRequestDTO requestDTO;
    private InstalledPartResponseDTO responseDTO;
    private Long testInstalledPartId;
    private Long testPartId;
    private Long testVehicleId;

    @BeforeEach
    void setUp() {
        Mockito.reset(installedPartService);

        testInstalledPartId = 1L;
        testPartId = 1L;
        testVehicleId = 1L;

        requestDTO = new InstalledPartRequestDTO();
        requestDTO.setPartId(testPartId);
        requestDTO.setVehicleId(testVehicleId);
        requestDTO.setInstallationDate(LocalDate.now().minusDays(1));
        requestDTO.setWarrantyExpirationDate(LocalDate.now().plusYears(1));

        responseDTO = new InstalledPartResponseDTO();
        responseDTO.setInstalledPartId(testInstalledPartId);
        responseDTO.setPartId(testPartId);
        responseDTO.setVehicleId(testVehicleId);
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/installed-parts should return 201 Created for SC_STAFF")
    void createInstalledPart_Success() throws Exception {
        // Arrange
        when(installedPartService.createInstalledPart(any(InstalledPartRequestDTO.class))).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/installed-parts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.installedPartId").value(testInstalledPartId));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/installed-parts should return 403 Forbidden for CUSTOMER")
    void createInstalledPart_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/installed-parts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/installed-parts should return 200 OK with paged installed parts")
    void getAllInstalledParts_Success() throws Exception {
        // Arrange
        PagedResponse<InstalledPartResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(installedPartService.getAllInstalledParts(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/installed-parts/{id} should return 200 OK when installed part exists")
    void getInstalledPartById_Success() throws Exception {
        // Arrange
        when(installedPartService.getInstalledPartById(testInstalledPartId)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts/" + testInstalledPartId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.installedPartId").value(testInstalledPartId));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/installed-parts/{id} should return 404 Not Found when installed part does not exist")
    void getInstalledPartById_NotFound() throws Exception {
        // Arrange
        when(installedPartService.getInstalledPartById(testInstalledPartId)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts/" + testInstalledPartId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PUT /api/installed-parts/{id} should return 200 OK when update is successful")
    void updateInstalledPart_Success() throws Exception {
        // Arrange
        when(installedPartService.updateInstalledPart(eq(testInstalledPartId), any(InstalledPartRequestDTO.class)))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/installed-parts/" + testInstalledPartId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.installedPartId").value(testInstalledPartId));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/installed-parts/{id} should return 404 Not Found when installed part does not exist")
    void updateInstalledPart_NotFound() throws Exception {
        // Arrange
        when(installedPartService.updateInstalledPart(eq(testInstalledPartId), any(InstalledPartRequestDTO.class)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/installed-parts/" + testInstalledPartId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/installed-parts/{id} should return 204 No Content when deletion is successful")
    void deleteInstalledPart_Success() throws Exception {
        // Arrange
        when(installedPartService.deleteInstalledPart(testInstalledPartId)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/installed-parts/" + testInstalledPartId)
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/installed-parts/{id} should return 404 Not Found when installed part does not exist")
    void deleteInstalledPart_NotFound() throws Exception {
        // Arrange
        when(installedPartService.deleteInstalledPart(testInstalledPartId)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/installed-parts/" + testInstalledPartId)
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("DELETE /api/installed-parts/{id} should return 403 Forbidden for non-ADMIN")
    void deleteInstalledPart_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/installed-parts/" + testInstalledPartId)
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/installed-parts/by-vehicle/{vehicleId} should return 200 OK with paged installed parts")
    void getInstalledPartsByVehicle_Success() throws Exception {
        // Arrange
        PagedResponse<InstalledPartResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(installedPartService.getInstalledPartsByVehicle(eq(testVehicleId), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts/by-vehicle/" + testVehicleId)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/installed-parts/by-part/{partId} should return 200 OK with paged installed parts")
    void getInstalledPartsByPart_Success() throws Exception {
        // Arrange
        PagedResponse<InstalledPartResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(installedPartService.getInstalledPartsByPart(eq(testPartId), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts/by-part/" + testPartId)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/installed-parts/warranty-expiring should return 200 OK with paged installed parts")
    void getInstalledPartsWithExpiringWarranty_Success() throws Exception {
        // Arrange
        PagedResponse<InstalledPartResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(installedPartService.getInstalledPartsWithExpiringWarranty(eq(30), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/installed-parts/warranty-expiring")
                        .param("daysFromNow", "30")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
