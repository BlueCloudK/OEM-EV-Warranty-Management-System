package com.swp391.warrantymanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enable @PreAuthorize annotations
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - không cần authentication
                .requestMatchers("/api/auth/**").permitAll() // Login, Register
                .requestMatchers("/api/public/**").permitAll()

                // Swagger UI endpoints
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // Health check
                .requestMatchers("/actuator/**", "/health").permitAll()

                // ADMIN - Quyền cao nhất, có thể làm tất cả
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "SC_STAFF", "EVM_STAFF")

                // EVM_STAFF - Nhân viên nhà sản xuất: quản lý vehicles, parts, warranty policies
                .requestMatchers("/api/vehicles/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "SC_TECHNICIAN", "CUSTOMER")
                .requestMatchers("/api/parts/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF")

                // SC_STAFF - Nhân viên trung tâm bảo hành: quản lý warranty claims, service histories
                .requestMatchers("/api/warranty-claims/**").hasAnyRole("ADMIN", "SC_STAFF", "SC_TECHNICIAN", "CUSTOMER")
                .requestMatchers("/api/service-histories/**").hasAnyRole("ADMIN", "SC_STAFF", "SC_TECHNICIAN")

                // SC_TECHNICIAN - Kỹ thuật viên: xem và cập nhật service histories, warranty claims
                // (Quyền đã được định nghĩa ở trên cùng với SC_STAFF)

                // CUSTOMER - Khách hàng: chỉ xem thông tin của mình và tạo warranty claim
                .requestMatchers("/api/customers/me/**").hasAnyRole("CUSTOMER", "SC_STAFF", "SC_TECHNICIAN", "ADMIN")

                // Tất cả request khác cần authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Tắt form login
            .httpBasic(basic -> basic.disable()) // Tắt HTTP Basic Auth
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Thêm JWT filter

        return http.build();
    }
}
