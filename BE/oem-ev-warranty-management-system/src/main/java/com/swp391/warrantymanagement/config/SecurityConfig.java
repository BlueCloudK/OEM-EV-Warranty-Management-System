package com.swp391.warrantymanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF để dùng API REST
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless cho JWT
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - không cần authentication
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                // Swagger UI endpoints - cho phép truy cập để test API
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/swagger-resources/**").permitAll()
                .requestMatchers("/webjars/**").permitAll()

                // Admin endpoints - chỉ ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Staff endpoints - ADMIN hoặc STAFF
                .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")

                // Vehicle endpoints - sử dụng method-level security
                .requestMatchers("/api/vehicles/**").authenticated()

                // Customer endpoints - authenticated users
                .requestMatchers("/api/customers/**").authenticated()

                // Warranty claims endpoints
                .requestMatchers("/api/warranty-claims/**").authenticated()

                // Parts endpoints
                .requestMatchers("/api/parts/**").authenticated()

                // Service history endpoints
                .requestMatchers("/api/service-histories/**").authenticated()

                // Tất cả request khác cần authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Tắt form login mặc định
            .httpBasic(basic -> basic.disable()); // Tắt HTTP Basic Auth

        // TODO: Add JWT filter here when implementing JWT authentication
        // http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
