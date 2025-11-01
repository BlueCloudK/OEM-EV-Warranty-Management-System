# Tài liệu Kiểm thử - Hệ thống Quản lý Bảo hành Xe điện

## OEM EV Warranty Management System - Testing Documentation

Tài liệu này mô tả chiến lược kiểm thử và hướng dẫn chạy test cho phần backend của dự án.

---

## Tổng quan

Dự án này sử dụng một bộ kiểm thử toàn diện để đảm bảo chất lượng mã nguồn và tính đúng đắn của các logic nghiệp vụ. Các bài kiểm thử được xây dựng theo các phương pháp hiện đại, tập trung vào việc cô lập và xác minh từng thành phần của ứng dụng.

## Công nghệ sử dụng

*   **Spring Boot Test**: Nền tảng chính để kiểm thử tích hợp cho các ứng dụng Spring Boot
*   **JUnit 5 (Jupiter)**: Framework kiểm thử phổ biến nhất cho Java, hỗ trợ các annotation hiện đại
*   **Mockito**: Thư viện mạnh mẽ để tạo các đối tượng giả (mock) nhằm cô lập các lớp khỏi phụ thuộc
*   **MockMvc**: Framework để kiểm thử REST API mà không cần khởi động server thật
*   **AssertJ**: Thư viện để viết các câu lệnh xác minh (assertion) một cách trôi chảy, dễ đọc
*   **H2 Database**: Cơ sở dữ liệu trong bộ nhớ (in-memory) cho các bài kiểm thử repository
*   **JaCoCo**: Plugin Maven để đo lường độ bao phủ mã nguồn (code coverage)

## Cấu trúc Kiểm thử

Các bài kiểm thử được tổ chức theo 3 tầng kiến trúc chính:

### 1. Repository Layer (`@DataJpaTest`)
Các bài kiểm thử tích hợp tập trung vào việc xác minh các phương thức truy vấn tùy chỉnh trong repository có tương tác đúng với cơ sở dữ liệu hay không.

**Đặc điểm:**
- Sử dụng H2 in-memory database
- Tự động rollback sau mỗi test
- Chỉ load các bean liên quan đến JPA

**Ví dụ:**
```java
@DataJpaTest
class CustomerRepositoryTest {
    @Autowired
    private CustomerRepository customerRepository;
    // Test cases...
}
```

### 2. Service Layer (`@ExtendWith(MockitoExtension.class)`)
Các bài kiểm thử đơn vị (unit test) tập trung vào việc kiểm tra logic nghiệp vụ bên trong các lớp service. Các phụ thuộc như repository được giả lập (mock) để cô lập hoàn toàn logic của service.

**Đặc điểm:**
- Mock tất cả dependencies (repositories, external services)
- Kiểm tra logic nghiệp vụ thuần túy
- Chạy nhanh, không cần database

**Ví dụ:**
```java
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {
    @Mock
    private CustomerRepository customerRepository;
    
    @InjectMocks
    private CustomerService customerService;
    // Test cases...
}
```

### 3. Controller Layer (`@WebMvcTest`)
Các bài kiểm thử tích hợp tập trung vào việc kiểm tra các API endpoint, bao gồm việc xử lý request, validation, và xác thực quyền truy cập (`@PreAuthorize`). Các lớp service được giả lập (mock) để không thực thi logic nghiệp vụ thực sự.

**Đặc điểm:**
- Sử dụng MockMvc để gửi HTTP requests
- Mock các service dependencies
- Kiểm tra JSON serialization/deserialization
- Xác thực security constraints

**Ví dụ:**
```java
@WebMvcTest(CustomerController.class)
class CustomerControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private CustomerService customerService;
    // Test cases...
}
```

---

## Hướng dẫn Chạy Kiểm thử

### Yêu cầu
- **JDK**: 17 hoặc cao hơn
- **Maven**: 3.6.3 hoặc cao hơn

### Thư mục làm việc
**⚠️ Quan trọng**: Bạn phải thực thi các lệnh Maven từ thư mục gốc của dự án backend:

```
D:\Project\OEM-EV-Warranty-Management-System\BE\oem-ev-warranty-management-system
```

### Chạy tất cả test

```bash
mvn test
```

Lệnh này sẽ:
- Tự động tải các dependency cần thiết
- Biên dịch mã nguồn test
- Chạy toàn bộ các bài kiểm thử (Repository, Service, Controller)
- Hiển thị kết quả test trong console

### Chạy test của một class cụ thể

```bash
mvn test -Dtest=CustomerServiceTest
```

### Chạy test với output chi tiết

```bash
mvn test -X
```

### Bỏ qua test khi build

```bash
mvn clean install -DskipTests
```

---

## Độ bao phủ Kiểm thử (Test Coverage)

### Mục tiêu
Dự án đặt mục tiêu độ bao phủ kiểm thử (test coverage) **tối thiểu là 80%** cho tất cả các tầng.

### Tình trạng hiện tại
**Cập nhật**: Tháng 11, 2025

| Metric | Kết quả | Trạng thái |
|--------|---------|------------|
| **Instructions Coverage** | 29% (4,274/14,264) | ⚠️ Chưa đạt mục tiêu |
| **Branches Coverage** | 22% (164/740) | ⚠️ Chưa đạt mục tiêu |
| **Lines Coverage** | 30% (903/3,055) | ⚠️ Chưa đạt mục tiêu |
| **Methods Coverage** | 30% (158/525) | ⚠️ Chưa đạt mục tiêu |
| **Classes Coverage** | 95% (56/59) | ✅ Đạt mục tiêu |

### Chi tiết theo Package

| Package | Coverage | Methods Tested | Ưu tiên |
|---------|----------|----------------|---------|
| **enums** | 94% | 6/9 | ✅ Tốt |
| **config** | 71% | 15/22 | ✅ Tốt |
| **mapper** | 69% | 24/43 | 🟡 Cần cải thiện |
| **entity** | 67% | 4/6 | 🟡 Cần cải thiện |
| **exception** | 28% | 3/9 | 🔴 Ưu tiên cao |
| **util** | 29% | 5/13 | 🔴 Ưu tiên cao |
| **service.impl** | 24% | 57/258 | 🔴 **Ưu tiên cao nhất** |
| **controller** | 14% | 43/161 | 🔴 **Ưu tiên cao nhất** |
| **entity.id** | 0% | 0/2 | 🔴 Chưa có test |

### Khuyến nghị cải thiện

#### 1. Controller Layer (14% → 80%)
**Hiện trạng**: Chỉ 43/161 methods được test

**Hành động**:
- Thêm test cho các endpoint còn thiếu
- Kiểm tra các trường hợp validation
- Test error handling và exception cases
- Verify security constraints (@PreAuthorize)

#### 2. Service Layer (24% → 80%)
**Hiện trạng**: Chỉ 57/258 methods được test

**Hành động**:
- Viết unit test cho tất cả business logic
- Mock các repository dependencies
- Test các edge cases và error scenarios
- Verify transaction handling

#### 3. Entity ID (0% → 80%)
**Hiện trạng**: Chưa có test nào

**Hành động**:
- Tạo test cho composite key classes
- Kiểm tra equals() và hashCode()
- Verify serialization/deserialization

#### 4. Util & Exception (29% và 28%)
**Hành động**:
- Test utility methods với các input khác nhau
- Test exception constructors và messages

### Tạo báo cáo JaCoCo

Chạy lệnh sau để thực thi test và tạo báo cáo coverage:

```bash
mvn clean verify
```

### Xem báo cáo

Sau khi lệnh `mvn verify` chạy thành công, báo cáo chi tiết sẽ được tạo tại:

```
target/site/jacoco/index.html
```

**Cách mở báo cáo:**
1. Mở Windows Explorer
2. Điều hướng đến: `D:\Project\OEM-EV-Warranty-Management-System\BE\oem-ev-warranty-management-system\target\site\jacoco\`
3. Double-click vào file `index.html`
4. Báo cáo sẽ mở trong trình duyệt mặc định

**Hoặc sử dụng command line:**
```bash
start target\site\jacoco\index.html
```

### Hiểu báo cáo JaCoCo

Báo cáo JaCoCo cung cấp các metric sau:
- **Instructions Coverage**: Phần trăm bytecode instructions được thực thi
- **Branches Coverage**: Phần trăm các nhánh điều kiện (if/else) được test
- **Lines Coverage**: Phần trăm dòng code được thực thi
- **Methods Coverage**: Phần trăm methods được gọi trong test
- **Classes Coverage**: Phần trăm classes có ít nhất một method được test

---

## Quy ước Viết Test

### Naming Convention

```java
@DisplayName("Mô tả ngắn gọn về test case")
@Test
void methodName_scenario_expectedBehavior() {
    // Given (Arrange)
    // When (Act)
    // Then (Assert)
}
```

### Ví dụ:
```java
@Test
@DisplayName("Should return customer when valid ID is provided")
void getCustomerById_ValidId_ReturnsCustomer() {
    // Given
    UUID customerId = UUID.randomUUID();
    Customer customer = new Customer();
    when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
    
    // When
    Customer result = customerService.getCustomerById(customerId);
    
    // Then
    assertThat(result).isNotNull();
    verify(customerRepository).findById(customerId);
}
```

---

## Troubleshooting

### Test thất bại do database connection
Đảm bảo H2 dependency có trong `pom.xml`:
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

### MockMvc không inject được
Kiểm tra xem bạn đã thêm annotation `@WebMvcTest` chưa:
```java
@WebMvcTest(YourController.class)
```

### Security test thất bại
Sử dụng `@WithMockUser` hoặc configure security cho test:
```java
@Test
@WithMockUser(roles = "ADMIN")
void testAdminEndpoint() {
    // Test code
}
```

---

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề khi chạy test, vui lòng:
1. Kiểm tra log chi tiết trong `target/surefire-reports/`
2. Đảm bảo JDK version tương thích
3. Clean và rebuild project: `mvn clean install`

---

**Cập nhật lần cuối**: Tháng 11, 2025
