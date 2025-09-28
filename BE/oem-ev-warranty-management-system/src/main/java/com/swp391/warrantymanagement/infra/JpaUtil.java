package com.swp391.warrantymanagement.infra;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JpaUtil {
    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("warranty-management-system");
}
