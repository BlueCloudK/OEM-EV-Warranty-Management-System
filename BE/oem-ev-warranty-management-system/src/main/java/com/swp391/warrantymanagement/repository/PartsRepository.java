package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Parts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartsRepository extends JpaRepository<Parts, Integer> {
}

