package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;

import java.util.List;

public interface RecallRequestService {
    RecallRequestResponseDTO createRecallRequest(RecallRequestRequestDTO dto, String authorizationHeader);

    RecallRequestResponseDTO approveRecallRequest(Long recallRequestId, String adminNote, String authorizationHeader);

    RecallRequestResponseDTO rejectRecallRequest(Long recallRequestId, String adminNote, String authorizationHeader);

    RecallRequestResponseDTO customerConfirmRecall(Long recallRequestId, RecallCustomerResponseDTO dto, String authorizationHeader);

    List<RecallRequestResponseDTO> getRecallRequestsForAdmin();

    List<RecallRequestResponseDTO> getRecallRequestsForCustomer(Long customerId);

    List<RecallRequestResponseDTO> getMyRecallRequests(String authorizationHeader);

    void deleteRecallRequest(Long recallRequestId, String authorizationHeader);
}
