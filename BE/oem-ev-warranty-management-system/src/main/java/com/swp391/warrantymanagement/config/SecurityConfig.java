package com.swp391.warrantymanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF để dùng API REST
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Cho phép tất cả request (không cần authentication)
            )
            .formLogin(form -> form.disable()) // Tắt form login mặc định
            .httpBasic(basic -> basic.disable()); // Tắt HTTP Basic Auth

        return http.build();
    }
}
