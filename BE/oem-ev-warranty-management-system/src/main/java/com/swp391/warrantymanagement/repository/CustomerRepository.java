package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> { // JPA Repository interface cần 2 tham số: Entity và kiểu dữ liệu của khóa chính (ID)
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với UUID ID

    // Derived query methods - Spring tự động tạo queries
    List<Customer> findByNameContainingIgnoreCase(String name);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    // Custom query để tìm kiếm customer theo nhiều tiêu chí
    @Query("SELECT c FROM Customer c WHERE " +
           "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(c.email) = LOWER(:email))")
    List<Customer> findByNameAndEmail(@Param("name") String name, @Param("email") String email);
}
