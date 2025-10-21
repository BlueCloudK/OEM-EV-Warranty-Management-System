package com.swp391.warrantymanagement.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Utility class for validating warranty claim status transitions
 * Implements business rules for valid status changes
 */
public class WarrantyClaimStatusValidator {

    // Define valid status transitions
    private static final Map<String, List<String>> VALID_TRANSITIONS = new HashMap<>();

    static {
        // SUBMITTED can go to MANAGER_REVIEW or REJECTED
        VALID_TRANSITIONS.put("SUBMITTED", List.of("MANAGER_REVIEW", "REJECTED"));

        // MANAGER_REVIEW can go to PROCESSING or REJECTED
        VALID_TRANSITIONS.put("SC_REVIEW", List.of("PROCESSING", "REJECTED"));

        // PROCESSING can go to COMPLETED or REJECTED
        VALID_TRANSITIONS.put("PROCESSING", List.of("COMPLETED", "REJECTED"));

        // COMPLETED and REJECTED are final states - no transitions allowed
        VALID_TRANSITIONS.put("COMPLETED", List.of());
        VALID_TRANSITIONS.put("REJECTED", List.of());
    }

    /**
     * Validates if a status transition is allowed
     * @param fromStatus Current status
     * @param toStatus Target status
     * @return true if transition is valid, false otherwise
     */
    public static boolean isValidTransition(String fromStatus, String toStatus) {
        if (fromStatus == null || toStatus == null) {
            return false;
        }

        // Same status is always valid (no change)
        if (fromStatus.equals(toStatus)) {
            return true;
        }

        List<String> allowedTransitions = VALID_TRANSITIONS.get(fromStatus);
        return allowedTransitions != null && allowedTransitions.contains(toStatus);
    }

    /**
     * Gets allowed next statuses for a given current status
     * @param currentStatus Current status
     * @return List of allowed next statuses
     */
    public static List<String> getAllowedNextStatuses(String currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
    }

    /**
     * Validates transition and throws exception if invalid
     * @param fromStatus Current status
     * @param toStatus Target status
     * @throws IllegalStateException if transition is not valid
     */
    public static void validateTransitionOrThrow(String fromStatus, String toStatus) {
        if (!isValidTransition(fromStatus, toStatus)) {
            throw new IllegalStateException(
                String.format("Invalid status transition from '%s' to '%s'. Allowed transitions: %s",
                    fromStatus, toStatus, getAllowedNextStatuses(fromStatus))
            );
        }
    }

    /**
     * Checks if a status is a final state (no further transitions allowed)
     * @param status Status to check
     * @return true if status is final, false otherwise
     */
    public static boolean isFinalStatus(String status) {
        List<String> allowedTransitions = VALID_TRANSITIONS.get(status);
        return allowedTransitions != null && allowedTransitions.isEmpty();
    }
}
