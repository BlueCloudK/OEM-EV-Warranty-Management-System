package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.FeedbackService;
import org.junit.jupiter.api.BeforeEach;
import com.swp391.warrantymanagement.service.JwtService;
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

@WebMvcTest(value = FeedbackController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@DisplayName("FeedbackController Tests")
class FeedbackControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public FeedbackService feedbackService() {
            return Mockito.mock(FeedbackService.class);
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
    private FeedbackService feedbackService;

    private FeedbackRequestDTO feedbackRequestDTO;
    private FeedbackResponseDTO feedbackResponseDTO;
    private UUID testCustomerId;
    private Long testFeedbackId;
    private Long testClaimId;

    @BeforeEach
    void setUp() {
        Mockito.reset(feedbackService);

        testCustomerId = UUID.randomUUID();
        testFeedbackId = 1L;
        testClaimId = 1L;

        feedbackRequestDTO = new FeedbackRequestDTO();
        feedbackRequestDTO.setWarrantyClaimId(testClaimId);
        feedbackRequestDTO.setRating(5);
        feedbackRequestDTO.setComment("Great service!");

        feedbackResponseDTO = new FeedbackResponseDTO();
        feedbackResponseDTO.setFeedbackId(testFeedbackId);
        feedbackResponseDTO.setWarrantyClaimId(testClaimId);
        feedbackResponseDTO.setRating(5);
        feedbackResponseDTO.setComment("Great service!");
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/feedbacks should return 201 Created for CUSTOMER")
    void createFeedback_Customer_Success() throws Exception {
        // Arrange
        when(feedbackService.createFeedback(any(FeedbackRequestDTO.class), eq(testCustomerId))).thenReturn(feedbackResponseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/feedbacks")
                        .param("customerId", testCustomerId.toString())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedbackRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.feedbackId").value(testFeedbackId));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("POST /api/feedbacks should return 403 Forbidden for non-CUSTOMER")
    void createFeedback_Staff_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/feedbacks")
                        .param("customerId", testCustomerId.toString())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedbackRequestDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks/{id} should return 200 OK when feedback exists")
    void getFeedbackById_Success() throws Exception {
        // Arrange
        when(feedbackService.getFeedbackById(testFeedbackId)).thenReturn(feedbackResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/" + testFeedbackId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feedbackId").value(testFeedbackId))
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks/by-claim/{claimId} should return 200 OK when feedback exists")
    void getFeedbackByClaimId_Success() throws Exception {
        // Arrange
        when(feedbackService.getFeedbackByClaimId(testClaimId)).thenReturn(feedbackResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/by-claim/" + testClaimId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warrantyClaimId").value(testClaimId));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/feedbacks/by-customer/{customerId} should return 200 OK with paged feedbacks")
    void getFeedbacksByCustomer_Success() throws Exception {
        // Arrange
        PagedResponse<FeedbackResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(feedbackResponseDTO));
        pagedResponse.setTotalElements(1L);
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);

        when(feedbackService.getFeedbacksByCustomer(eq(testCustomerId), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/by-customer/" + testCustomerId)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks should return 200 OK with paged feedbacks")
    void getAllFeedbacks_Success() throws Exception {
        // Arrange
        PagedResponse<FeedbackResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(feedbackResponseDTO));
        pagedResponse.setTotalElements(1L);

        when(feedbackService.getAllFeedbacks(any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/feedbacks/by-rating/{rating} should return 200 OK with paged feedbacks")
    void getFeedbacksByRating_Success() throws Exception {
        // Arrange
        PagedResponse<FeedbackResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(feedbackResponseDTO));
        pagedResponse.setTotalElements(1L);

        when(feedbackService.getFeedbacksByRating(eq(5), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/by-rating/5")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/feedbacks/min-rating/{rating} should return 200 OK with paged feedbacks")
    void getFeedbacksByMinRating_Success() throws Exception {
        // Arrange
        PagedResponse<FeedbackResponseDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(Arrays.asList(feedbackResponseDTO));
        pagedResponse.setTotalElements(1L);

        when(feedbackService.getFeedbacksByMinRating(eq(4), any())).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/min-rating/4")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("PUT /api/feedbacks/{id} should return 200 OK when update is successful")
    void updateFeedback_Success() throws Exception {
        // Arrange
        FeedbackRequestDTO updateDTO = new FeedbackRequestDTO();
        updateDTO.setWarrantyClaimId(testClaimId);
        updateDTO.setRating(4);
        updateDTO.setComment("Updated comment");

        FeedbackResponseDTO updatedResponse = new FeedbackResponseDTO();
        updatedResponse.setFeedbackId(testFeedbackId);
        updatedResponse.setRating(4);
        updatedResponse.setComment("Updated comment");

        when(feedbackService.updateFeedback(eq(testFeedbackId), any(FeedbackRequestDTO.class), eq(testCustomerId)))
                .thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(put("/api/feedbacks/" + testFeedbackId)
                        .param("customerId", testCustomerId.toString())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("DELETE /api/feedbacks/{id} should return 200 OK when deletion is successful")
    void deleteFeedback_Customer_Success() throws Exception {
        // Arrange
        doNothing().when(feedbackService).deleteFeedback(testFeedbackId, testCustomerId);

        // Act & Assert
        mockMvc.perform(delete("/api/feedbacks/" + testFeedbackId)
                        .param("customerId", testCustomerId.toString())
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Feedback deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/feedbacks/{id} should return 200 OK for ADMIN")
    void deleteFeedback_Admin_Success() throws Exception {
        // Arrange
        doNothing().when(feedbackService).deleteFeedback(testFeedbackId, testCustomerId);

        // Act & Assert
        mockMvc.perform(delete("/api/feedbacks/" + testFeedbackId)
                        .param("customerId", testCustomerId.toString())
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Feedback deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks/statistics/average-rating should return 200 OK with average rating")
    void getAverageRating_Success() throws Exception {
        // Arrange
        when(feedbackService.getAverageRating()).thenReturn(4.5);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/average-rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.5));
    }

    @Test
    @WithMockUser(roles = "SC_STAFF")
    @DisplayName("GET /api/feedbacks/statistics/service-center/{serviceCenterId}/average-rating should return 200 OK")
    void getAverageRatingByServiceCenter_Success() throws Exception {
        // Arrange
        Long serviceCenterId = 1L;
        when(feedbackService.getAverageRatingByServiceCenter(serviceCenterId)).thenReturn(4.8);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/service-center/" + serviceCenterId + "/average-rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCenterId").value(serviceCenterId))
                .andExpect(jsonPath("$.averageRating").value(4.8));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks/statistics/count-by-rating/{rating} should return 200 OK with count")
    void countByRating_Success() throws Exception {
        // Arrange
        Integer rating = 5;
        when(feedbackService.countByRating(rating)).thenReturn(10L);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/count-by-rating/" + rating))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(rating))
                .andExpect(jsonPath("$.count").value(10));
    }

    @Test
    @WithMockUser(roles = "EVM_STAFF")
    @DisplayName("GET /api/feedbacks/statistics/count-by-rating/{rating} should work for EVM_STAFF")
    void countByRating_EvmStaff_Success() throws Exception {
        // Arrange
        Integer rating = 4;
        when(feedbackService.countByRating(rating)).thenReturn(15L);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/count-by-rating/" + rating))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(rating))
                .andExpect(jsonPath("$.count").value(15));
    }

    @Test
    @WithMockUser(roles = "SC_TECHNICIAN")
    @DisplayName("GET /api/feedbacks/statistics/summary should return 200 OK with statistics")
    void getFeedbackStatistics_Success() throws Exception {
        // Arrange
        when(feedbackService.getAverageRating()).thenReturn(4.5);
        when(feedbackService.countByRating(1)).thenReturn(2L);
        when(feedbackService.countByRating(2)).thenReturn(3L);
        when(feedbackService.countByRating(3)).thenReturn(5L);
        when(feedbackService.countByRating(4)).thenReturn(8L);
        when(feedbackService.countByRating(5)).thenReturn(10L);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.5))
                .andExpect(jsonPath("$.ratingCounts['1']").value(2))
                .andExpect(jsonPath("$.ratingCounts['2']").value(3))
                .andExpect(jsonPath("$.ratingCounts['3']").value(5))
                .andExpect(jsonPath("$.ratingCounts['4']").value(8))
                .andExpect(jsonPath("$.ratingCounts['5']").value(10));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/feedbacks/statistics/summary should handle null average rating")
    void getFeedbackStatistics_NullAverageRating_ReturnsZero() throws Exception {
        // Arrange
        when(feedbackService.getAverageRating()).thenReturn(null);
        when(feedbackService.countByRating(1)).thenReturn(0L);
        when(feedbackService.countByRating(2)).thenReturn(0L);
        when(feedbackService.countByRating(3)).thenReturn(0L);
        when(feedbackService.countByRating(4)).thenReturn(0L);
        when(feedbackService.countByRating(5)).thenReturn(0L);

        // Act & Assert
        mockMvc.perform(get("/api/feedbacks/statistics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(0.0))
                .andExpect(jsonPath("$.ratingCounts['1']").value(0))
                .andExpect(jsonPath("$.ratingCounts['5']").value(0));
    }
}
