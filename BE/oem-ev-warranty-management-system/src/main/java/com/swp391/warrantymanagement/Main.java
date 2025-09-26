package com.swp391.warrantymanagement;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;

@SpringBootApplication
public class Main {

	public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
	}

    public static void insertCustomer() {
        // thông số cấu hình server, nhà thầu JPA: Hibernate, JDBC cho JPA class để tạo kết nối tới CSDL server
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("com.swp391.warrantymanagement-PU");

        // tạo ra 1 Object để quản lý các entity class ~ map ngang sang table trong CSDL
        EntityManager em = emf.createEntityManager();

        // bắt buộc phải có 1 transaction để thực hiện các thao tác với CSDL
        em.getTransaction().begin();
        // thực hiện các thao tác với CSDL bằng persist, merge, remove, find
        //em.persist();
        // kết thúc transaction
        em.getTransaction().commit();
        // đóng kết nối // nhớ cái nào mở sau đóng trước
        em.close(); // đóng kết nối EntityManager
        emf.close(); // đóng nhà thầu hay ngắt kết nối với CSDL

    }

    public static void getAllCustomer() {
        // thông số cấu hình server, nhà thầu JPA: Hibernate, JDBC cho JPA class để tạo kết nối tới CSDL server
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("com.swp391.warrantymanagement-PU");

        // tạo ra 1 Object để quản lý các entity class ~ map ngang sang table trong CSDL
        EntityManager em = emf.createEntityManager();

        // bắt buộc phải có 1 transaction để thực hiện các thao tác với CSDL
        em.getTransaction().begin();
        // thực hiện các thao tác với CSDL bằng persist, merge, remove, find
        //em.persist();
        // kết thúc transaction
        em.getTransaction().commit();
        // đóng kết nối // nhớ cái nào mở sau đóng trước
        em.close(); // đóng kết nối EntityManager
        emf.close(); // đóng nhà thầu hay ngắt kết nối với CSDL

    }

}
