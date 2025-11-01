package com.swp391.warrantymanagement.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for WarrantyClaimStatusValidator class
 */
@DisplayName("WarrantyClaimStatusValidator Tests")
class WarrantyClaimStatusValidatorTest {

    @Test
    @DisplayName("Should validate SUBMITTED to MANAGER_REVIEW transition as valid")
    void isValidTransition_SubmittedToManagerReview_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SUBMITTED", "MANAGER_REVIEW");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should validate SUBMITTED to REJECTED transition as valid")
    void isValidTransition_SubmittedToRejected_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SUBMITTED", "REJECTED");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should validate SC_REVIEW to PROCESSING transition as valid")
    void isValidTransition_ScReviewToProcessing_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SC_REVIEW", "PROCESSING");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should validate PROCESSING to COMPLETED transition as valid")
    void isValidTransition_ProcessingToCompleted_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("PROCESSING", "COMPLETED");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should validate same status transition as valid")
    void isValidTransition_SameStatus_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SUBMITTED", "SUBMITTED");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should validate invalid transition as false")
    void isValidTransition_Invalid_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SUBMITTED", "COMPLETED");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should validate null fromStatus as invalid")
    void isValidTransition_NullFromStatus_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition(null, "COMPLETED");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should validate null toStatus as invalid")
    void isValidTransition_NullToStatus_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition("SUBMITTED", null);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should validate both null statuses as invalid")
    void isValidTransition_BothNull_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isValidTransition(null, null);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return allowed next statuses for SUBMITTED")
    void getAllowedNextStatuses_Submitted_ReturnsCorrectList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("SUBMITTED");

        // Assert
        assertThat(allowedStatuses).hasSize(2);
        assertThat(allowedStatuses).contains("MANAGER_REVIEW", "REJECTED");
    }

    @Test
    @DisplayName("Should return allowed next statuses for SC_REVIEW")
    void getAllowedNextStatuses_ScReview_ReturnsCorrectList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("SC_REVIEW");

        // Assert
        assertThat(allowedStatuses).hasSize(2);
        assertThat(allowedStatuses).contains("PROCESSING", "REJECTED");
    }

    @Test
    @DisplayName("Should return allowed next statuses for PROCESSING")
    void getAllowedNextStatuses_Processing_ReturnsCorrectList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("PROCESSING");

        // Assert
        assertThat(allowedStatuses).hasSize(2);
        assertThat(allowedStatuses).contains("COMPLETED", "REJECTED");
    }

    @Test
    @DisplayName("Should return empty list for COMPLETED status")
    void getAllowedNextStatuses_Completed_ReturnsEmptyList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("COMPLETED");

        // Assert
        assertThat(allowedStatuses).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list for REJECTED status")
    void getAllowedNextStatuses_Rejected_ReturnsEmptyList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("REJECTED");

        // Assert
        assertThat(allowedStatuses).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list for unknown status")
    void getAllowedNextStatuses_Unknown_ReturnsEmptyList() {
        // Act
        List<String> allowedStatuses = WarrantyClaimStatusValidator.getAllowedNextStatuses("UNKNOWN_STATUS");

        // Assert
        assertThat(allowedStatuses).isEmpty();
    }

    @Test
    @DisplayName("Should not throw exception for valid transition")
    void validateTransitionOrThrow_ValidTransition_DoesNotThrow() {
        // Act & Assert
        WarrantyClaimStatusValidator.validateTransitionOrThrow("SUBMITTED", "MANAGER_REVIEW");
        // No exception thrown
    }

    @Test
    @DisplayName("Should throw exception for invalid transition")
    void validateTransitionOrThrow_InvalidTransition_ThrowsException() {
        // Act & Assert
        assertThatThrownBy(() ->
                WarrantyClaimStatusValidator.validateTransitionOrThrow("COMPLETED", "PROCESSING")
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid status transition from 'COMPLETED' to 'PROCESSING'");
    }

    @Test
    @DisplayName("Should throw exception with allowed transitions in message")
    void validateTransitionOrThrow_InvalidTransition_IncludesAllowedTransitions() {
        // Act & Assert
        assertThatThrownBy(() ->
                WarrantyClaimStatusValidator.validateTransitionOrThrow("SUBMITTED", "COMPLETED")
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Allowed transitions:");
    }

    @Test
    @DisplayName("Should identify COMPLETED as final status")
    void isFinalStatus_Completed_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isFinalStatus("COMPLETED");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should identify REJECTED as final status")
    void isFinalStatus_Rejected_ReturnsTrue() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isFinalStatus("REJECTED");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should identify SUBMITTED as not final status")
    void isFinalStatus_Submitted_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isFinalStatus("SUBMITTED");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should identify PROCESSING as not final status")
    void isFinalStatus_Processing_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isFinalStatus("PROCESSING");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return false for unknown status in isFinalStatus")
    void isFinalStatus_Unknown_ReturnsFalse() {
        // Act
        boolean result = WarrantyClaimStatusValidator.isFinalStatus("UNKNOWN_STATUS");

        // Assert
        assertThat(result).isFalse();
    }
}

