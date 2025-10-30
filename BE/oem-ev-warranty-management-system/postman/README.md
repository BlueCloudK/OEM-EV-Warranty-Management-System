# Postman Collection - OEM EV Warranty Management System

## 📦 Files trong folder này

1. **OEM_EV_Warranty_System.postman_collection.json** - API Collection
2. **Local_Environment.postman_environment.json** - Environment variables
3. **README.md** - Hướng dẫn này

---

## 🚀 Cách sử dụng

### **Bước 1: Import vào Postman**

1. Mở Postman
2. Click **Import** (góc trái trên)
3. Chọn **Upload Files**
4. Import 2 files:
   - `OEM_EV_Warranty_System.postman_collection.json`
   - `Local_Environment.postman_environment.json`

### **Bước 2: Chọn Environment**

1. Góc phải trên Postman, chọn dropdown
2. Chọn **Local Development**
3. Click vào icon mắt (👁️) để xem variables

### **Bước 3: Test API**

#### **3.1. Login trước tiên**

```
POST http://localhost:8080/api/auth/login

Body:
{
  "username": "admin",
  "password": "admin123"
}
```

**Tự động:**
- Script sẽ tự lưu `accessToken` và `refreshToken` vào Environment
- Token sẽ tự động được dùng cho các request tiếp theo

#### **3.2. Test các endpoints khác**

Collection đã có sẵn các request mẫu:

**Authentication:**
- ✅ Login
- ✅ Refresh Token
- ✅ Logout
- ✅ Register Customer

**Warranty Claims:** (⭐ NEW FEATURES)
- ✅ Get All Claims (ADMIN/STAFF)
- ✅ Create Claim (SC_STAFF)
- ✅ Admin Accept/Reject
- ✅ Tech Start/Complete
- 🆕 **Get My Claims (CUSTOMER)** - NEW!
- 🆕 **Get My Claim Detail (CUSTOMER)** - NEW!

**User Info:**
- ✅ Get My Info

---

## 🔐 Test theo Roles

### **1. Test với ADMIN**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- ✅ Có thể truy cập TẤT CẢ endpoints
- ✅ Accept/Reject claims
- ✅ Delete resources

### **2. Test với SC_STAFF**
```json
{
  "username": "sc_staff1",
  "password": "staff123"
}
```
- ✅ Tạo warranty claims cho customer
- ✅ Quản lý customers, vehicles
- ❌ Không thể delete (chỉ ADMIN)

### **3. Test với SC_TECHNICIAN**
```json
{
  "username": "technician1",
  "password": "tech123"
}
```
- ✅ Start/Complete claims
- ✅ Manage service histories
- ❌ Không thể create claims

### **4. Test với CUSTOMER** 🆕
```json
{
  "username": "customer1",
  "password": "customer123"
}
```
- 🆕 ✅ Xem warranty claims của mình (`/my-claims`)
- 🆕 ✅ Xem chi tiết từng claim (`/my-claims/{id}`)
- ❌ Không thể tạo/sửa/xóa claims
- ✅ Xem vehicles/histories của mình

---

## 📊 Workflow Test - Warranty Claim

### **Scenario: Customer đến service center với vấn đề battery**

#### **Bước 1: SC_STAFF tạo claim cho customer**
```
POST /api/warranty-claims/sc-create
Role: SC_STAFF

Body:
{
  "installedPartId": "INST-001",
  "issueDescription": "Battery not charging properly",
  "failureDate": "2024-10-22"
}

→ Status: SUBMITTED
```

#### **Bước 2: Customer login và xem claim** 🆕
```
1. Login as CUSTOMER
POST /api/auth/login
{
  "username": "customer1",
  "password": "customer123"
}

2. Xem tất cả claims của mình
GET /api/warranty-claims/my-claims?page=0&size=10

3. Xem chi tiết claim
GET /api/warranty-claims/my-claims/1
```

#### **Bước 3: ADMIN xem xét và chấp nhận**
```
PATCH /api/warranty-claims/1/admin-accept
Role: ADMIN

→ Status: MANAGER_REVIEW
```

#### **Bước 4: Customer check lại status** 🆕
```
GET /api/warranty-claims/my-claims/1
Role: CUSTOMER

Response:
{
  "status": "MANAGER_REVIEW",
  "description": "Battery not charging\n[Admin Accepted]"
}
```

#### **Bước 5: SC_TECHNICIAN bắt đầu xử lý**
```
PATCH /api/warranty-claims/1/tech-start
Role: SC_TECHNICIAN

→ Status: PROCESSING
```

#### **Bước 6: Customer theo dõi** 🆕
```
GET /api/warranty-claims/my-claims/1
→ Status: "PROCESSING"
```

#### **Bước 7: SC_TECHNICIAN hoàn thành**
```
PATCH /api/warranty-claims/1/tech-complete?completionNote=Battery replaced successfully
Role: SC_TECHNICIAN

→ Status: COMPLETED
```

#### **Bước 8: Customer xem kết quả** 🆕
```
GET /api/warranty-claims/my-claims/1
Role: CUSTOMER

Response:
{
  "status": "COMPLETED",
  "resolutionDate": "2024-10-22T15:30:00",
  "description": "...[Tech Complete]: Battery replaced successfully"
}
```

---

## 🆕 NEW Features (Oct 23, 2025)

### **Customer Warranty Claims Viewing**

**Vấn đề trước đây:**
- ❌ Customer không thể xem trạng thái claim
- ❌ Phải gọi điện hoặc đến trung tâm để hỏi

**Giải pháp:**
- ✅ 2 endpoints mới cho CUSTOMER
- ✅ Customer tự theo dõi tiến độ
- ✅ Minh bạch quy trình

**Test endpoints:**
```bash
# 1. Login as customer
POST /api/auth/login

# 2. Xem tất cả claims
GET /api/warranty-claims/my-claims?page=0&size=10

# 3. Xem chi tiết
GET /api/warranty-claims/my-claims/1
```

**Security:**
- ✅ Chỉ xem được claims của **xe mình sở hữu**
- ✅ Không thể xem claims của người khác
- ✅ Kiểm tra ownership ở DB query

---

## 🔧 Troubleshooting

### **401 Unauthorized**
- ✅ Check token có còn hạn không
- ✅ Gọi `/api/auth/refresh` để lấy token mới
- ✅ Hoặc login lại

### **403 Forbidden**
- ✅ Check role có quyền truy cập endpoint không
- ✅ Xem `ROLE_BASED_ACCESS_CONTROL.md`

### **404 Not Found**
- ✅ Check server có đang chạy không (port 8080)
- ✅ Check endpoint URL đúng format

### **Customer không xem được claim của mình**
- ✅ Check customer có xe nào không
- ✅ Check claim có thuộc về xe của customer không
- ✅ Dùng ADMIN để check data trong DB

---

## 📖 Documentation

- **API Docs:** `/Main Flow/COMPLETE_API_DOCUMENTATION.md`
- **Role Access:** `/API_GUIDE/ROLE_BASED_ACCESS_CONTROL.md`
- **JWT Flow:** `/API_GUIDE/JWT_AUTHENTICATION_FLOW.md`

---

## 💡 Tips

1. **Auto-save tokens:** Script tự động lưu tokens sau khi login
2. **Collection variables:** Dùng `{{baseUrl}}` thay vì hardcode URL
3. **Test scripts:** Mỗi request có thể thêm test scripts
4. **Environment:** Switch giữa Local/Dev/Prod environments

---

**Happy Testing! 🚀**
