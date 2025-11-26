package com.swp391.warrantymanagement.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.TimeZone;

/**
 * Configuration class to set the default timezone for the application.
 * <p>
 * This ensures consistent timezone handling across:
 * - JVM (Java application)
 * - Database connections
 * - JSON serialization/deserialization
 * - All LocalDateTime.now() calls
 * <p>
 * Important for Docker/Linux deployments where system timezone might be UTC.
 * <p>
 * Uses @Order(Integer.MIN_VALUE) to ensure this runs FIRST before any other @PostConstruct.
 */
@Configuration
@Order(Integer.MIN_VALUE)
public class TimezoneConfig {

    @PostConstruct
    public void init() {
        // Set default timezone to Vietnam (UTC+7)
        // This affects ALL LocalDateTime.now() calls throughout the application
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.out.println("✅ Application timezone set to: " + TimeZone.getDefault().getID());
        System.out.println("   Current time: " + java.time.LocalDateTime.now());
    }
}
