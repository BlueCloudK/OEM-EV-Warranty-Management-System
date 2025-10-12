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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enable @PreAuthorize annotations
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    } // Sử dụng BCrypt để mã hóa password trong database

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception { // Cấu hình AuthenticationManager để sử dụng trong AuthController
        return config.getAuthenticationManager(); // Lấy AuthenticationManager từ cấu hình của Spring Security
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { // Cấu hình Security Filter Chain cho ứng dụng Spring Security
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF(Cross-Site Request Forgery là một loại tấn công mạng mà kẻ tấn công giả mạo người dùng hợp pháp để thực hiện các hành động không mong muốn trên ứng dụng web mà người dùng đã xác thực trước đó.) vì ta dùng JWT, không cần session nên không cần CSRF mà k tắt thì sẽ bị lỗi 403 khi gọi API POST, PUT, DELETE
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Sử dụng JWT, không dùng session nên set policy là STATELESS để server không lưu session chỉ nên dùng session khi hệ thống cần lưu trạng thái người dùng (như web app truyền thống)
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Nếu muốn chỉ cho phép domain FE truy cập, dùng dòng dưới:
        // configuration.setAllowedOrigins(List.of("https://your-frontend.com")); // Thay bằng domain FE thật
        // Nếu muốn cho phép mọi domain truy cập, dùng dòng dưới:
        configuration.setAllowedOriginPatterns(List.of("*")); // Cho phép mọi domain truy cập
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
