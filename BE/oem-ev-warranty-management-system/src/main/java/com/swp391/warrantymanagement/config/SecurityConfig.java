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

                // CRUD operations - cần authentication và phân quyền
                // Admin có thể làm tất cả
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Staff có thể CRUD hầu hết resource
                .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")

                // Customer chỉ được xem và tạo warranty claim của mình
                .requestMatchers("/api/customers/me/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                // Vehicles - phân quyền theo method
                .requestMatchers("/api/vehicles").hasAnyRole("ADMIN", "STAFF") // GET all
                .requestMatchers("/api/vehicles/**").hasAnyRole("ADMIN", "STAFF", "CUSTOMER") // GET by ID

                // Warranty Claims
                .requestMatchers("/api/warranty-claims").hasAnyRole("ADMIN", "STAFF") // GET all
                .requestMatchers("/api/warranty-claims/**").authenticated() // CRUD theo rule business

                // Parts - chỉ Admin và Staff
                .requestMatchers("/api/parts/**").hasAnyRole("ADMIN", "STAFF")

                // Service History
                .requestMatchers("/api/service-histories/**").hasAnyRole("ADMIN", "STAFF")

                // Customers - phân quyền theo role
                .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "STAFF")

                // Tất cả request khác cần authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Tắt form login
            .httpBasic(basic -> basic.disable()) // Tắt HTTP Basic Auth
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Thêm JWT filter

        return http.build();
    }
}
