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
import org.springframework.http.HttpMethod;

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
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh",
                                "/api/auth/forgot-password", "/api/auth/reset-password").permitAll() // Chỉ cho phép các endpoint công khai
                .requestMatchers("/api/auth/admin/**").hasRole("ADMIN") // Bảo vệ endpoint admin
                .requestMatchers("/api/auth/**").authenticated() // Các endpoint auth khác cần authentication
                .requestMatchers("/api/public/**").permitAll()

                // Service Centers - PUBLIC ACCESS (must be BEFORE other rules)
                .requestMatchers("/api/service-centers/**").permitAll()

                // Swagger UI endpoints
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // Health check
                .requestMatchers("/actuator/**", "/health").permitAll()

                // ADMIN - Quyền cao nhất, có thể làm tất cả
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // User Management - chỉ ADMIN
                .requestMatchers("/api/admin/users/**").hasRole("ADMIN")

                // Cho phép customer cập nhật thông tin cá nhân
                .requestMatchers("/api/customers/profile").hasRole("CUSTOMER")
                // Customers
                .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "SC_STAFF", "EVM_STAFF")

                // EVM_STAFF - Nhân viên nhà sản xuất: quản lý vehicles, parts, warranty policies
                .requestMatchers("/api/vehicles/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "SC_TECHNICIAN", "CUSTOMER")
                .requestMatchers("/api/parts/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF")

                // Installed Parts
                .requestMatchers("/api/installed-parts/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "SC_TECHNICIAN", "CUSTOMER")

                // SC_STAFF - Nhân viên trung tâm bảo hành: quản lý warranty claims, service histories
                // CUSTOMER có thể xem warranty claims của mình qua endpoint /my-claims
                .requestMatchers("/api/warranty-claims/my-claims/**").hasRole("CUSTOMER")
                .requestMatchers("/api/warranty-claims/**").hasAnyRole("ADMIN", "SC_STAFF", "SC_TECHNICIAN", "EVM_STAFF")
                .requestMatchers("/api/service-histories/**").hasAnyRole("ADMIN", "SC_STAFF", "SC_TECHNICIAN", "EVM_STAFF", "CUSTOMER")

                // Feedbacks
                .requestMatchers("/api/feedbacks/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "SC_TECHNICIAN", "CUSTOMER")

                // Work Logs
                .requestMatchers("/api/work-logs/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF")

                // Part Requests - Yêu cầu linh kiện từ Technician đến EVM
                .requestMatchers("/api/part-requests/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "SC_TECHNICIAN")

                // Recall Requests - Yêu cầu recall từ EVM đến khách hàng
                .requestMatchers("/api/recall-requests/my-recalls").hasRole("CUSTOMER")
                .requestMatchers("/api/recall-requests/admin").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF")
                .requestMatchers("/api/recall-requests/**").hasAnyRole("ADMIN", "EVM_STAFF", "SC_STAFF", "CUSTOMER")

                // SC_TECHNICIAN - Kỹ thuật viên: xem và cập nhật service histories, warranty claims
                // (Quyền đã được định nghĩa ở trên cùng với SC_STAFF)

                // User Info endpoint - all authenticated users
                .requestMatchers("/api/me").authenticated()

                // Tất cả request khác cần authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Tắt form login để không bị redirect khi gọi API
            .httpBasic(basic -> basic.disable()) // Tắt HTTP Basic Auth để không bị trình duyệt hiện popup login
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Thêm JWT filter

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép tất cả origins (development mode)
        // Using allowedOriginPatterns instead of allowedOrigins to support wildcards
        configuration.setAllowedOriginPatterns(List.of("*"));

        // Cho phép các origins cụ thể
//        configuration.setAllowedOrigins(List.of(
//                "https://8086127e5439.ngrok-free.app",
//                "http://localhost:3000",
//                "http://localhost:5173",
//                "http://localhost:8081"
//        ));

        // Cho phép tất cả HTTP methods bao gồm PATCH và OPTIONS
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));

        // Cho phép tất cả headers
        configuration.setAllowedHeaders(List.of("*"));

        // Expose headers cho frontend có thể đọc
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control", "Access-Control-Allow-Origin"));

        // Cho phép credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Cache preflight requests for 1 hour để giảm số lượng OPTIONS requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
