package com.swp391.warrantymanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class OemEvWarrantyManagementSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(com.swp391.warrantymanagement.controller.AuthController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@org.springframework.context.annotation.Import(AuthControllerPasswordAndValidationTest.Config.class)
class AuthControllerPasswordAndValidationTest {

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private com.swp391.warrantymanagement.service.AuthService authService;

    @org.springframework.boot.test.context.TestConfiguration
    static class Config {
        @org.springframework.context.annotation.Bean
        com.swp391.warrantymanagement.service.AuthService authService() {
            return org.mockito.Mockito.mock(com.swp391.warrantymanagement.service.AuthService.class);
        }
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("Should send forgot-password email successfully")
    void forgotPassword_success() throws Exception {
        org.mockito.Mockito.doNothing().when(authService).processForgotPassword(org.mockito.ArgumentMatchers.any());

        String body = "{\n" +
                "  \"email\": \"user@example.com\"\n" +
                "}";

        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/forgot-password")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message").value("Password reset email sent"));
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("Should return 400 when forgot-password fails (email not found)")
    void forgotPassword_failure() throws Exception {
        org.mockito.Mockito.doThrow(new RuntimeException("Email not found")).when(authService).processForgotPassword(org.mockito.ArgumentMatchers.any());

        String body = "{\n" +
                "  \"email\": \"missing@example.com\"\n" +
                "}";

        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/forgot-password")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadRequest())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(false))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message").value("Email not found"));
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("Should reset password successfully")
    void resetPassword_success() throws Exception {
        org.mockito.Mockito.doNothing().when(authService).processResetPassword(org.mockito.ArgumentMatchers.any());

        String body = "{\n" +
                "  \"resetToken\": \"rtok\",\n" +
                "  \"newPassword\": \"secret12\",\n" +
                "  \"confirmPassword\": \"secret12\"\n" +
                "}";

        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/reset-password")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message").value("Password reset successfully"));
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("Should return 400 when reset-password fails (invalid token)")
    void resetPassword_failure() throws Exception {
        org.mockito.Mockito.doThrow(new RuntimeException("Reset token invalid")).when(authService).processResetPassword(org.mockito.ArgumentMatchers.any());

        String body = "{\n" +
                "  \"resetToken\": \"bad\",\n" +
                "  \"newPassword\": \"secret12\",\n" +
                "  \"confirmPassword\": \"secret12\"\n" +
                "}";

        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/reset-password")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadRequest())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(false))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message").value("Reset token invalid"));
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("Should return 401 when token validation fails (service throws)")
    void validateToken_service_unauthorized() throws Exception {
        org.mockito.Mockito.when(authService.validateToken(org.mockito.ArgumentMatchers.eq("expired"))).thenThrow(new RuntimeException("Token expired"));

        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/auth/validate")
                                .header("Authorization", "Bearer expired")
                )
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message").value("Token expired"));
    }
}
