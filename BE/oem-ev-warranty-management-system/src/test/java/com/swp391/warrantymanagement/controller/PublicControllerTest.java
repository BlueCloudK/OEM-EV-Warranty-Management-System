package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
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
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(value = PublicController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@Import(PublicControllerTest.ControllerTestConfig.class)
@DisplayName("PublicController Tests")
class PublicControllerTest {

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
    private ServiceCenterService serviceCenterService;

    @Test
    @DisplayName("GET /api/public/service-centers should return 200 OK")
    void getAllServiceCenters_Success() throws Exception {
        // Arrange
        PagedResponse<ServiceCenterResponseDTO> pagedResponse = new PagedResponse<>(Collections.emptyList(), 0, 10, 0, 1, true, true);
        when(serviceCenterService.getAllServiceCenters(any(Pageable.class))).thenReturn(pagedResponse);

        // Act & Assert
        mockMvc.perform(get("/api/public/service-centers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/public/service-centers/{id} should return 200 OK")
    void getServiceCenterById_Success() throws Exception {
        // Arrange
        ServiceCenterResponseDTO responseDTO = new ServiceCenterResponseDTO();
        responseDTO.setServiceCenterId(1L);
        when(serviceCenterService.getServiceCenterById(1L)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/api/public/service-centers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCenterId").value(1L));
    }
}
