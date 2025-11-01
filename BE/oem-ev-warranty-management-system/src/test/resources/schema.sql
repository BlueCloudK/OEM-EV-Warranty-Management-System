-- Schema for H2 test database
-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS part_requests;
DROP TABLE IF EXISTS service_history_details;
DROP TABLE IF EXISTS service_history;
DROP TABLE IF EXISTS work_logs;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS warranty_claims;
DROP TABLE IF EXISTS recall_requests;
DROP TABLE IF EXISTS installed_parts;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS service_centers;
DROP TABLE IF EXISTS roles;

-- Create tables in correct order
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE service_centers (
    service_center_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    opening_hours NVARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL
);

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address NVARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    role_id BIGINT NOT NULL,
    service_center_id BIGINT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(service_center_id)
);

CREATE TABLE customers (
    customer_id VARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE vehicles (
    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_name NVARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_vin VARCHAR(50) NOT NULL UNIQUE,
    purchase_date DATE NOT NULL,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    mileage INT NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name NVARCHAR(100) NOT NULL,
    part_number VARCHAR(50) NOT NULL UNIQUE,
    manufacturer NVARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE installed_parts (
    installed_part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    installation_date DATE NOT NULL,
    warranty_expiration_date DATE NOT NULL,
    part_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

CREATE TABLE recall_requests (
    recall_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    installed_part_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason NVARCHAR(1000),
    admin_note NVARCHAR(1000),
    customer_note NVARCHAR(1000),
    created_by BIGINT NOT NULL,
    approved_by BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (installed_part_id) REFERENCES installed_parts(installed_part_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

CREATE TABLE warranty_claims (
    warranty_claim_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    resolution_date TIMESTAMP,
    description NVARCHAR(255),
    installed_part_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    service_center_id BIGINT,
    assigned_to_user_id BIGINT,
    recall_request_id BIGINT UNIQUE,
    FOREIGN KEY (installed_part_id) REFERENCES installed_parts(installed_part_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(service_center_id),
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id),
    FOREIGN KEY (recall_request_id) REFERENCES recall_requests(recall_request_id)
);

CREATE TABLE feedbacks (
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment NVARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    warranty_claim_id BIGINT NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (warranty_claim_id) REFERENCES warranty_claims(warranty_claim_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE work_logs (
    work_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    description NVARCHAR(1000),
    user_id BIGINT NOT NULL,
    warranty_claim_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (warranty_claim_id) REFERENCES warranty_claims(warranty_claim_id)
);

CREATE TABLE service_history (
    service_history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description NVARCHAR(1000),
    vehicle_id BIGINT NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

CREATE TABLE service_history_details (
    service_history_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (service_history_id, part_id),
    FOREIGN KEY (service_history_id) REFERENCES service_history(service_history_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

CREATE TABLE part_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_date TIMESTAMP NOT NULL,
    issue_description NVARCHAR(1000) NOT NULL,
    status VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    approved_date TIMESTAMP,
    shipped_date TIMESTAMP,
    delivered_date TIMESTAMP,
    rejection_reason NVARCHAR(500),
    tracking_number VARCHAR(100),
    notes NVARCHAR(1000),
    faulty_part_id BIGINT,
    requested_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT,
    service_center_id BIGINT NOT NULL,
    warranty_claim_id BIGINT NOT NULL,
    FOREIGN KEY (faulty_part_id) REFERENCES parts(part_id),
    FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(service_center_id),
    FOREIGN KEY (warranty_claim_id) REFERENCES warranty_claims(warranty_claim_id)
);

CREATE TABLE tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiration_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    token_type VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

