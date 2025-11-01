package com.swp391.warrantymanagement.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableAutoConfiguration
@EntityScan(basePackages = "com.swp391.warrantymanagement.entity")
@EnableJpaRepositories(basePackages = "com.swp391.warrantymanagement.repository")
public class TestConfig {
}

