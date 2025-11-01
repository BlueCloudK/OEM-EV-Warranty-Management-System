package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
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
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = ServiceHistoryController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@Import(ServiceHistoryControllerTest.ControllerTestConfig.class)
@DisplayName("ServiceHistoryController Tests")
class ServiceHistoryControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public ServiceHistoryService serviceHistoryService() {
            return Mockito.mock(ServiceHistoryService.class);
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
    private ServiceHistoryService serviceHistoryService;

    private ServiceHistoryRequestDTO requestDTO;
    private ServiceHistoryResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        Mockito.reset(serviceHistoryService);

        LocalDate serviceDate = LocalDate.of(2023, 8, 21);
        Date serviceUtilDate = Date.from(serviceDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

        requestDTO = new ServiceHistoryRequestDTO();
        requestDTO.setVehicleId(1L);
        requestDTO.setPartId(101L);
        requestDTO.setServiceDate(serviceUtilDate);
        requestDTO.setServiceType("Oil Change");
        requestDTO.setDescription("Routine Checkup");

        responseDTO = new ServiceHistoryResponseDTO();
        responseDTO.setServiceHistoryId(1L);
        responseDTO.setVehicleId(1L);
        responseDTO.setServiceDate(serviceUtilDate);
        responseDTO.setDescription("Routine Checkup");
    }

    @Nested
    @DisplayName("POST /api/service-histories")
    class CreateServiceHistory {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 201 Created for authorized user")
        void createServiceHistory_Success() throws Exception {
            // Arrange
            when(serviceHistoryService.createServiceHistory(any(ServiceHistoryRequestDTO.class))).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(post("/api/service-histories")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.serviceHistoryId").value(1L))
                    .andExpect(jsonPath("$.description").value("Routine Checkup"));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for unauthorized user")
        void createServiceHistory_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(post("/api/service-histories")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 400 Bad Request on service layer exception")
        void createServiceHistory_ServiceException_ReturnsBadRequest() throws Exception {
            // Arrange
            when(serviceHistoryService.createServiceHistory(any(ServiceHistoryRequestDTO.class)))
                    .thenThrow(new RuntimeException("Invalid data"));

            // Act & Assert
            mockMvc.perform(post("/api/service-histories")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories")
    class GetAllServiceHistories {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with paged service histories")
        void getAllServiceHistories_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);
            pagedResponse.setPage(0);
            pagedResponse.setSize(10);

            when(serviceHistoryService.getAllServiceHistoriesPage(any(), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "SC_TECHNICIAN")
        @DisplayName("Should return 200 OK for SC_TECHNICIAN with search")
        void getAllServiceHistories_WithSearch_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getAllServiceHistoriesPage(any(), eq("Oil"))).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories")
                            .param("search", "Oil"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getAllServiceHistories_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/service-histories"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories/{id}")
    class GetServiceHistoryById {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK when service history exists")
        void getServiceHistoryById_Success() throws Exception {
            // Arrange
            when(serviceHistoryService.getServiceHistoryById(1L)).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.serviceHistoryId").value(1L))
                    .andExpect(jsonPath("$.description").value("Routine Checkup"));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK for CUSTOMER")
        void getServiceHistoryById_Customer_Success() throws Exception {
            // Arrange
            when(serviceHistoryService.getServiceHistoryById(1L)).thenReturn(responseDTO);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/1"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when service history does not exist")
        void getServiceHistoryById_NotFound() throws Exception {
            // Arrange
            when(serviceHistoryService.getServiceHistoryById(1L)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/1"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /api/service-histories/{id}")
    class UpdateServiceHistory {

        @Test
        @WithMockUser(roles = "SC_TECHNICIAN")
        @DisplayName("Should return 200 OK when update is successful")
        void updateServiceHistory_Success() throws Exception {
            // Arrange
            LocalDate updateDate = LocalDate.of(2023, 9, 15);
            Date updateUtilDate = Date.from(updateDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            ServiceHistoryRequestDTO updateDTO = new ServiceHistoryRequestDTO();
            updateDTO.setVehicleId(1L);
            updateDTO.setPartId(102L);
            updateDTO.setServiceDate(updateUtilDate);
            updateDTO.setServiceType("Brake Inspection");
            updateDTO.setDescription("Updated description for brake inspection");

            ServiceHistoryResponseDTO updatedResponse = new ServiceHistoryResponseDTO();
            updatedResponse.setServiceHistoryId(1L);
            updatedResponse.setDescription("Updated description for brake inspection");

            when(serviceHistoryService.updateServiceHistory(eq(1L), any(ServiceHistoryRequestDTO.class)))
                    .thenReturn(updatedResponse);

            // Act & Assert
            mockMvc.perform(put("/api/service-histories/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.description").value("Updated description for brake inspection"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when service history does not exist")
        void updateServiceHistory_NotFound() throws Exception {
            // Arrange
            when(serviceHistoryService.updateServiceHistory(eq(1L), any(ServiceHistoryRequestDTO.class)))
                    .thenReturn(null);

            // Act & Assert
            mockMvc.perform(put("/api/service-histories/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void updateServiceHistory_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(put("/api/service-histories/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 400 Bad Request on service layer exception")
        void updateServiceHistory_BadRequest() throws Exception {
            // Arrange
            when(serviceHistoryService.updateServiceHistory(eq(1L), any(ServiceHistoryRequestDTO.class)))
                    .thenThrow(new RuntimeException("Update failed"));

            // Act & Assert
            mockMvc.perform(put("/api/service-histories/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/service-histories/{id}")
    class DeleteServiceHistory {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 204 No Content when deletion is successful")
        void deleteServiceHistory_Success() throws Exception {
            // Arrange
            when(serviceHistoryService.deleteServiceHistory(1L)).thenReturn(true);

            // Act & Assert
            mockMvc.perform(delete("/api/service-histories/1")
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 404 Not Found when service history does not exist")
        void deleteServiceHistory_NotFound() throws Exception {
            // Arrange
            when(serviceHistoryService.deleteServiceHistory(1L)).thenReturn(false);

            // Act & Assert
            mockMvc.perform(delete("/api/service-histories/1")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 403 Forbidden for non-ADMIN")
        void deleteServiceHistory_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(delete("/api/service-histories/1")
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories/by-vehicle/{vehicleId}")
    class GetServiceHistoriesByVehicle {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 200 OK with paged service histories by vehicle")
        void getServiceHistoriesByVehicle_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByVehicleId(eq(1L), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-vehicle/1")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK for CUSTOMER viewing own vehicle")
        void getServiceHistoriesByVehicle_Customer_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByVehicleId(eq(1L), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-vehicle/1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories/by-part/{partId}")
    class GetServiceHistoriesByPart {

        @Test
        @WithMockUser(roles = "EVM_STAFF")
        @DisplayName("Should return 200 OK with paged service histories by part")
        void getServiceHistoriesByPart_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByPartId(eq("PART-101"), any())).thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-part/PART-101")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getServiceHistoriesByPart_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-part/PART-101"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories/my-services")
    class GetMyServiceHistories {

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 200 OK with customer's service histories")
        void getMyServiceHistories_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByCurrentUser(anyString(), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/my-services")
                            .header("Authorization", "Bearer token")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 401 Unauthorized on service exception")
        void getMyServiceHistories_Unauthorized() throws Exception {
            // Arrange
            when(serviceHistoryService.getServiceHistoriesByCurrentUser(anyString(), any()))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/my-services")
                            .header("Authorization", "Bearer invalid-token"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 403 Forbidden for non-CUSTOMER")
        void getMyServiceHistories_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/service-histories/my-services")
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/service-histories/by-date-range")
    class GetServiceHistoriesByDateRange {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with service histories in date range")
        void getServiceHistoriesByDateRange_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByDateRange(eq("2023-01-01"), eq("2023-12-31"), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-date-range")
                            .param("startDate", "2023-01-01")
                            .param("endDate", "2023-12-31")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "SC_TECHNICIAN")
        @DisplayName("Should return 200 OK for SC_TECHNICIAN")
        void getServiceHistoriesByDateRange_ScTechnician_Success() throws Exception {
            // Arrange
            PagedResponse<ServiceHistoryResponseDTO> pagedResponse = new PagedResponse<>();
            pagedResponse.setContent(Arrays.asList(responseDTO));
            pagedResponse.setTotalElements(1L);

            when(serviceHistoryService.getServiceHistoriesByDateRange(anyString(), anyString(), any()))
                    .thenReturn(pagedResponse);

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-date-range")
                            .param("startDate", "2023-01-01")
                            .param("endDate", "2023-12-31"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 400 Bad Request on service exception")
        void getServiceHistoriesByDateRange_BadRequest() throws Exception {
            // Arrange
            when(serviceHistoryService.getServiceHistoriesByDateRange(anyString(), anyString(), any()))
                    .thenThrow(new RuntimeException("Invalid date format"));

            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-date-range")
                            .param("startDate", "invalid-date")
                            .param("endDate", "2023-12-31"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for CUSTOMER")
        void getServiceHistoriesByDateRange_Forbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/service-histories/by-date-range")
                            .param("startDate", "2023-01-01")
                            .param("endDate", "2023-12-31"))
                    .andExpect(status().isForbidden());
        }
    }
}
