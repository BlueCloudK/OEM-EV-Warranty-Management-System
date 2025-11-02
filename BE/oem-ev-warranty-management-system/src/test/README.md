# Testing Documentation - EV Warranty Management System

## OEM EV Warranty Management System - Testing Documentation

This document describes the testing strategy and instructions for running tests for the backend of the project.

---

## Overview

This project uses a comprehensive test suite to ensure code quality and the correctness of business logic. The tests are built using modern methods, focusing on isolating and verifying each component of the application.

## Technologies Used

*   **Spring Boot Test**: The main platform for integration testing for Spring Boot applications
*   **JUnit 5 (Jupiter)**: The most popular testing framework for Java, supporting modern annotations
*   **Mockito**: A powerful library for creating mock objects to isolate classes from their dependencies
*   **MockMvc**: A framework for testing REST APIs without starting a real server
*   **AssertJ**: A library for writing fluent and readable assertion statements
*   **H2 Database**: An in-memory database for repository tests
*   **JaCoCo**: A Maven plugin to measure code coverage

## Test Structure

The tests are organized according to the 3 main architectural layers:

### 1. Repository Layer (`@DataJpaTest`)
Integration tests focused on verifying whether custom query methods in the repository interact correctly with the database.

**Characteristics:**
- Uses H2 in-memory database
- Automatically rolls back after each test
- Only loads JPA-related beans

**Example:**
```java
@DataJpaTest
class CustomerRepositoryTest {
    @Autowired
    private CustomerRepository customerRepository;
    // Test cases...
}
```

### 2. Service Layer (`@ExtendWith(MockitoExtension.class)`)
Unit tests focused on checking the business logic inside the service classes. Dependencies like repositories are mocked to completely isolate the service's logic.

**Characteristics:**
- Mocks all dependencies (repositories, external services)
- Tests pure business logic
- Runs fast, no database required

**Example:**
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
Integration tests focused on testing API endpoints, including request handling, validation, and access control verification (`@PreAuthorize`). Service classes are mocked so that the actual business logic is not executed.

**Characteristics:**
- Uses MockMvc to send HTTP requests
- Mocks service dependencies
- Tests JSON serialization/deserialization
- Verifies security constraints

**Example:**
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

## How to Run Tests

### Requirements
- **JDK**: 17 or higher
- **Maven**: 3.6.3 or higher

### Working Directory
**⚠️ Important**: You must execute the Maven commands from the root directory of the backend project:

```
D:\Project\OEM-EV-Warranty-Management-System\BE\oem-ev-warranty-management-system
```

### Run all tests

```bash
mvn test
```

This command will:
- Automatically download necessary dependencies
- Compile the test source code
- Run all tests (Repository, Service, Controller)
- Display the test results in the console

### Run tests for a specific class

```bash
mvn test -Dtest=CustomerServiceTest
```

### Run tests with detailed output

```bash
mvn test -X
```

### Skip tests during build

```bash
mvn clean install -DskipTests
```

---

## Test Coverage

### Goal
The project aims for a minimum test coverage of **80%** for all layers.

### Current Status
**Updated**: November, 2025

| Metric | Result | Status |
|--------|---------|------------|
| **Instructions Coverage** | 29% (4,274/14,264) | ⚠️ Goal Not Met |
| **Branches Coverage** | 22% (164/740) | ⚠️ Goal Not Met |
| **Lines Coverage** | 30% (903/3,055) | ⚠️ Goal Not Met |
| **Methods Coverage** | 30% (158/525) | ⚠️ Goal Not Met |
| **Classes Coverage** | 95% (56/59) | ✅ Goal Met |

### Details by Package

| Package | Coverage | Methods Tested | Priority |
|---------|----------|----------------|---------|
| **enums** | 94% | 6/9 | ✅ Good |
| **config** | 71% | 15/22 | ✅ Good |
| **mapper** | 69% | 24/43 | 🟡 Needs Improvement |
| **entity** | 67% | 4/6 | 🟡 Needs Improvement |
| **exception** | 28% | 3/9 | 🔴 High Priority |
| **util** | 29% | 5/13 | 🔴 High Priority |
| **service.impl** | 24% | 57/258 | 🔴 **Highest Priority** |
| **controller** | 14% | 43/161 | 🔴 **Highest Priority** |
| **entity.id** | 0% | 0/2 | 🔴 No tests |

### Improvement Recommendations

#### 1. Controller Layer (14% → 80%)
**Current State**: Only 43/161 methods are tested

**Action**:
- Add tests for missing endpoints
- Test validation cases
- Test error handling and exception cases
- Verify security constraints (@PreAuthorize)

#### 2. Service Layer (24% → 80%)
**Current State**: Only 57/258 methods are tested

**Action**:
- Write unit tests for all business logic
- Mock repository dependencies
- Test edge cases and error scenarios
- Verify transaction handling

#### 3. Entity ID (0% → 80%)
**Current State**: No tests yet

**Action**:
- Create tests for composite key classes
- Test equals() and hashCode()
- Verify serialization/deserialization

#### 4. Util & Exception (29% and 28%)
**Action**:
- Test utility methods with different inputs
- Test exception constructors and messages

### Generating JaCoCo Report

Run the following command to execute tests and generate the coverage report:

```bash
mvn clean verify
```

### Viewing the Report

After the `mvn verify` command runs successfully, the detailed report will be generated at:

```
target/site/jacoco/index.html
```

**How to open the report:**
1. Open Windows Explorer
2. Navigate to: `D:\Project\OEM-EV-Warranty-Management-System\BE\oem-ev-warranty-management-system\target\site\jacoco\`
3. Double-click the `index.html` file
4. The report will open in your default browser

**Or use the command line:**
```bash
start target\site\jacoco\index.html
```

### Understanding the JaCoCo Report

The JaCoCo report provides the following metrics:
- **Instructions Coverage**: Percentage of bytecode instructions executed
- **Branches Coverage**: Percentage of conditional branches (if/else) tested
- **Lines Coverage**: Percentage of code lines executed
- **Methods Coverage**: Percentage of methods called in tests
- **Classes Coverage**: Percentage of classes with at least one method tested

---

## Test Writing Conventions

### Naming Convention

```java
@DisplayName("Brief description of the test case")
@Test
void methodName_scenario_expectedBehavior() {
    // Given (Arrange)
    // When (Act)
    // Then (Assert)
}
```

### Example:
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

### Test fails due to database connection
Ensure the H2 dependency is in `pom.xml`:
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

### MockMvc not injected
Check if you have added the `@WebMvcTest` annotation:
```java
@WebMvcTest(YourController.class)
```

### Security test fails
Use `@WithMockUser` or configure security for the test:
```java
@Test
@WithMockUser(roles = "ADMIN")
void testAdminEndpoint() {
    // Test code
}
```

---

## Contact & Support

If you encounter problems while running tests, please:
1. Check the detailed logs in `target/surefire-reports/`
2. Ensure JDK version is compatible
3. Clean and rebuild the project: `mvn clean install`

---

**Last updated**: November, 2025
