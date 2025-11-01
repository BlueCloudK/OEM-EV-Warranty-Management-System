package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = WarrantyClaimController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("WarrantyClaimController Tests")
class WarrantyClaimControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public WarrantyClaimService warrantyClaimService() {
            return Mockito.mock(WarrantyClaimService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable);
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WarrantyClaimService warrantyClaimService;

    @Autowired
    private ObjectMapper objectMapper;

    private WarrantyClaimRequestDTO requestDTO;
    private WarrantyClaimResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        Mockito.reset(warrantyClaimService);

        requestDTO = new WarrantyClaimRequestDTO();
        requestDTO.setVehicleId(1L);
        requestDTO.setInstalledPartId(1L);
        requestDTO.setDescription("Engine noise during acceleration.");

        responseDTO = new WarrantyClaimResponseDTO();
        responseDTO.setWarrantyClaimId(1L);
        responseDTO.setVehicleId(1L);
        responseDTO.setDescription("Engine noise during acceleration.");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/warranty-claims should return 200 OK with paged claims")
    void getAllClaims_Success() throws Exception {
        // Arrange
        PagedResponse<WarrantyClaimResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(warrantyClaimService.getAllClaimsPage(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/warranty-claims should return 403 Forbidden for CUSTOMER")
    void getAllClaims_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/warranty-claims/{id} should return 200 OK when claim exists")
    void getClaimById_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.getClaimById(1L)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/warranty-claims/{id} should return 404 Not Found when claim does not exist")
    void getClaimById_NotFound() throws Exception {
        // Arrange
        when(warrantyClaimService.getClaimById(1L)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/warranty-claims should return 201 Created for SC_STAFF")
    void createClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.createClaim(any(WarrantyClaimRequestDTO.class))).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/warranty-claims")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/warranty-claims should return 403 Forbidden for CUSTOMER")
    void createClaim_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/warranty-claims")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PUT /api/warranty-claims/{id} should return 200 OK when update is successful")
    void updateClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.updateClaim(eq(1L), any(WarrantyClaimRequestDTO.class)))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/warranty-claims/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/warranty-claims/{id} should return 404 Not Found when claim does not exist")
    void updateClaim_NotFound() throws Exception {
        // Arrange
        when(warrantyClaimService.updateClaim(eq(1L), any(WarrantyClaimRequestDTO.class)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/warranty-claims/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/warranty-claims/{id}/status should return 200 OK when status update is successful")
    void updateClaimStatus_Success() throws Exception {
        // Arrange
        WarrantyClaimStatusUpdateRequestDTO statusDTO = new WarrantyClaimStatusUpdateRequestDTO();
        statusDTO.setStatus(WarrantyClaimStatus.COMPLETED);
        statusDTO.setUpdatedBy("admin_user");
        statusDTO.setComments("Claim approved and completed");

        when(warrantyClaimService.updateClaimStatus(eq(1L), any(WarrantyClaimStatusUpdateRequestDTO.class)))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PATCH /api/warranty-claims/{id}/status should return 403 Forbidden for SC_STAFF")
    void updateClaimStatus_Forbidden() throws Exception {
        // Arrange
        WarrantyClaimStatusUpdateRequestDTO statusDTO = new WarrantyClaimStatusUpdateRequestDTO();
        statusDTO.setStatus(WarrantyClaimStatus.COMPLETED);
        statusDTO.setUpdatedBy("sc_staff_user");

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/warranty-claims/{id} should return 204 No Content when deletion is successful")
    void deleteClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.deleteClaim(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/warranty-claims/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/warranty-claims/{id} should return 404 Not Found when claim does not exist")
    void deleteClaim_NotFound() throws Exception {
        // Arrange
        when(warrantyClaimService.deleteClaim(1L)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/warranty-claims/1")
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/warranty-claims/sc-create should return 201 Created for SC_STAFF")
    void createClaimBySCStaff_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.createClaimBySCStaff(any(WarrantyClaimRequestDTO.class)))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/warranty-claims/sc-create")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/warranty-claims/{id}/admin-accept should return 200 OK for ADMIN")
    void adminAcceptClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.adminAcceptClaim(any(Long.class), any()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/admin-accept")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/warranty-claims/{id}/admin-reject should return 200 OK for ADMIN")
    void adminRejectClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.adminRejectClaim(eq(1L), anyString())).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/admin-reject")
                        .param("reason", "Not covered by warranty")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("PATCH /api/warranty-claims/{id}/tech-start should return 200 OK for SC_TECHNICIAN")
    void techStartProcessing_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.techStartProcessing(any(Long.class), any()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/tech-start")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PATCH /api/warranty-claims/{id}/tech-start should return 403 Forbidden for CUSTOMER")
    void techStartProcessing_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/tech-start")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("PATCH /api/warranty-claims/{id}/tech-complete should return 200 OK for SC_TECHNICIAN")
    void techCompleteClaim_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.techCompleteClaim(eq(1L), anyString())).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/warranty-claims/1/tech-complete")
                        .param("completionNote", "Repair completed successfully")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/warranty-claims/by-status/{status} should return 200 OK with claims by status")
    void getClaimsByStatus_Success() throws Exception {
        // Arrange
        PagedResponse<WarrantyClaimResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(warrantyClaimService.getClaimsByStatus(eq("SUBMITTED"), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/by-status/SUBMITTED")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/warranty-claims/admin-pending should return 200 OK with pending claims")
    void getAdminPendingClaims_Success() throws Exception {
        // Arrange
        PagedResponse<WarrantyClaimResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(warrantyClaimService.getClaimsByStatus(eq("SUBMITTED"), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/admin-pending")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/warranty-claims/admin-pending should return 403 Forbidden for SC_STAFF")
    void getAdminPendingClaims_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/admin-pending"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("GET /api/warranty-claims/tech-pending should return 200 OK with technician pending claims")
    void getTechPendingClaims_Success() throws Exception {
        // Arrange
        PagedResponse<WarrantyClaimResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(warrantyClaimService.getTechPendingClaims(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/tech-pending")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/warranty-claims/tech-pending should return 403 Forbidden for CUSTOMER")
    void getTechPendingClaims_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/warranty-claims/tech-pending"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/warranty-claims/{claimId}/assign-to-me should return 200 OK when assignment is successful")
    void assignClaimToMe_Success() throws Exception {
        // Arrange
        when(warrantyClaimService.assignClaimToMe(eq(1L), eq(2L))).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/warranty-claims/1/assign-to-me")
                        .param("userId", "2")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/warranty-claims/{claimId}/assign-to-me should return 400 Bad Request on error")
    void assignClaimToMe_BadRequest() throws Exception {
        // Arrange
        when(warrantyClaimService.assignClaimToMe(eq(1L), eq(2L)))
                .thenThrow(new RuntimeException("Claim already assigned"));

        // Act & Assert
        mockMvc.perform(post("/api/warranty-claims/1/assign-to-me")
                        .param("userId", "2")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
}

