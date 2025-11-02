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
The project aims for a minimum test coverage of **80%** for all layers. The current coverage is below this target, and improving it is a high priority.

### Generating and Viewing the Report
To check the current test coverage, run the JaCoCo report generation command and open the resulting HTML file.

**1. Generate the report:**
Run the following command from the project root:
```bash
mvn clean verify
```

**2. View the report:**
After the command completes, open the report in your browser:
```
target/site/jacoco/index.html
```
This report will provide a detailed breakdown of coverage by package, class, and method, highlighting areas that need improvement.

### Improvement Recommendations
Based on previous reports, the following areas require the most attention:

#### 1. Controller Layer
**Action**:
- Add tests for missing endpoints.
- Test validation cases.
- Test error handling and exception cases.
- Verify security constraints (`@PreAuthorize`).

#### 2. Service Layer
**Action**:
- Write unit tests for all business logic.
- Mock repository dependencies.
- Test edge cases and error scenarios.
- Verify transaction handling.

#### 3. Other Packages
- **`entity.id`**: Create tests for composite key classes, including `equals()` and `hashCode()`.
- **`util` & `exception`**: Increase coverage for utility methods and exception classes.

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
