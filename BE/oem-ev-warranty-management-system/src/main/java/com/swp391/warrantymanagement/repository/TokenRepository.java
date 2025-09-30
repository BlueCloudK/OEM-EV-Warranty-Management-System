package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends JpaRepository<Token, String> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với String ID
    Token findByToken(String token);
    void deleteByToken(String token);
}
