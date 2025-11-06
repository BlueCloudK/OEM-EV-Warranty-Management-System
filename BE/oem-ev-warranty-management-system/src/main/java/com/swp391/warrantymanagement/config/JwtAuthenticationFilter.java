package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bộ lọc xác thực JWT (JSON Web Token), chịu trách nhiệm xử lý JWT trong mỗi HTTP request.
 * <p>
 * <strong>Mục đích:</strong>
 * <ul>
 *     <li>Chặn mọi HTTP request trước khi chúng đến được Controller.</li>
 *     <li>Trích xuất và xác thực JWT token từ header {@code Authorization}.</li>
 *     <li>Nếu token hợp lệ, thiết lập thông tin xác thực cho request đó trong {@link SecurityContextHolder}.</li>
 * </ul>
 * <p>
 * <strong>Luồng hoạt động:</strong>
 * <ol>
 *     <li>Client gửi request với header: {@code Authorization: Bearer <JWT_TOKEN>}.</li>
 *     <li>Filter trích xuất token.</li>
 *     <li>{@link JwtService} xác thực token (chữ ký, thời gian hết hạn).</li>
 *     <li>Nếu hợp lệ, filter tải {@link UserDetails} từ database và thiết lập {@code SecurityContext}.</li>
 *     <li>Nếu không hợp lệ, filter sẽ bỏ qua và cho request đi tiếp. Các lớp bảo vệ sau (ví dụ: {@code @PreAuthorize}) sẽ từ chối request nếu cần xác thực.</li>
 * </ol>
 * <p>
 * Lớp này kế thừa từ {@link OncePerRequestFilter} để đảm bảo nó chỉ được thực thi một lần cho mỗi request.
 */
@Component // Spring component để auto-register vào application context
@RequiredArgsConstructor // Lombok tự động tạo constructor cho final fields (dependency injection)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    /**
     * Service để xử lý các hoạt động liên quan đến JWT (tạo, xác thực, trích xuất thông tin).
     */
    private final JwtService jwtService;

    /**
     * Service của Spring Security để tải thông tin chi tiết của người dùng (bao gồm cả quyền) từ database.
     */
    private final UserDetailsService userDetailsService;

    /**
     * Phương thức cốt lõi, được gọi cho mọi HTTP request đi vào hệ thống.
     * @param request  Đối tượng {@link HttpServletRequest} từ client.
     * @param response Đối tượng {@link HttpServletResponse} sẽ được trả về.
     * @param filterChain Chuỗi các filter tiếp theo trong pipeline của Spring Security.
     * @throws ServletException Nếu có lỗi servlet xảy ra.
     * @throws IOException Nếu có lỗi I/O xảy ra.
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Bước 1: Trích xuất header "Authorization".
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // DEBUG: Log request info
        logger.info("🔍 DEBUG JwtAuthenticationFilter for: {} {}", request.getMethod(), request.getRequestURI());
        logger.info("  - Authorization header: {}", authHeader != null ? "Bearer ***" : "NULL");

        // Bước 2: Bỏ qua nếu header không tồn tại hoặc không đúng định dạng "Bearer ".
        // Request sẽ đi tiếp và bị từ chối ở các tầng sau nếu endpoint yêu cầu xác thực.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("  ❌ No valid Authorization header, skipping JWT authentication");
            filterChain.doFilter(request, response);
            return;
        }

        // Bước 3: Trích xuất chuỗi JWT token (bỏ qua "Bearer ").
        jwt = authHeader.substring(7);
        logger.info("  - JWT token extracted (length: {})", jwt.length());

        try {
            // Bước 4: Trích xuất username từ token.
            username = jwtService.extractUsername(jwt);
            logger.info("  - Extracted username: {}", username);

            // Bước 5: Nếu có username và request này chưa được xác thực trước đó.
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Bước 6: Tải thông tin chi tiết người dùng (bao gồm cả quyền) từ database.
                // Việc này đảm bảo thông tin người dùng (ví dụ: quyền, trạng thái bị khóa) luôn được cập nhật.
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.info("  - Loaded UserDetails: username={}, authorities={}",
                    userDetails.getUsername(), userDetails.getAuthorities());

                // Bước 7: Xác thực token (chữ ký, thời gian hết hạn).
                boolean isValid = jwtService.isTokenValid(jwt);
                logger.info("  - Token valid: {}", isValid);

                if (isValid) {
                    // Bước 8: Tạo đối tượng Authentication để Spring Security sử dụng.
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials = null (không cần password sau khi authenticated)
                            userDetails.getAuthorities() // roles/permissions
                    );

                    // Bước 9: Bổ sung các chi tiết của request (ví dụ: IP address) vào đối tượng Authentication.
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Bước 10: Cập nhật SecurityContextHolder với thông tin xác thực mới.
                    // Từ thời điểm này, request được coi là đã được xác thực.
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("  ✅ Authentication set successfully for user: {}", username);
                } else {
                    logger.warn("  ❌ Token is invalid");
                }
            } else {
                if (username == null) {
                    logger.warn("  ❌ Username is null from token");
                }
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    logger.info("  ⚠️ Authentication already exists in SecurityContext");
                }
            }
        } catch (Exception e) {
            // Bắt và ghi log tất cả các lỗi liên quan đến việc xác thực JWT (ví dụ: token hết hạn, chữ ký sai).
            // Chúng ta không ném lại exception để filter chain có thể tiếp tục,
            // cho phép các endpoint công khai vẫn hoạt động.
            logger.error("  ❌ JWT Authentication failed: " + e.getMessage(), e);
        }

        // Bước 11: Chuyển request và response cho filter tiếp theo trong chuỗi.
        // Đây là bước bắt buộc để request có thể đi đến được Controller.
        filterChain.doFilter(request, response);
    }
}
