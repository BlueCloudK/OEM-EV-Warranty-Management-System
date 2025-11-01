package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.service.RecallRequestService;
import com.swp391.warrantymanagement.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(RecallRequestController.class)
@DisplayName("RecallRequestController Tests")
class RecallRequestControllerTest {

    @TestConfiguration
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public RecallRequestService recallRequestService() {
            return Mockito.mock(RecallRequestService.class);
        }

        @Bean // Provide a mock for JwtService
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RecallRequestService recallRequestService;

    private RecallRequestRequestDTO requestDTO;
    private RecallRequestResponseDTO responseDTO;
    private RecallCustomerResponseDTO customerResponseDTO;
    private Long testRecallId;
    private UUID testCustomerId;

    @BeforeEach
    void setUp() {
        Mockito.reset(recallRequestService);

        testRecallId = 1L;
        testCustomerId = UUID.randomUUID();

        requestDTO = new RecallRequestRequestDTO();
        requestDTO.setInstalledPartId(1L);
        requestDTO.setReason("Faulty battery cell causing rapid discharge.");

        responseDTO = new RecallRequestResponseDTO();
        responseDTO.setRecallRequestId(testRecallId);
        responseDTO.setInstalledPartId(1L);
        responseDTO.setReason("Faulty battery cell causing rapid discharge.");

        customerResponseDTO = new RecallCustomerResponseDTO();
        customerResponseDTO.setAccepted(true);
        customerResponseDTO.setCustomerNote("I accept the recall.");
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("POST /api/recall-requests should return 200 OK for EVM_STAFF")
    void createRecall_Success() throws Exception {
        // Arrange
        when(recallRequestService.createRecallRequest(any(RecallRequestRequestDTO.class), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/recall-requests")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/recall-requests should return 403 Forbidden for CUSTOMER")
    void createRecall_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/recall-requests")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PATCH /api/recall-requests/{id}/customer-confirm should return 200 OK for CUSTOMER")
    void customerConfirm_Success() throws Exception {
        // Arrange
        when(recallRequestService.customerConfirmRecall(eq(testRecallId), any(RecallCustomerResponseDTO.class), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/customer-confirm")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerResponseDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("PATCH /api/recall-requests/{id}/customer-confirm should return 403 Forbidden for EVM_STAFF")
    void customerConfirm_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/customer-confirm")
                        .header("Authorization", "Bearer token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerResponseDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/recall-requests/{id}/approve should return 200 OK for ADMIN")
    void approveRecall_Admin_Success() throws Exception {
        // Arrange
        when(recallRequestService.approveRecallRequest(eq(testRecallId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/approve")
                        .header("Authorization", "Bearer token")
                        .param("note", "Approved")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PATCH /api/recall-requests/{id}/approve should return 200 OK for SC_STAFF")
    void approveRecall_ScStaff_Success() throws Exception {
        // Arrange
        when(recallRequestService.approveRecallRequest(eq(testRecallId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/approve")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PATCH /api/recall-requests/{id}/approve should return 403 Forbidden for CUSTOMER")
    void approveRecall_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/approve")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/recall-requests/{id}/reject should return 200 OK for ADMIN")
    void rejectRecall_Admin_Success() throws Exception {
        // Arrange
        when(recallRequestService.rejectRecallRequest(eq(testRecallId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/reject")
                        .header("Authorization", "Bearer token")
                        .param("note", "Not critical")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("PATCH /api/recall-requests/{id}/reject should return 200 OK for SC_STAFF")
    void rejectRecall_ScStaff_Success() throws Exception {
        // Arrange
        when(recallRequestService.rejectRecallRequest(eq(testRecallId), any(), anyString()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/reject")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("PATCH /api/recall-requests/{id}/reject should return 403 Forbidden for EVM_STAFF alone")
    void rejectRecall_Forbidden() throws Exception {
        // Act & Assert - EVM_STAFF cannot reject, only ADMIN or SC_STAFF
        mockMvc.perform(patch("/api/recall-requests/" + testRecallId + "/reject")
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/recall-requests/admin should return 200 OK with list of recalls for ADMIN")
    void getForAdmin_Admin_Success() throws Exception {
        // Arrange
        List<RecallRequestResponseDTO> recalls = Arrays.asList(responseDTO);
        when(recallRequestService.getRecallRequestsForAdmin()).thenReturn(recalls);

        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/recall-requests/admin should return 200 OK for EVM_STAFF")
    void getForAdmin_EvmStaff_Success() throws Exception {
        // Arrange
        List<RecallRequestResponseDTO> recalls = Arrays.asList(responseDTO);
        when(recallRequestService.getRecallRequestsForAdmin()).thenReturn(recalls);

        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/admin"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/recall-requests/admin should return 200 OK for SC_STAFF")
    void getForAdmin_ScStaff_Success() throws Exception {
        // Arrange
        List<RecallRequestResponseDTO> recalls = Arrays.asList(responseDTO);
        when(recallRequestService.getRecallRequestsForAdmin()).thenReturn(recalls);

        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/admin"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/recall-requests/admin should return 403 Forbidden for CUSTOMER")
    void getForAdmin_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/admin"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/recall-requests/customer/{customerId} should return 200 OK for CUSTOMER")
    void getForCustomer_Success() throws Exception {
        // Arrange
        List<RecallRequestResponseDTO> recalls = Arrays.asList(responseDTO);
        when(recallRequestService.getRecallRequestsForCustomer(testCustomerId)).thenReturn(recalls);

        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/customer/" + testCustomerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/recall-requests/customer/{customerId} should return 403 Forbidden for EVM_STAFF")
    void getForCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/customer/" + testCustomerId))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/recall-requests/my-recalls should return 200 OK for CUSTOMER")
    void getMyRecalls_Success() throws Exception {
        // Arrange
        List<RecallRequestResponseDTO> recalls = Arrays.asList(responseDTO);
        when(recallRequestService.getMyRecallRequests(anyString())).thenReturn(recalls);

        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/my-recalls")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].recallRequestId").value(testRecallId));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/recall-requests/my-recalls should return 403 Forbidden for SC_STAFF")
    void getMyRecalls_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/recall-requests/my-recalls")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("DELETE /api/recall-requests/{id} should return 204 No Content for EVM_STAFF")
    void deleteRecall_Success() throws Exception {
        // Arrange
        doNothing().when(recallRequestService).deleteRecallRequest(eq(testRecallId), anyString());

        // Act & Assert
        mockMvc.perform(delete("/api/recall-requests/" + testRecallId)
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/recall-requests/{id} should return 403 Forbidden for ADMIN")
    void deleteRecall_Forbidden() throws Exception {
        // Act & Assert - Only EVM_STAFF can delete
        mockMvc.perform(delete("/api/recall-requests/" + testRecallId)
                        .header("Authorization", "Bearer token")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
