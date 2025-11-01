package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.WorkLogService;
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

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = WorkLogController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("WorkLogController Tests")
class WorkLogControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public WorkLogService workLogService() {
            return Mockito.mock(WorkLogService.class);
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
    private WorkLogService workLogService;

    private WorkLogRequestDTO requestDTO;
    private WorkLogResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        Mockito.reset(workLogService);

        requestDTO = new WorkLogRequestDTO();
        requestDTO.setWarrantyClaimId(1L);
        requestDTO.setStartTime(LocalDateTime.now().minusHours(2));
        requestDTO.setEndTime(LocalDateTime.now().minusHours(1));
        requestDTO.setDescription("Initial diagnosis");

        responseDTO = new WorkLogResponseDTO();
        responseDTO.setWorkLogId(1L);
        responseDTO.setWarrantyClaimId(1L);
        responseDTO.setDescription("Initial diagnosis");
    }

    // ==================== GET ALL WORK LOGS ====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/work-logs should return 200 OK with paged work logs for ADMIN")
    void getAllWorkLogs_Success_Admin() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(workLogService.getAllWorkLogs(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].workLogId").value(1L));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/work-logs should return 200 OK for EVM_STAFF")
    void getAllWorkLogs_Success_EvmStaff() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(workLogService.getAllWorkLogs(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/work-logs should return 403 Forbidden for CUSTOMER")
    void getAllWorkLogs_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/work-logs"))
                .andExpect(status().isForbidden());
    }

    // ==================== GET WORK LOG BY ID ====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/work-logs/{id} should return 200 OK when work log exists")
    void getWorkLogById_Success() throws Exception {
        // Arrange
        when(workLogService.getWorkLogById(1L)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workLogId").value(1L))
                .andExpect(jsonPath("$.warrantyClaimId").value(1L));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/work-logs/{id} should return 404 Not Found when work log does not exist")
    void getWorkLogById_NotFound() throws Exception {
        // Arrange
        when(workLogService.getWorkLogById(1L)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/work-logs/{id} should return 403 Forbidden for CUSTOMER")
    void getWorkLogById_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/work-logs/1"))
                .andExpect(status().isForbidden());
    }

    // ==================== CREATE WORK LOG ====================

    @Test
    @WithMockUser(username = "test-staff", roles = "EVM_STAFF")
    @DisplayName("POST /api/work-logs should return 201 Created for authorized user")
    void createWorkLog_Success() throws Exception {
        // Arrange
        when(workLogService.createWorkLog(any(WorkLogRequestDTO.class), anyLong()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/work-logs")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.workLogId").value(1L))
                .andExpect(jsonPath("$.warrantyClaimId").value(1L))
                .andExpect(jsonPath("$.description").value("Initial diagnosis"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/work-logs should return 403 Forbidden for unauthorized role")
    void createWorkLog_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/work-logs")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staff", roles = "EVM_STAFF")
    @DisplayName("POST /api/work-logs should return 400 Bad Request when service throws RuntimeException")
    void createWorkLog_ServiceException() throws Exception {
        // Arrange
        when(workLogService.createWorkLog(any(WorkLogRequestDTO.class), anyLong()))
                .thenThrow(new RuntimeException("Invalid warranty claim ID"));

        // Act & Assert
        mockMvc.perform(post("/api/work-logs")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest());
    }

    // ==================== UPDATE WORK LOG ====================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    @DisplayName("PUT /api/work-logs/{id} should return 200 OK when update is successful")
    void updateWorkLog_Success() throws Exception {
        // Arrange
        when(workLogService.updateWorkLog(eq(1L), any(WorkLogRequestDTO.class), anyLong()))
                .thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/work-logs/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workLogId").value(1L));
    }

    @Test
    @WithMockUser(username = "staff", roles = "EVM_STAFF")
    @DisplayName("PUT /api/work-logs/{id} should return 404 Not Found when work log does not exist")
    void updateWorkLog_NotFound() throws Exception {
        // Arrange
        when(workLogService.updateWorkLog(eq(1L), any(WorkLogRequestDTO.class), anyLong()))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/work-logs/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PUT /api/work-logs/{id} should return 403 Forbidden for CUSTOMER")
    void updateWorkLog_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/api/work-logs/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isForbidden());
    }

    // ==================== DELETE WORK LOG ====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/work-logs/{id} should return 204 No Content when deletion is successful")
    void deleteWorkLog_Success() throws Exception {
        // Arrange
        when(workLogService.deleteWorkLog(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/work-logs/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/work-logs/{id} should return 404 Not Found when work log does not exist")
    void deleteWorkLog_NotFound() throws Exception {
        // Arrange
        when(workLogService.deleteWorkLog(1L)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/work-logs/1")
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("DELETE /api/work-logs/{id} should return 403 Forbidden for EVM_STAFF")
    void deleteWorkLog_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/work-logs/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    // ==================== GET WORK LOGS BY CLAIM ====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/work-logs/by-claim/{claimId} should return 200 OK with work logs by claim")
    void getWorkLogsByWarrantyClaim_Success() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(workLogService.getWorkLogsByWarrantyClaim(eq(1L), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-claim/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].workLogId").value(1L));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/work-logs/by-claim/{claimId} should return 200 OK for SC_STAFF")
    void getWorkLogsByWarrantyClaim_Success_ScStaff() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(workLogService.getWorkLogsByWarrantyClaim(eq(1L), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-claim/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/work-logs/by-claim/{claimId} should return 403 Forbidden for CUSTOMER")
    void getWorkLogsByWarrantyClaim_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-claim/1"))
                .andExpect(status().isForbidden());
    }

    // ==================== GET WORK LOGS BY USER ====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/work-logs/by-user/{userId} should return 200 OK with work logs by user")
    void getWorkLogsByUser_Success() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(workLogService.getWorkLogsByUser(eq(1L), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-user/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].workLogId").value(1L));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/work-logs/by-user/{userId} should return 200 OK for EVM_STAFF")
    void getWorkLogsByUser_Success_EvmStaff() throws Exception {
        // Arrange
        PagedResponse<WorkLogResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Collections.singletonList(responseDTO));
        pagedResponse.setTotalElements(1L);

        when(workLogService.getWorkLogsByUser(eq(1L), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/work-logs/by-user/{userId} should return 403 Forbidden for CUSTOMER")
    void getWorkLogsByUser_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/work-logs/by-user/1"))
                .andExpect(status().isForbidden());
    }
}
