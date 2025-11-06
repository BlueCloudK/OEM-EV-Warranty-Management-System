# CORS Configuration Guide

## Tổng quan

Hệ thống đã được cấu hình CORS để hỗ trợ cả môi trường **development** (localhost) và **production** (public URLs như ngrok, cloudflare tunnel, domain chính thức).

## Cách hoạt động

### Development (Mặc định)
Hệ thống tự động cho phép các origins sau:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:8080`
- `http://localhost:8081`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:8080`
- `http://127.0.0.1:8081`

**Không cần cấu hình gì thêm** cho môi trường development.

### Production / Public URLs

Để cho phép frontend truy cập từ link public (ngrok, cloudflare tunnel, domain chính thức), bạn có **2 cách**:

## Cách 1: Sử dụng Environment Variable (Khuyến nghị)

### Windows:
```bash
# PowerShell
$env:CORS_ALLOWED_ORIGINS="https://your-ngrok-url.ngrok-free.app,https://yourdomain.com"

# Command Prompt
set CORS_ALLOWED_ORIGINS=https://your-ngrok-url.ngrok-free.app,https://yourdomain.com
```

### Linux/Mac:
```bash
export CORS_ALLOWED_ORIGINS="https://your-ngrok-url.ngrok-free.app,https://yourdomain.com"
```

### Docker:
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CORS_ALLOWED_ORIGINS=https://your-ngrok-url.ngrok-free.app,https://yourdomain.com
```

## Cách 2: Sử dụng application.properties

Thêm vào file `src/main/resources/application.properties`:

```properties
# CORS Configuration
cors.allowed-origins=https://your-ngrok-url.ngrok-free.app,https://yourdomain.com,https://another-domain.com
```

## Ví dụ thực tế

### Với Ngrok:
```bash
# 1. Khởi động ngrok
ngrok http 3000

# 2. Lấy URL (ví dụ: https://abc123.ngrok-free.app)

# 3. Set environment variable
export CORS_ALLOWED_ORIGINS="https://abc123.ngrok-free.app"

# 4. Restart backend server
./mvnw spring-boot:run
```

### Với Cloudflare Tunnel:
```bash
# 1. Setup tunnel và lấy public URL (ví dụ: https://your-app.trycloudflare.com)

# 2. Set environment variable
export CORS_ALLOWED_ORIGINS="https://your-app.trycloudflare.com"

# 3. Restart backend server
```

### Với Production Domain:
```properties
# application.properties
cors.allowed-origins=https://www.yourdomain.com,https://yourdomain.com,https://admin.yourdomain.com
```

## Lưu ý quan trọng

1. **Bắt buộc dùng HTTPS** cho production (ngrok, domain chính thức)
2. **Không có dấu `/` ở cuối URL**
   - ✅ Đúng: `https://example.com`
   - ❌ Sai: `https://example.com/`

3. **Phân cách nhiều origins bằng dấu phẩy**
   ```
   https://domain1.com,https://domain2.com,https://domain3.com
   ```

4. **Restart server** sau khi thay đổi environment variable hoặc application.properties

5. **Kiểm tra CORS đang hoạt động:**
   ```bash
   # Xem logs khi server khởi động
   # Logs sẽ hiển thị danh sách allowed origins
   ```

## Troubleshooting

### Vẫn bị lỗi CORS?

1. **Kiểm tra URL chính xác:**
   - Frontend đang chạy ở URL nào? (xem trong browser address bar)
   - Backend đang chạy ở port nào?

2. **Kiểm tra protocol (http vs https):**
   - Ngrok luôn dùng HTTPS
   - Localhost thường dùng HTTP

3. **Restart server sau khi thay đổi:**
   ```bash
   # Stop server (Ctrl+C)
   # Start lại
   ./mvnw spring-boot:run
   ```

4. **Xóa cache browser:**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

5. **Kiểm tra environment variable đã được load:**
   - Thêm log trong code để verify
   - Hoặc check trong IDE console

## Bảo mật

- ⚠️ **KHÔNG BAO GIỜ** sử dụng wildcard `"*"` khi `allowCredentials = true`
- ✅ **LUÔN LUÔN** chỉ định rõ origins cụ thể
- ✅ Chỉ thêm origins mà bạn tin tưởng
- ✅ Sử dụng HTTPS cho production

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Browser Console (F12) - xem lỗi CORS chi tiết
2. Backend Logs - xem request có đến server không
3. Network Tab (F12) - xem OPTIONS preflight request
