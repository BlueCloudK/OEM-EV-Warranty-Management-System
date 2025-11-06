# DEBUG: Lỗi 403 trên endpoint /api/me

## Phân tích vấn đề

### 1. **CORS Configuration Changed**
Recent commit (f0f0c8b) đã thay đổi CORS từ wildcard "*" sang specific origins.

**Hiện tại chỉ cho phép:**
- http://localhost:3000, 5173, 8080, 8081
- http://127.0.0.1:3000, 5173, 8080, 8081
- Các origins từ `CORS_ALLOWED_ORIGINS` environment variable

### 2. **Nguyên nhân có thể gây 403:**

#### A. CORS Preflight Request Failed
- Frontend đang gọi từ origin không có trong whitelist
- OPTIONS request bị reject
- Browser block subsequent GET request

#### B. Missing/Invalid JWT Token
- Token không được gửi trong Authorization header
- Token đã hết hạn (expired)
- Token format sai (không có "Bearer " prefix)

#### C. Spring Security Filter Chain
- Token valid nhưng user không có quyền
- SecurityContext không được set đúng

## Cách kiểm tra và fix

### Bước 1: Kiểm tra Frontend đang chạy ở port nào?

```bash
# Check browser console hoặc network tab
# Xem request đến từ origin nào?
# Ví dụ: http://localhost:5174 (không có trong whitelist!)
```

### Bước 2: Kiểm tra CORS error trong Browser Console

**Nếu thấy lỗi kiểu:**
```
Access to fetch at 'http://localhost:8080/api/me' from origin 'http://localhost:XXXX'
has been blocked by CORS policy
```

➡️ **ĐÂY LÀ LỖI CORS!**

**Giải pháp:**
- Thêm origin của frontend vào SecurityConfig.java
- Hoặc set environment variable `CORS_ALLOWED_ORIGINS`

### Bước 3: Kiểm tra JWT Token

**Trong Browser Console, chạy:**
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

**Nếu token = null:**
➡️ User chưa login hoặc token đã bị clear

**Nếu có token, kiểm tra có được gửi không:**
- Mở Network Tab
- Gọi /api/me
- Xem Request Headers
- Tìm `Authorization: Bearer <token>`

**Nếu không có Authorization header:**
➡️ Frontend không gửi token (lỗi ở apiClient.js)

### Bước 4: Kiểm tra Backend Logs

**Nếu request đến backend:**
```
[JwtAuthenticationFilter] JWT Authentication failed: ...
```
➡️ Token invalid/expired

**Nếu không thấy log gì:**
➡️ Request bị CORS block, chưa đến backend

## Quick Fixes

### Fix 1: Thêm origin vào CORS whitelist

**Option A: Sửa SecurityConfig.java**
```java
List<String> allowedOrigins = new ArrayList<>(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",  // ⬅️ Thêm port này nếu frontend chạy ở 5174
    // ... các origins khác
));
```

**Option B: Set environment variable (Khuyến nghị)**
```bash
# Linux/Mac
export CORS_ALLOWED_ORIGINS="http://localhost:5174"

# Windows PowerShell
$env:CORS_ALLOWED_ORIGINS="http://localhost:5174"

# Sau đó restart backend
```

### Fix 2: Kiểm tra Token Expiration

JWT token hiện tại có thời gian sống **3 giờ** (JwtServiceImpl.java:41).

**Nếu token expired:**
- Frontend sẽ tự động refresh token (apiClient.js:93-137)
- Nếu refresh thất bại ➡️ redirect về /login

**Force refresh token:**
```javascript
// Trong Browser Console
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
window.location.href = '/login';
```

### Fix 3: Debug Mode - Tạm thời cho phép tất cả origins (CHỈ ĐỂ TEST)

**⚠️ KHÔNG DÙNG CHO PRODUCTION!**

Trong SecurityConfig.java, tạm thời comment out:
```java
// configuration.setAllowedOrigins(allowedOrigins);
configuration.setAllowedOriginPatterns(List.of("*"));  // Temporary for debugging
```

Nếu sau khi thay đổi này mà vẫn 403:
➡️ Không phải lỗi CORS, là lỗi Authentication/Authorization

## Test Script

### Test CORS với curl:

```bash
# Test OPTIONS preflight request
curl -X OPTIONS http://localhost:8080/api/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v

# Expected: 200 OK với Access-Control-Allow-Origin header

# Test GET request với token
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Origin: http://localhost:5173" \
  -v

# Expected: 200 OK với user info
```

### Test Authentication:

```bash
# 1. Login trước
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq

# 2. Copy accessToken từ response

# 3. Test /api/me với token
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_1>" \
  | jq
```

## Checklist Debug

- [ ] Check browser console for CORS errors
- [ ] Check Network Tab - Origin của request
- [ ] Check Network Tab - Authorization header có được gửi không?
- [ ] Check localStorage có token không?
- [ ] Check backend logs có nhận request không?
- [ ] Check backend logs có JWT authentication error không?
- [ ] Thử login lại để lấy token mới
- [ ] Thử test với curl để loại trừ frontend issues

## Liên hệ

Nếu vẫn gặp lỗi sau khi thử các bước trên, cung cấp:
1. Screenshot browser console (F12)
2. Screenshot Network tab (request/response headers)
3. Backend logs khi gọi /api/me
4. Frontend đang chạy ở port nào?
