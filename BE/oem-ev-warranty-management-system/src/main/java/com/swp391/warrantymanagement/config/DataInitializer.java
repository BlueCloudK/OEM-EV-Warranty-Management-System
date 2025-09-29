package com.swp391.warrantymanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// tự chạy 1 lần duy nhất khi Tomcat chạy, là IoC Container chạy, dùng de để khởi tạo dữ liệu trong Table
@Component // cần cho nó là Bean để Spring Boot tự động quét và khởi tạo
public class DataInitializer implements CommandLineRunner { // chỉ sử dụng khi cần khởi tạo dữ liệu (chưa có db) để test
    @Override
    public void run(String... args) throws Exception {

    }
}
