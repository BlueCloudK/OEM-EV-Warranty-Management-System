package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.service.VehicleService;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = VehicleController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@Import(VehicleControllerTest.ControllerTestConfig.class)
@DisplayName("VehicleController Tests")
class VehicleControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public VehicleService vehicleService() {
            return Mockito.mock(VehicleService.class);
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
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VehicleService vehicleService;

    private VehicleRequestDTO requestDTO;
    private VehicleResponseDTO responseDTO;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        Mockito.reset(vehicleService);

        testCustomerId = UUID.randomUUID();

        requestDTO = new VehicleRequestDTO();
        requestDTO.setVehicleName("Tesla Model S");
        requestDTO.setVehicleModel("Model S");
        requestDTO.setVehicleYear(2023);
        requestDTO.setVehicleVin("12-MĐ-123.45");
        requestDTO.setPurchaseDate(LocalDate.now());
        requestDTO.setWarrantyStartDate(LocalDate.now());
        requestDTO.setWarrantyEndDate(LocalDate.now().plusYears(3));
        requestDTO.setMileage(100);
        requestDTO.setCustomerId(testCustomerId.toString());

        responseDTO = new VehicleResponseDTO();
        responseDTO.setVehicleId(1L);
        responseDTO.setVehicleName("Tesla Model S");
        responseDTO.setVehicleModel("Model S");
        responseDTO.setVehicleVin("12-MĐ-123.45");
    }

    @Nested
    @DisplayName("POST /api/vehicles")
    class CreateVehicle {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 201 Created for successful creation")
        void createVehicle_Success() throws Exception {
            // Arrange
            when(vehicleService.createVehicle(any(VehicleRequestDTO.class))).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(post("/api/vehicles")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.vehicleId").value(1L));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for unauthorized role")
        void createVehicle_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(post("/api/vehicles")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles")
    class GetAllVehicles {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with paged vehicles")
        void getAllVehicles_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);
            pagedResponse.setPage(0);
            pagedResponse.setSize(10);

            when(vehicleService.getAllVehiclesPage(any(), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK for SC_STAFF with search")
        void getAllVehicles_WithSearch_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.getAllVehiclesPage(any(), eq("Tesla"))).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles")
                            .param("search", "Tesla"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getAllVehicles_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/vehicles"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/{id}")
    class GetVehicleById {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK when vehicle exists")
        void getVehicleById_Success() throws Exception {
            // Arrange
            when(vehicleService.getVehicleById(1L)).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.vehicleId").value(1L))
                    .andExpect(jsonPath("$.vehicleName").value("Tesla Model S"));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK for CUSTOMER")
        void getVehicleById_Customer_Success() throws Exception {
            // Arrange
            when(vehicleService.getVehicleById(1L)).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/1"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when vehicle does not exist")
        void getVehicleById_NotFound() throws Exception {
            // Arrange
            when(vehicleService.getVehicleById(1L)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/1"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /api/vehicles/{id}")
    class UpdateVehicle {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK when update is successful")
        void updateVehicle_Success() throws Exception {
            // Arrange
            VehicleRequestDTO updateDTO = new VehicleRequestDTO();
            updateDTO.setVehicleName("Tesla Model S Updated");
            updateDTO.setVehicleModel("Model S");
            updateDTO.setVehicleYear(2024);
            updateDTO.setVehicleVin("12-MĐ-123.45");
            updateDTO.setPurchaseDate(LocalDate.now());
            updateDTO.setWarrantyStartDate(LocalDate.now());
            updateDTO.setWarrantyEndDate(LocalDate.now().plusYears(3));
            updateDTO.setMileage(5000);
            updateDTO.setCustomerId(testCustomerId.toString());

            VehicleResponseDTO updatedResponse = new VehicleResponseDTO();
            updatedResponse.setVehicleId(1L);
            updatedResponse.setVehicleName("Tesla Model S Updated");
            updatedResponse.setMileage(5000);

            when(vehicleService.updateVehicle(eq(1L), any(VehicleRequestDTO.class)))
                    .thenReturn(updatedResponse);

            // Act & Assert
            mockMvc.perform(put("/api/vehicles/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.vehicleName").value("Tesla Model S Updated"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when vehicle does not exist")
        void updateVehicle_NotFound() throws Exception {
            // Arrange
            when(vehicleService.updateVehicle(eq(1L), any(VehicleRequestDTO.class)))
                    .thenReturn(null);

            // Act & Assert
            mockMvc.perform(put("/api/vehicles/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void updateVehicle_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(put("/api/vehicles/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("DELETE /api/vehicles/{id}")
    class DeleteVehicle {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 204 No Content when deletion is successful")
        void deleteVehicle_Success() throws Exception {
            // Arrange
            when(vehicleService.deleteVehicle(1L)).thenReturn(true);

            // Act & Assert
            mockMvc.perform(delete("/api/vehicles/1")
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 404 Not Found when vehicle does not exist")
        void deleteVehicle_NotFound() throws Exception {
            // Arrange
            when(vehicleService.deleteVehicle(1L)).thenReturn(false);

            // Act & Assert
            mockMvc.perform(delete("/api/vehicles/1")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void deleteVehicle_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(delete("/api/vehicles/1")
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/by-customer/{customerId}")
    class GetVehiclesByCustomer {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK with paged vehicles by customer")
        void getVehiclesByCustomer_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.getVehiclesByCustomerId(eq(testCustomerId), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/by-customer/" + testCustomerId)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getVehiclesByCustomer_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/vehicles/by-customer/" + testCustomerId))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/my-vehicles")
    class GetMyVehicles {

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK with customer's vehicles")
        void getMyVehicles_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.getVehiclesByCurrentUser(anyString(), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/my-vehicles")
                            .header("Authorization", "Bearer token")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 401 Unauthorized on service exception")
        void getMyVehicles_Unauthorized() throws Exception {
            // Arrange
            when(vehicleService.getVehiclesByCurrentUser(anyString(), any()))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/my-vehicles")
                            .header("Authorization", "Bearer invalid-token"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 403 Forbidden for non-CUSTOMER")
        void getMyVehicles_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/vehicles/my-vehicles")
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/by-vin")
    class GetVehicleByVin {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK when vehicle found by VIN")
        void getVehicleByVin_Success() throws Exception {
            // Arrange
            when(vehicleService.getVehicleByVin("12-MĐ-123.45")).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/by-vin")
                            .param("vin", "12-MĐ-123.45"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.vehicleVin").value("12-MĐ-123.45"));
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 404 Not Found when vehicle not found by VIN")
        void getVehicleByVin_NotFound() throws Exception {
            // Arrange
            when(vehicleService.getVehicleByVin("INVALID-VIN")).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/by-vin")
                            .param("vin", "INVALID-VIN"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getVehicleByVin_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/vehicles/by-vin")
                            .param("vin", "12-MĐ-123.45"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/search")
    class SearchVehicles {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK with search results")
        void searchVehicles_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.searchVehicles(eq("Model S"), any(), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/search")
                            .param("model", "Model S")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK for CUSTOMER")
        void searchVehicles_Customer_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.searchVehicles(any(), eq("Tesla"), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/search")
                            .param("brand", "Tesla"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/vehicles/warranty-expiring")
    class GetVehiclesWithExpiringWarranty {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with vehicles with expiring warranty")
        void getVehiclesWithExpiringWarranty_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.getVehiclesWithExpiringWarranty(eq(30), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/warranty-expiring")
                            .param("daysFromNow", "30")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 200 OK for EVM_STAFF")
        void getVehiclesWithExpiringWarranty_EvmStaff_Success() throws Exception {
            // Arrange
            PagedResponse<VehicleResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(vehicleService.getVehiclesWithExpiringWarranty(eq(60), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/vehicles/warranty-expiring")
                            .param("daysFromNow", "60"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getVehiclesWithExpiringWarranty_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/vehicles/warranty-expiring"))
                    .andExpect(status().isForbidden());
        }
    }
}

