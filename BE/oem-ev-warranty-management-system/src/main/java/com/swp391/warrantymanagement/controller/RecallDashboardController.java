package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import com.swp391.warrantymanagement.repository.RecallRequestRepository;
import com.swp391.warrantymanagement.repository.RecallResponseRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Controller for recall campaign dashboard statistics.
 * <p>
 * <strong>Purpose:</strong>
 * <ul>
 *   <li>Provide aggregated statistics for Admin dashboard</li>
 *   <li>GET /api/recalls/status - Total recall campaigns count and breakdown by status</li>
 *   <li>GET /api/recalls/progress - Progress data for each active recall campaign</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/recalls")
@RequiredArgsConstructor
public class RecallDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(RecallDashboardController.class);

    private final RecallRequestRepository recallRequestRepository;
    private final RecallResponseRepository recallResponseRepository;

    /**
     * Get recall campaign status summary.
     * <p>
     * Returns total count of recall campaigns and breakdown by status.
     * Used by Admin dashboard to show total recalls count.
     *
     * @return Map with totalElements and status breakdown
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<Map<String, Object>> getRecallCampaignStatus() {
        logger.info("Getting recall campaign status summary");

        long totalCampaigns = recallRequestRepository.count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalElements", totalCampaigns);
        response.put("total", totalCampaigns);

        // Add breakdown by status for additional insights
        Map<String, Long> statusBreakdown = new HashMap<>();
        statusBreakdown.put("PENDING_ADMIN_APPROVAL",
            recallRequestRepository.countByStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL));
        statusBreakdown.put("APPROVED_BY_ADMIN",
            recallRequestRepository.countByStatus(RecallRequestStatus.APPROVED_BY_ADMIN));
        statusBreakdown.put("WAITING_CUSTOMER_CONFIRM",
            recallRequestRepository.countByStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM));
        statusBreakdown.put("COMPLETED",
            recallRequestRepository.countByStatus(RecallRequestStatus.COMPLETED));
        statusBreakdown.put("REJECTED_BY_ADMIN",
            recallRequestRepository.countByStatus(RecallRequestStatus.REJECTED_BY_ADMIN));

        response.put("statusBreakdown", statusBreakdown);

        logger.info("Recall campaign status: {} total campaigns", totalCampaigns);
        return ResponseEntity.ok(response);
    }

    /**
     * Get progress data for all active recall campaigns.
     * <p>
     * Returns detailed progress for each campaign including:
     * - Campaign name (part name + reason)
     * - Total affected vehicles
     * - Number of customers who accepted
     * - Number of customers who declined
     * - Number pending response
     * - Number in progress (repair ongoing)
     * - Number completed
     *
     * @return List of campaign progress data
     */
    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getRecallCampaignProgress() {
        logger.info("Getting recall campaign progress data");

        // Get all active recall campaigns (not rejected)
        var campaigns = recallRequestRepository.findAll().stream()
            .filter(campaign -> campaign.getStatus() != RecallRequestStatus.REJECTED_BY_ADMIN)
            .toList();

        List<Map<String, Object>> progressData = new ArrayList<>();

        for (var campaign : campaigns) {
            Long campaignId = campaign.getRecallRequestId();

            // Get all responses for this campaign
            var responses = recallResponseRepository
                .findByRecallRequest_RecallRequestId(campaignId);

            long totalAffected = responses.size();
            long pending = responses.stream()
                .filter(r -> r.getStatus() == RecallResponseStatus.PENDING)
                .count();
            long accepted = responses.stream()
                .filter(r -> r.getStatus() == RecallResponseStatus.ACCEPTED)
                .count();
            long declined = responses.stream()
                .filter(r -> r.getStatus() == RecallResponseStatus.DECLINED)
                .count();
            long inProgress = responses.stream()
                .filter(r -> r.getStatus() == RecallResponseStatus.IN_PROGRESS)
                .count();
            long completed = responses.stream()
                .filter(r -> r.getStatus() == RecallResponseStatus.COMPLETED)
                .count();

            // Build campaign progress object
            Map<String, Object> campaignProgress = new HashMap<>();
            campaignProgress.put("campaignId", campaignId);
            campaignProgress.put("campaignName",
                campaign.getPart().getPartName() + " - " + campaign.getReason());
            campaignProgress.put("name",
                campaign.getPart().getPartName() + " - " + campaign.getReason());
            campaignProgress.put("status", campaign.getStatus().name());
            campaignProgress.put("total", totalAffected);
            campaignProgress.put("totalAffected", totalAffected);
            campaignProgress.put("pending", pending);
            campaignProgress.put("pendingCount", pending);
            campaignProgress.put("notified", totalAffected); // All affected are notified
            campaignProgress.put("notifiedCount", totalAffected);
            campaignProgress.put("accepted", accepted);
            campaignProgress.put("declined", declined);
            campaignProgress.put("inProgress", inProgress);
            campaignProgress.put("completed", completed);
            campaignProgress.put("confirmedCount", accepted + declined); // Total who responded

            progressData.add(campaignProgress);
        }

        logger.info("Retrieved progress data for {} recall campaigns", progressData.size());
        return ResponseEntity.ok(progressData);
    }
}
