package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(value = ServiceCenterController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("ServiceCenterController Tests")
class ServiceCenterControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public ServiceCenterService serviceCenterService() {
            return Mockito.mock(ServiceCenterService.class);
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
    private ServiceCenterService serviceCenterService;

    private ServiceCenterRequestDTO requestDTO;
    private ServiceCenterResponseDTO responseDTO;
    private Long testServiceCenterId;

    @BeforeEach
    void setUp() {
        Mockito.reset(serviceCenterService);

        testServiceCenterId = 1L;

        requestDTO = new ServiceCenterRequestDTO();
        requestDTO.setServiceCenterName("Test Center");
        requestDTO.setAddress("123 Test St");
        requestDTO.setPhone("1234567890");
        requestDTO.setOpeningHours("9 AM - 5 PM");
        requestDTO.setLatitude(BigDecimal.valueOf(10.0));
        requestDTO.setLongitude(BigDecimal.valueOf(106.0));

        responseDTO = new ServiceCenterResponseDTO();
        responseDTO.setServiceCenterId(testServiceCenterId);
        responseDTO.setServiceCenterName("Test Center");
        responseDTO.setAddress("123 Test St");
        responseDTO.setPhone("1234567890");
        responseDTO.setLatitude(BigDecimal.valueOf(10.0));
        responseDTO.setLongitude(BigDecimal.valueOf(106.0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/service-centers should return 201 Created for ADMIN")
    void createServiceCenter_Admin_Success() throws Exception {
        // Arrange
        when(serviceCenterService.createServiceCenter(any(ServiceCenterRequestDTO.class)))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/service-centers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serviceCenterId").value(testServiceCenterId))
                .andExpect(jsonPath("$.serviceCenterName").value("Test Center"));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/service-centers should return 403 Forbidden for non-ADMIN")
    void createServiceCenter_Staff_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/service-centers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/service-centers/{id} should return 200 OK when service center exists")
    void getServiceCenterById_Success() throws Exception {
        // Arrange
        when(serviceCenterService.getServiceCenterById(testServiceCenterId)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers/" + testServiceCenterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCenterId").value(testServiceCenterId))
                .andExpect(jsonPath("$.serviceCenterName").value("Test Center"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/service-centers should return 200 OK with paged service centers")
    void getAllServiceCenters_Success() throws Exception {
        // Arrange
        PagedResponse<ServiceCenterResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(serviceCenterService.getAllServiceCenters(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].serviceCenterName").value("Test Center"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/service-centers should return 200 OK for CUSTOMER")
    void getAllServiceCenters_Customer_Success() throws Exception {
        // Arrange
        PagedResponse<ServiceCenterResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(serviceCenterService.getAllServiceCenters(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/service-centers/{id} should return 200 OK when update is successful")
    void updateServiceCenter_Success() throws Exception {
        // Arrange
        ServiceCenterRequestDTO updateDTO = new ServiceCenterRequestDTO();
        updateDTO.setServiceCenterName("Updated Center");
        updateDTO.setAddress("456 New St");
        updateDTO.setPhone("0987654321");
        updateDTO.setOpeningHours("8 AM - 6 PM");
        updateDTO.setLatitude(BigDecimal.valueOf(11.0));
        updateDTO.setLongitude(BigDecimal.valueOf(107.0));

        ServiceCenterResponseDTO updatedResponse = new ServiceCenterResponseDTO();
        updatedResponse.setServiceCenterId(testServiceCenterId);
        updatedResponse.setServiceCenterName("Updated Center");

        when(serviceCenterService.updateServiceCenter(eq(testServiceCenterId), any(ServiceCenterRequestDTO.class)))
                .thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(put("/api/service-centers/" + testServiceCenterId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCenterName").value("Updated Center"));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("PUT /api/service-centers/{id} should return 403 Forbidden for non-ADMIN")
    void updateServiceCenter_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/api/service-centers/" + testServiceCenterId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/service-centers/{id} should return 200 OK when deletion is successful")
    void deleteServiceCenter_Success() throws Exception {
        // Arrange
        doNothing().when(serviceCenterService).deleteServiceCenter(eq(testServiceCenterId));

        // Act & Assert
        mockMvc.perform(delete("/api/service-centers/" + testServiceCenterId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Service center deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("DELETE /api/service-centers/{id} should return 403 Forbidden for non-ADMIN")
    void deleteServiceCenter_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/service-centers/" + testServiceCenterId)
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/service-centers/search should return 200 OK with search results")
    void searchServiceCenters_Success() throws Exception {
        // Arrange
        PagedResponse<ServiceCenterResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(serviceCenterService.searchServiceCenters(eq("Test"), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers/search")
                        .param("keyword", "Test")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/service-centers/nearby should return 200 OK with nearby service centers")
    void findServiceCentersNearby_Success() throws Exception {
        // Arrange
        List<ServiceCenterResponseDTO> nearbyList = Arrays.asList(responseDTO);
        when(serviceCenterService.findServiceCentersNearLocation(
                eq(BigDecimal.valueOf(10.0)), eq(BigDecimal.valueOf(106.0)), eq(10.0)))
                .thenReturn(nearbyList);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers/nearby")
                        .param("latitude", "10.0")
                        .param("longitude", "106.0")
                        .param("radius", "10.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].serviceCenterName").value("Test Center"));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("GET /api/service-centers/ordered-by-distance should return 200 OK with ordered service centers")
    void findAllOrderedByDistance_Success() throws Exception {
        // Arrange
        List<ServiceCenterResponseDTO> orderedList = Arrays.asList(responseDTO);
        when(serviceCenterService.findAllOrderedByDistanceFrom(
                eq(BigDecimal.valueOf(10.0)), eq(BigDecimal.valueOf(106.0))))
                .thenReturn(orderedList);

        // Act & Assert
        mockMvc.perform(get("/api/service-centers/ordered-by-distance")
                        .param("latitude", "10.0")
                        .param("longitude", "106.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].serviceCenterName").value("Test Center"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/service-centers/{id}/location should return 200 OK when location update is successful")
    void updateServiceCenterLocation_Success() throws Exception {
        // Arrange
        ServiceCenterResponseDTO updatedResponse = new ServiceCenterResponseDTO();
        updatedResponse.setServiceCenterId(testServiceCenterId);
        updatedResponse.setLatitude(BigDecimal.valueOf(12.0));
        updatedResponse.setLongitude(BigDecimal.valueOf(108.0));

        when(serviceCenterService.updateServiceCenterLocation(
                eq(testServiceCenterId), eq(BigDecimal.valueOf(12.0)), eq(BigDecimal.valueOf(108.0))))
                .thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(patch("/api/service-centers/" + testServiceCenterId + "/location")
                        .param("latitude", "12.0")
                        .param("longitude", "108.0")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitude").value(12.0))
                .andExpect(jsonPath("$.longitude").value(108.0));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PATCH /api/service-centers/{id}/location should return 403 Forbidden for non-ADMIN")
    void updateServiceCenterLocation_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/service-centers/" + testServiceCenterId + "/location")
                        .param("latitude", "12.0")
                        .param("longitude", "108.0")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
