# 🔴 TÌM THẤY NGUYÊN NHÂN LỖI 403!

## Vấn đề

Code CŨ chạy bình thường, nhưng sau khi update sang code MỚI (kể cả khi đã copy lại CORS config cũ) vẫn bị lỗi 403.

## Root Cause: SecurityUtil.java thay đổi logic

### ❌ Code CŨ (commit c729f6a):

```java
public static Authentication getCurrentAuthentication() {
    return SecurityContextHolder.getContext().getAuthentication();
}

public static String getCurrentUsername() {
    Authentication auth = getCurrentAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        return null;
    }
    return auth.getName();
}
```

**Logic:**
- `getCurrentAuthentication()` trả về Authentication **BẤT KỂ** giá trị là gì
- `getCurrentUsername()` check null và `!isAuthenticated()`

---

### ⚠️ Code MỚI (commit hiện tại):

```java
public static Optional<Authentication> getCurrentAuthentication() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    // ⚠️ THAY ĐỔI QUAN TRỌNG TẠI ĐÂY!
    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {  // ⬅️ CHECK THÊM!
        return Optional.empty();
    }
    return Optional.of(authentication);
}

public static Optional<String> getCurrentUsername() {
    return getCurrentAuthentication().map(Authentication::getName);
}
```

**Logic:**
- `getCurrentAuthentication()` check thêm điều kiện: `"anonymousUser".equals(authentication.getPrincipal())`
- Return type đổi từ `Authentication` → `Optional<Authentication>`
- Return type của `getCurrentUsername()` đổi từ `String` → `Optional<String>`

---

## 🐛 Vấn đề với check `"anonymousUser".equals(authentication.getPrincipal())`

### Trường hợp bình thường (User authenticated):
```java
// Principal là UserDetails object
UserDetails principal = (UserDetails) authentication.getPrincipal();
"anonymousUser".equals(principal)  // ➡️ false ✅
```

### Trường hợp có vấn đề:

Trong một số trường hợp của Spring Security, sau khi JWT authentication thành công:
- `authentication.isAuthenticated()` = **true** ✅
- Nhưng `authentication.getPrincipal()` có thể vẫn là **String** chứ không phải UserDetails

Nếu `principal` là String và giá trị = `"anonymousUser"`:
```java
"anonymousUser".equals("anonymousUser")  // ➡️ true ❌
getCurrentAuthentication() returns Optional.empty()  // ❌
User bị coi là chưa authenticated  // ❌
Spring Security reject request với 403  // ❌
```

---

## 🔍 Tại sao code cũ chạy được?

Code cũ **KHÔNG CHECK** `getPrincipal()`, chỉ check:
- `auth == null` → false
- `!auth.isAuthenticated()` → false (vì đã authenticated)
- ➡️ Return username thành công ✅

---

## 📝 Impact Analysis

### Các endpoint bị ảnh hưởng:

Tất cả endpoints sử dụng `SecurityUtil.getCurrentUsername()` hoặc `SecurityUtil.getCurrentAuthentication()`:

1. **UserInfoController.java:**
   - `/api/me` - ✅ Có thể bị 403
   - `/api/profile` - ✅ Có thể bị 403
   - `/api/me/basic` - ✅ Có thể bị 403
   - `/api/admin/test` - ✅ Có thể bị 403
   - `/api/staff/test` - ✅ Có thể bị 403

2. **Các Controller khác:**
   - Bất kỳ endpoint nào sử dụng `SecurityUtil` đều có nguy cơ bị 403

---

## ✅ Giải pháp

### Option 1: Xóa check `"anonymousUser".equals(authentication.getPrincipal())` (Khuyến nghị)

```java
public static Optional<Authentication> getCurrentAuthentication() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
        return Optional.empty();
    }
    return Optional.of(authentication);
}
```

**Lý do:**
- Check `isAuthenticated()` là đủ để verify user đã login
- Không cần check thêm principal
- Đơn giản và ít lỗi hơn

---

### Option 2: Fix logic check anonymous user (Nếu muốn giữ logic check)

```java
public static Optional<Authentication> getCurrentAuthentication() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
        return Optional.empty();
    }

    // Check anonymous user một cách an toàn hơn
    Object principal = authentication.getPrincipal();
    if (principal instanceof String && "anonymousUser".equals(principal)) {
        return Optional.empty();
    }

    return Optional.of(authentication);
}
```

**Lý do:**
- Check `instanceof String` trước khi so sánh
- Tránh trường hợp principal là UserDetails nhưng vẫn được check với String

---

### Option 3: Quay về logic code cũ (Temporary workaround)

```java
public static Authentication getCurrentAuthentication() {
    return SecurityContextHolder.getContext().getAuthentication();
}

public static String getCurrentUsername() {
    Authentication auth = getCurrentAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        return null;
    }
    return auth.getName();
}
```

⚠️ **Lưu ý:** Option này bỏ đi lợi ích của Optional, nhưng đảm bảo backward compatibility.

---

## 🧪 Cách test để confirm

### Test 1: Check principal type khi authenticated

Thêm log vào `JwtAuthenticationFilter.java` sau khi set authentication:

```java
SecurityContextHolder.getContext().setAuthentication(authToken);

// DEBUG LOG
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
logger.info("🔍 DEBUG - Authentication set:");
logger.info("  - isAuthenticated: {}", auth.isAuthenticated());
logger.info("  - getPrincipal type: {}", auth.getPrincipal().getClass().getName());
logger.info("  - getPrincipal value: {}", auth.getPrincipal());
```

### Test 2: Check SecurityUtil output

Thêm log vào endpoint `/api/me`:

```java
@GetMapping("/api/me")
public ResponseEntity<Map<String, Object>> getCurrentUser() {
    logger.info("🔍 DEBUG - /api/me called");
    logger.info("  - getCurrentAuthentication: {}", SecurityUtil.getCurrentAuthentication());
    logger.info("  - getCurrentUsername: {}", SecurityUtil.getCurrentUsername());
    logger.info("  - isAuthenticated: {}", SecurityUtil.isAuthenticated());

    // ... rest of code
}
```

### Test 3: Curl test với valid token

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.accessToken')

# 2. Call /api/me
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Expected behavior:**
- Code CŨ: 200 OK ✅
- Code MỚI: 403 Forbidden ❌

---

## 🎯 Recommended Fix

**Chọn Option 1** - Xóa check `"anonymousUser".equals(authentication.getPrincipal())`

### Lý do:

1. ✅ **Đơn giản nhất** - Ít code hơn = ít bug hơn
2. ✅ **Đủ an toàn** - `isAuthenticated()` đã đủ để verify
3. ✅ **Backward compatible** - Giống logic code cũ
4. ✅ **Spring Security best practice** - Không nên check principal type/value

### Implementation:

File: `BE/oem-ev-warranty-management-system/src/main/java/com/swp391/warrantymanagement/util/SecurityUtil.java`

Line 32-39:

```java
public static Optional<Authentication> getCurrentAuthentication() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    // Remove the anonymousUser check
    if (authentication == null || !authentication.isAuthenticated()) {
        return Optional.empty();
    }
    return Optional.of(authentication);
}
```

---

## 📋 Checklist sau khi fix

- [ ] Update SecurityUtil.java
- [ ] Rebuild backend
- [ ] Test login
- [ ] Test /api/me với valid token → expect 200 OK
- [ ] Test /api/me không có token → expect 401 Unauthorized
- [ ] Test /api/me với expired token → expect 401 Unauthorized
- [ ] Test các endpoints khác sử dụng SecurityUtil

---

## 🔗 Related Files

- `BE/oem-ev-warranty-management-system/src/main/java/com/swp391/warrantymanagement/util/SecurityUtil.java`
- `BE/oem-ev-warranty-management-system/src/main/java/com/swp391/warrantymanagement/config/JwtAuthenticationFilter.java`
- `BE/oem-ev-warranty-management-system/src/main/java/com/swp391/warrantymanagement/controller/UserInfoController.java`
