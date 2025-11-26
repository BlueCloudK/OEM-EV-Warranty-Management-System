package com.swp391.warrantymanagement.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Utility class for consistent timezone handling across the application.
 * <p>
 * This ensures all LocalDateTime.now() calls use Vietnam timezone (UTC+7)
 * regardless of system/container timezone settings.
 */
public final class DateTimeUtil {

    /**
     * Vietnam timezone constant
     */
    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private DateTimeUtil() {
        // Prevent instantiation
    }

    /**
     * Get current LocalDateTime in Vietnam timezone.
     * Use this instead of LocalDateTime.now() throughout the application.
     *
     * @return current LocalDateTime in Asia/Ho_Chi_Minh timezone
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }
}
