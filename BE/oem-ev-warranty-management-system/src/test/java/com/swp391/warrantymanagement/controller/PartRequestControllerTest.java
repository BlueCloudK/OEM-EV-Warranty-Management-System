package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.service.PartRequestService;
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

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(value = PartRequestController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("PartRequestController Tests")
class PartRequestControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public PartRequestService partRequestService() {
            return Mockito.mock(PartRequestService.class);
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
    private PartRequestService partRequestService;

    private PartRequestRequestDTO requestDTO;
    private PartRequestResponseDTO responseDTO;
    private Long testPartRequestId;
    private Long testWarrantyClaimId;
    private Long testServiceCenterId;

    @BeforeEach
    void setUp() {
        Mockito.reset(partRequestService);

        testPartRequestId = 1L;
        testWarrantyClaimId = 1L;
        testServiceCenterId = 1L;

        requestDTO = new PartRequestRequestDTO();
        requestDTO.setWarrantyClaimId(testWarrantyClaimId);
        requestDTO.setFaultyPartId(1L);
        requestDTO.setServiceCenterId(testServiceCenterId);
        requestDTO.setQuantity(1);
        requestDTO.setIssueDescription("The part is damaged and needs replacement urgently");

        responseDTO = new PartRequestResponseDTO();
        responseDTO.setRequestId(testPartRequestId);
        responseDTO.setWarrantyClaimId(testWarrantyClaimId);
        responseDTO.setStatus(PartRequestStatus.PENDING);
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("POST /api/part-requests should return 201 Created for SC_TECHNICIAN")
    void createPartRequest_Success() throws Exception {
        // Arrange
        when(partRequestService.createPartRequest(any(PartRequestRequestDTO.class), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/part-requests")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").value(testPartRequestId));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("PATCH /api/part-requests/{id}/approve should return 200 OK for EVM_STAFF")
    void approvePartRequest_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.APPROVED);
        when(partRequestService.approvePartRequest(eq(testPartRequestId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/approve")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("PATCH /api/part-requests/{id}/approve should return 403 Forbidden for SC_TECHNICIAN")
    void approvePartRequest_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/approve")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/part-requests/{id} should return 200 OK when part request exists")
    void getPartRequestById_Success() throws Exception {
        // Arrange
        when(partRequestService.getPartRequestById(testPartRequestId)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/" + testPartRequestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(testPartRequestId));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/part-requests should return 200 OK with paged part requests")
    void getAllPartRequests_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(partRequestService.getAllPartRequests(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/part-requests should return 403 Forbidden for SC_STAFF")
    void getAllPartRequests_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/part-requests"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/part-requests/pending should return 200 OK with pending requests")
    void getPendingRequests_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getPendingRequests(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/pending")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/part-requests/in-transit should return 200 OK with in-transit requests")
    void getInTransitRequests_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.SHIPPED);
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getInTransitRequests(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/in-transit")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/part-requests/by-status/{status} should return 200 OK with filtered requests")
    void getPartRequestsByStatus_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getPartRequestsByStatus(eq(PartRequestStatus.PENDING), any()))
                .thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/by-status/PENDING")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("GET /api/part-requests/by-claim/{claimId} should return 200 OK with requests by claim")
    void getPartRequestsByWarrantyClaim_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getPartRequestsByWarrantyClaim(eq(testWarrantyClaimId), any()))
                .thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/by-claim/" + testWarrantyClaimId)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/part-requests/by-service-center/{serviceCenterId} should return 200 OK")
    void getPartRequestsByServiceCenter_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getPartRequestsByServiceCenter(eq(testServiceCenterId), any()))
                .thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/by-service-center/" + testServiceCenterId)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("GET /api/part-requests/my-requests should return 200 OK with technician's requests")
    void getMyPartRequests_Success() throws Exception {
        // Arrange
        PagedResponse<PartRequestResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(partRequestService.getMyPartRequests(anyString(), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/part-requests/my-requests")
                        .header("Authorization", "Bearer token")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("PATCH /api/part-requests/{id}/reject should return 200 OK for EVM_STAFF")
    void rejectPartRequest_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.REJECTED);
        when(partRequestService.rejectPartRequest(eq(testPartRequestId), anyString(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/reject")
                        .header("Authorization", "Bearer token")
                        .param("rejectionReason", "Part not available")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/part-requests/{id}/ship should return 200 OK when marked as shipped")
    void markAsShipped_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.SHIPPED);
        when(partRequestService.markAsShipped(eq(testPartRequestId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/ship")
                        .header("Authorization", "Bearer token")
                        .param("trackingNumber", "TRACK123")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("PATCH /api/part-requests/{id}/deliver should return 200 OK when marked as delivered")
    void markAsDelivered_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.DELIVERED);
        when(partRequestService.markAsDelivered(eq(testPartRequestId), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/deliver")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PATCH /api/part-requests/{id}/deliver should return 200 OK for SC_STAFF")
    void markAsDelivered_ScStaff_Success() throws Exception {
        // Arrange
        responseDTO.setStatus(PartRequestStatus.DELIVERED);
        when(partRequestService.markAsDelivered(eq(testPartRequestId), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/part-requests/" + testPartRequestId + "/deliver")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));
    }
}
