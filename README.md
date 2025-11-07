# 🚗 OEM EV Warranty Management System

A comprehensive electric vehicle warranty management system for manufacturers, service centers, and customers.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📋 Table of Contents

- [Introduction](#-introduction)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [System Requirements](#-system-requirements)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Security](#-security)
- [Documentation](#-documentation)

## 🎯 Introduction

**OEM EV Warranty Management System** is a comprehensive electric vehicle warranty management platform designed to optimize warranty processes from customers, service centers to manufacturers. The system supports warranty claim management, service history tracking, parts management, and recall campaign processing.

### Key Highlights

- ✅ **Multi-role Support**: 5+ user roles with hierarchical access control
- ✅ **Automated Workflow**: Automated warranty claim processing workflow
- ✅ **Real-time Tracking**: Instant warranty claim status updates
- ✅ **Recall Management**: Integrated vehicle recall system with customer notifications
- ✅ **Analytics & Reporting**: Analytics dashboard with charts and metrics
- ✅ **High Security**: JWT authentication with refresh token mechanism

## 🚀 Key Features

### 🔧 Warranty Management
- Create and track warranty claims
- Automated approval/rejection workflow
- Real-time status updates
- Document and image storage

### 🚙 Vehicle Management
- Vehicle registration via VIN
- Warranty and maintenance history tracking
- Detailed vehicle information management

### 🔩 Parts Management
- Comprehensive parts catalog
- Parts request and tracking
- Parts installation history

### 🏢 Service Center Management
- Service center information management
- Map integration for finding nearest centers
- Customer ratings and feedback

### 📢 Recall Management
- Create recall campaigns
- Automated customer notifications
- Response tracking and recall processing

### 📊 Analytics & Reporting
- Role-based overview dashboards
- Detailed charts and statistics
- Service center performance reports

### 💬 Feedback Management
- Collect customer ratings
- Satisfaction analysis
- Service quality improvement

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|-----------|----------|
| **Java** | 21 | Primary programming language |
| **Spring Boot** | 3.5.6 | REST API framework |
| **Spring Security** | Latest | Security and authentication |
| **Hibernate/JPA** | Latest | Database ORM |
| **MySQL** | 8.0 | Relational database |
| **JWT (jjwt)** | 0.13.0 | Token authentication |
| **Springdoc OpenAPI** | 2.8.13 | API documentation (Swagger) |
| **Maven** | 3.9.11 | Dependency management |
| **JUnit 5** | Latest | Unit testing |
| **JaCoCo** | Latest | Test coverage |

### Frontend
| Technology | Version | Purpose |
|-----------|-----------|----------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.2 | Build tool with HMR |
| **React Router** | 7.9.1 | Client-side routing |
| **Styled Components** | 6.1.19 | CSS-in-JS styling |
| **Recharts** | 3.3.0 | Charts and visualization |
| **React Icons** | 5.5.0 | Icon library |
| **jwt-decode** | 4.0.0 | JWT token handling |
| **Node.js** | 22+ | Runtime environment |

### DevOps
- **Docker** & **Docker Compose**: Container orchestration
- **Nginx**: Web server for frontend
- **Git**: Version control

## 🏗️ System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER (Frontend)       │
│  React Components, Pages, Routing       │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON (REST API)
┌────────────────▼────────────────────────┐
│    API LAYER (Controllers)              │
│  15+ Controllers, DTOs, Validation      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     SECURITY LAYER                      │
│  JWT Filter, Security Config, RBAC      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   BUSINESS LOGIC LAYER                  │
│  Services, Mappers, Validators          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   DATA ACCESS LAYER                     │
│  Repositories, JPA Queries              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   PERSISTENCE LAYER                     │
│  JPA Entities, MySQL Database           │
└─────────────────────────────────────────┘
```

### Docker Deployment Model

```
┌────────────────────────────────────────────────┐
│              Docker Network (app-network)      │
│                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────┐  │
│  │  Frontend    │  │   Backend    │  │ MySQL│  │
│  │  (React +    │◄─┤ (Spring Boot)│◄─┤  8.0 │  │
│  │   Nginx)     │  │   Java 21    │  │      │  │
│  │  Port: 3000  │  │  Port: 8080  │  │ 3308 │  │
│  └──────────────┘  └──────────────┘  └──────┘  │
└────────────────────────────────────────────────┘
```

## 💻 System Requirements

### Minimum Requirements

- **JDK**: 21 or higher
- **Maven**: 3.9.11 or higher
- **Node.js**: 22 or higher
- **MySQL**: 8.0 or higher
- **Docker**: Latest (for container deployment)
- **Docker Compose**: Latest

### Recommended Configuration

- **RAM**: 4GB or more
- **CPU**: 2 cores or more
- **Disk**: 10GB free space

## 📦 Installation & Setup

### Option 1: Using Docker Compose (Recommended)

#### 1. Clone repository

```bash
git clone https://github.com/your-username/OEM-EV-Warranty-Management-System.git
cd OEM-EV-Warranty-Management-System
```

#### 2. Create `.env` file

Create `.env` file in root directory with the following content:

```env
# MySQL Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=warranty_db
DB_USER=warranty_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_at_least_32_characters_long_for_security
```

#### 3. Launch Docker Compose

```bash
docker-compose up --build
```

#### 4. Access the system

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

### Option 2: Local Development

#### Backend

```bash
# Navigate to backend directory
cd BE/oem-ev-warranty-management-system

# Create .env file or configure application.properties
# with database information and JWT secret

# Build project
mvn clean install

# Run Spring Boot
mvn spring-boot:run
```

Backend will run at: http://localhost:8080

#### Frontend

```bash
# Open new terminal, navigate to frontend directory
cd FE/OEM-EV-Warranty-Management-System

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at: http://localhost:5173 (or port specified by Vite)

#### MySQL Database

Ensure MySQL is running and create database:

```sql
CREATE DATABASE warranty_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warranty_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON warranty_db.* TO 'warranty_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📁 Project Structure

```
OEM-EV-Warranty-Management-System/
│
├── BE/                                          # Backend (Spring Boot)
│   ├── Dockerfile
│   └── oem-ev-warranty-management-system/
│       ├── pom.xml                              # Maven dependencies
│       ├── src/main/java/com/swp391/warrantymanagement/
│       │   ├── controller/                      # 15+ REST Controllers
│       │   │   ├── AuthController.java
│       │   │   ├── CustomerController.java
│       │   │   ├── VehicleController.java
│       │   │   ├── WarrantyClaimController.java
│       │   │   ├── PartController.java
│       │   │   ├── RecallRequestController.java
│       │   │   └── ...
│       │   ├── service/                         # Business logic
│       │   ├── entity/                          # JPA Entities (16 tables)
│       │   ├── dto/                             # Data Transfer Objects
│       │   ├── repository/                      # Data access layer
│       │   ├── config/                          # Security, JWT, CORS config
│       │   ├── exception/                       # Exception handling
│       │   └── mapper/                          # Entity-DTO mappers
│       ├── src/main/resources/
│       │   └── application.properties           # Spring configuration
│       └── docs/                                # Documentation
│           ├── API_DOCUMENTATION.md
│           ├── SYSTEM_ARCHITECTURE_EXPLANATION.md
│           ├── DATA_FLOW_SCENARIOS.md
│           ├── SECURITY_GUIDE.md
│           └── CORS_CONFIGURATION.md
│
├── FE/                                          # Frontend (React)
│   ├── Dockerfile
│   └── OEM-EV-Warranty-Management-System/
│       ├── package.json                         # NPM dependencies
│       ├── vite.config.js                       # Vite configuration
│       └── src/
│           ├── pages/                           # Page components
│           │   ├── Admin/                       # Admin pages (11 pages)
│           │   ├── Customer/                    # Customer pages (7 pages)
│           │   ├── EVM/                         # EVM Staff pages (8 pages)
│           │   ├── SCStaff/                     # SC Staff pages (5 pages)
│           │   └── SCTechnician/                # Technician pages (8 pages)
│           ├── components/                      # Reusable components
│           ├── api/                             # API client functions
│           ├── context/                         # React Context (State mgmt)
│           ├── hooks/                           # Custom React hooks
│           ├── utils/                           # Utility functions
│           ├── App.jsx                          # Main routing
│           └── main.jsx                         # Entry point
│
├── Requirements/                                # Requirements documentation
│   ├── use-case-analysis-table.md              # 26 use cases
│   ├── Physical ERD.png                         # Database schema
│   ├── Context Diagram.drawio.png               # System context
│   ├── Use Case Diagram.jpg                     # Use case diagram
│   └── Feature List.docx                        # Feature specifications
│
├── docker-compose.yml                           # Docker orchestration
├── README.md                                    # This file
└── .gitignore
```

## 📚 API Documentation

### Swagger UI

Access interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

### API Endpoints

The system provides 15+ controllers with 100+ endpoints:

| Controller | Main Functions |
|-----------|-----------------|
| **AuthController** | Login, logout, refresh token, registration, password reset |
| **CustomerController** | Customer profile management, vehicles, warranty history |
| **VehicleController** | Vehicle registration, VIN lookup, vehicle information management |
| **WarrantyClaimController** | Create/manage warranty claims, status updates |
| **PartController** | Parts catalog management |
| **PartRequestController** | Parts request and tracking |
| **ServiceCenterController** | Service center management, ratings |
| **RecallRequestController** | Create/manage recall campaigns |
| **WorkLogController** | Technician work tracking |
| **FeedbackController** | Feedback and ratings management |
| **AdminController** | User and system management |

### Authentication

All APIs (except public endpoints) require JWT token:

```bash
Authorization: Bearer <your_jwt_token>
```

### API Call Example

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password"}'

# Get warranty claims (requires token)
curl -X GET http://localhost:8080/api/warranty-claims \
  -H "Authorization: Bearer <token>"
```

## 👥 User Roles

### 1. CUSTOMER
**Access Permissions:**
- View own vehicle and warranty information
- View service history
- Submit feedback and ratings
- Respond to recall notifications
- Find service centers

**Dashboard:** 7 functional pages

### 2. SC_STAFF (Service Center Staff)
**Access Permissions:**
- Register new vehicles
- Create warranty claims
- Manage customer information
- View customer feedback
- Manage service history

**Dashboard:** 5 functional pages

### 3. SC_TECHNICIAN (Technician)
**Access Permissions:**
- View assigned work
- Create work logs
- Request parts
- Lookup vehicles and parts
- Manage service history

**Dashboard:** 8 functional pages

### 4. EVM_STAFF (Manufacturer Staff)
**Access Permissions:**
- Manage parts catalog
- Approve parts requests
- Create recall campaigns
- View work logs and feedback
- Analyze warranty data

**Dashboard:** 8 functional pages

### 5. ADMIN (Administrator)
**Access Permissions:**
- Full system management
- User and permission management
- Manage all data
- System configuration
- Reports and analytics

**Dashboard:** 11 functional pages

## 🔒 Security

### JWT Authentication

- **Access Token**: Lifetime 15-60 minutes
- **Refresh Token**: Lifetime 7-30 days
- **Encryption**: Secret key minimum 32 characters

### RBAC (Role-Based Access Control)

- Role-based permissions
- Endpoints protected by annotations
- Access control at Security Layer

### Security Best Practices

- Password hashing with BCrypt
- CORS configuration for production
- Input validation
- SQL injection prevention (JPA Prepared Statements)
- XSS protection

### CORS Configuration

```java
// Allow frontend access from configured domains
allowedOrigins: http://localhost:3000, http://localhost:5173
```

## 📖 Documentation

### Backend Documentation (BE/docs/)

- **API_DOCUMENTATION.md**: Complete API documentation
- **SYSTEM_ARCHITECTURE_EXPLANATION.md**: System architecture explanation
- **DATA_FLOW_SCENARIOS.md**: Data flow scenarios
- **SECURITY_GUIDE.md**: Security guide
- **CORS_CONFIGURATION.md**: CORS configuration

### Requirements Documentation (Requirements/)

- **use-case-analysis-table.md**: 26 use cases analysis
- **Physical ERD.png**: Database ERD diagram
- **Context Diagram.drawio.png**: System context diagram
- **Use Case Diagram.jpg**: Use case diagram
- **Feature List.docx**: Detailed feature list

## 🔄 Main Business Workflows

### 1. Warranty Claim Process

```
Customer notifies SC → SC Staff creates claim →
System validates warranty → Admin approves →
Technician repairs → Customer provides feedback → Complete
```

### 2. Recall Process

```
EVM Staff creates recall campaign → Admin approves →
System notifies customers → Customer accepts/declines →
SC Staff creates warranty claim → Technician processes → Complete
```

### 3. Parts Request Process

```
Technician requests parts → EVM Staff approves →
Parts allocated → Installation → History updated
```

## 🧪 Testing

### Backend Testing

```bash
cd BE/oem-ev-warranty-management-system

# Run unit tests
mvn test

# Run with coverage
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Frontend Testing

```bash
cd FE/OEM-EV-Warranty-Management-System

# Run tests (if configured)
npm test
```

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd BE/oem-ev-warranty-management-system
mvn clean package -DskipTests
# Output: target/oem-ev-warranty-management-system-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd FE/OEM-EV-Warranty-Management-System
npm run build
# Output: dist/
```

### Docker Production

```bash
# Build and run all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🛠️ Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Confirm `.env` information is correct
- Check port 3308 (or 3306) is not occupied

### JWT Token Error

- Ensure `JWT_SECRET_KEY` in `.env` is long enough (≥32 characters)
- Verify token has not expired
- Refresh token if access token expired

### CORS Error

- Check CORS configuration in backend
- Ensure frontend URL is in `allowedOrigins` list

### Port Already in Use

```bash
# Linux/Mac
lsof -i :8080  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete warranty management system
- ✅ 5 user roles with dedicated dashboards
- ✅ JWT authentication with refresh token
- ✅ Integrated recall management
- ✅ Smart refresh system
- ✅ Service center mapping
- ✅ Docker containerization
- ✅ API documentation with Swagger

## 🤝 Contributing

We welcome all contributions! Please:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 👨‍💻 Team

Developed by SWP391 Team.

## 📧 Contact

For questions or feedback, please:
- Create an [Issue](https://github.com/your-username/OEM-EV-Warranty-Management-System/issues)
- Email: thanhkiennk@gmail.com

---

⭐ **Star this repo if you find it useful!**

Made with ❤️ by SWP391 Team

---

This project is developed for demo and educational purposes. Do not use in production without thorough review.

