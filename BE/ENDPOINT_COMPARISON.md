# So sánh Endpoint và CORS Configuration

## Tổng quan

So sánh giữa **phiên bản CŨ** (trước PR #15, commit c729f6a) và **phiên bản MỚI** (sau PR #15, commit hiện tại).

---

## 🔴 CORS Configuration - THAY ĐỔI QUAN TRỌNG

### ❌ Phiên bản CŨ (commit c729f6a - Merge from main)

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // ⚠️ CHO PHÉP TẤT CẢ ORIGINS - KHÔNG AN TOÀN CHO PRODUCTION
    configuration.setAllowedOriginPatterns(List.of("*"));

    // Các origins cụ thể đã bị comment out
    // configuration.setAllowedOrigins(List.of(
    //     "https://8086127e5439.ngrok-free.app",
    //     "http://localhost:3000",
    //     "http://localhost:5173",
    //     "http://localhost:8081"
    // ));

    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control", "Access-Control-Allow-Origin"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Đặc điểm:**
- ✅ **Thuận tiện** - mọi frontend origin đều có thể kết nối
- ❌ **KHÔNG AN TOÀN** - wildcard "*" với allowCredentials(true) vi phạm CORS spec
- ❌ **Dễ bị tấn công** - mọi website đều có thể gọi API với credentials

---

### ✅ Phiên bản MỚI (commit hiện tại - Sau PR #15)

```java
@Value("${cors.allowed-origins:}")
private String corsAllowedOrigins;

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // IMPORTANT: Không thể dùng wildcard "*" khi setAllowCredentials(true)
    // Phải chỉ định các origins cụ thể để tuân thủ CORS specification

    // ✅ Default localhost origins cho development
    List<String> allowedOrigins = new ArrayList<>(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081"
    ));

    // ✅ Thêm các origins từ environment variable (cho production/public URLs)
    // Cách dùng: Set environment variable CORS_ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
    // Hoặc trong application.properties: cors.allowed-origins=https://domain1.com,https://domain2.com
    if (corsAllowedOrigins != null && !corsAllowedOrigins.trim().isEmpty()) {
        String[] additionalOrigins = corsAllowedOrigins.split(",");
        for (String origin : additionalOrigins) {
            String trimmedOrigin = origin.trim();
            if (!trimmedOrigin.isEmpty() && !allowedOrigins.contains(trimmedOrigin)) {
                allowedOrigins.add(trimmedOrigin);
            }
        }
    }

    configuration.setAllowedOrigins(allowedOrigins);

    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control", "Access-Control-Allow-Origin"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Đặc điểm:**
- ✅ **AN TOÀN HƠN** - chỉ cho phép origins cụ thể
- ✅ **TUÂN THỦ CORS SPEC** - không dùng wildcard với credentials
- ✅ **LINH HOẠT** - có thể thêm origins qua environment variable
- ✅ **PHÒNG NGỪA TẤN CÔNG** - chỉ trusted origins mới gọi được API
- ⚠️ **CẦN CẤU HÌNH** - phải thêm origins cho production/ngrok/cloudflare

---

## 📋 API Endpoints - KHÔNG THAY ĐỔI

Cả 2 phiên bản đều có **CÙNG CẤU HÌNH ENDPOINTS**:

### Public Endpoints (Không cần authentication)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/register` | POST | Đăng ký |
| `/api/auth/refresh` | POST | Refresh token |
| `/api/auth/forgot-password` | POST | Quên mật khẩu |
| `/api/auth/reset-password` | POST | Đặt lại mật khẩu |
| `/api/public/**` | ALL | Endpoints công khai |
| `/api/service-centers/**` | ALL | Thông tin trung tâm bảo hành |
| `/swagger-ui/**` | ALL | Swagger UI |
| `/v3/api-docs/**` | ALL | API Documentation |
| `/actuator/**`, `/health` | ALL | Health check |

### Authenticated Endpoints

#### User Info
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/me` | ALL (authenticated) | Thông tin user hiện tại |
| `/api/profile` | ALL (authenticated) | Profile đầy đủ |

#### Admin Only
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/admin/**` | ADMIN | Tất cả admin endpoints |
| `/api/admin/users/**` | ADMIN | Quản lý users |
| `/api/auth/admin/**` | ADMIN | Auth admin endpoints |

#### Vehicles
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/vehicles/**` | ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER | Quản lý phương tiện |

#### Parts
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/parts/**` | ADMIN, EVM_STAFF, SC_STAFF | Quản lý linh kiện |
| `/api/installed-parts/**` | ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER | Linh kiện đã lắp |

#### Customers
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/customers/profile` | CUSTOMER | Update thông tin cá nhân |
| `/api/customers/**` | ADMIN, SC_STAFF, EVM_STAFF | Quản lý khách hàng |

#### Warranty Claims
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/warranty-claims/my-claims/**` | CUSTOMER | Claims của customer |
| `/api/warranty-claims/**` | ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF | Quản lý claims |

#### Service Histories
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/service-histories/**` | ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER | Lịch sử bảo hành |

#### Feedbacks
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/feedbacks/**` | ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER | Feedback |

#### Work Logs
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/work-logs/**` | ADMIN, EVM_STAFF, SC_STAFF | Nhật ký công việc |

#### Part Requests
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/part-requests/**` | ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN | Yêu cầu linh kiện |

#### Recall Requests
| Endpoint | Roles | Mô tả |
|----------|-------|-------|
| `/api/recall-requests/my-recalls` | CUSTOMER | Recalls của customer |
| `/api/recall-requests/admin` | ADMIN, EVM_STAFF, SC_STAFF | Admin recalls |
| `/api/recall-requests/**` | ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER | Quản lý recalls |

---

## 🎯 Tóm tắt thay đổi

### Điểm khác biệt duy nhất:

| Aspect | Phiên bản CŨ (main) | Phiên bản MỚI (current) |
|--------|---------------------|-------------------------|
| **CORS Origins** | `setAllowedOriginPatterns("*")` | `setAllowedOrigins(specificList)` |
| **Security** | ❌ Không an toàn | ✅ An toàn hơn |
| **Flexibility** | ✅ Mọi origin đều OK | ⚠️ Cần config cho production |
| **Environment Variable** | ❌ Không hỗ trợ | ✅ Hỗ trợ `CORS_ALLOWED_ORIGINS` |
| **Endpoints** | ✅ Giống nhau 100% | ✅ Giống nhau 100% |

---

## 🔧 Hướng dẫn Migration

### Nếu đang dùng phiên bản CŨ và muốn update:

1. **Pull code mới nhất:**
   ```bash
   git pull origin main
   ```

2. **Kiểm tra frontend đang chạy ở đâu:**
   - Development: Thường localhost:3000 hoặc 5173 (đã được include mặc định)
   - Production: Cần set environment variable

3. **Nếu dùng production URL (ngrok, cloudflare, domain):**
   ```bash
   # Set environment variable
   export CORS_ALLOWED_ORIGINS="https://your-domain.com,https://ngrok-url.app"

   # Hoặc thêm vào application.properties
   cors.allowed-origins=https://your-domain.com
   ```

4. **Restart backend server**

### Nếu gặp lỗi 403 sau khi update:

**Nguyên nhân:** Frontend origin không có trong whitelist

**Giải pháp nhanh:**
1. Check frontend đang chạy ở port nào
2. Nếu không phải localhost:3000/5173/8080/8081:
   ```bash
   # Thêm vào whitelist qua environment variable
   export CORS_ALLOWED_ORIGINS="http://localhost:YOUR_PORT"
   ```
3. Restart backend

**Xem thêm:** File `BE/DEBUG_403_ERROR.md` và `BE/CORS_CONFIGURATION.md`

---

## 📚 Tài liệu liên quan

- [DEBUG_403_ERROR.md](./DEBUG_403_ERROR.md) - Hướng dẫn debug lỗi 403
- [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) - Hướng dẫn cấu hình CORS
- Pull Request #15 - CORS configuration fix

---

## ✅ Khuyến nghị

**Nên dùng phiên bản MỚI** vì:
- ✅ An toàn hơn về mặt bảo mật
- ✅ Tuân thủ CORS specification
- ✅ Linh hoạt với environment variables
- ✅ Ready for production deployment

**Chỉ quay lại phiên bản CŨ nếu:**
- ❌ Đang development và muốn test nhanh với nhiều origins khác nhau
- ⚠️ **LƯU Ý:** Không bao giờ deploy phiên bản CŨ lên production!
