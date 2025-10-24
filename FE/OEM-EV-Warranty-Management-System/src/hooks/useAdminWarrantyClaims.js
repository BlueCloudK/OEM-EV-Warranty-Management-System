import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useAdminWarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('all'); // Changed default to 'all'

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
      };

      let response;
      if (filterStatus === 'all') {
        response = await dataApi.getAllWarrantyClaims(params);
      } else {
        response = await dataApi.getClaimsByStatus(filterStatus, params);
      }

      if (response && response.content) {
        setClaims(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
      setError("Không thể tải danh sách yêu cầu bảo hành.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (claimId) => {
    if (window.confirm('Bạn có chắc chắn muốn DUYỆT yêu cầu bảo hành này không?')) {
      try {
        await dataApi.adminAcceptClaim(claimId);
        fetchClaims();
      } catch (err) {
        alert(`Lỗi khi duyệt yêu cầu: ${err.message}`);
      }
    }
  };

  const handleReject = async (claimId, reason) => {
    try {
      // Get claim details first to create service history
      const claimDetails = await dataApi.getWarrantyClaimById(claimId);

      // Reject the claim
      await dataApi.adminRejectClaim(claimId, reason);

      // Create service history after rejecting claim
      if (claimDetails) {
        try {
          // Get partId from installedPart or use a default value
          let partId = 'N/A'; // Default value if no part

          if (claimDetails.installedPartId) {
            // If we have installedPartId, fetch the installed part details to get partId
            try {
              const installedPartResponse = await dataApi.getAllInstalledParts({ installedPartId: claimDetails.installedPartId });
              if (installedPartResponse && installedPartResponse.content && installedPartResponse.content.length > 0) {
                partId = installedPartResponse.content[0].partId || 'UNKNOWN-PART';
              }
            } catch (partErr) {
              console.warn('Could not fetch installed part details:', partErr);
              partId = 'UNKNOWN-PART';
            }
          } else if (claimDetails.partId) {
            partId = claimDetails.partId;
          }

          const serviceHistoryData = {
            vehicleId: claimDetails.vehicleId,
            description: `Yêu cầu bảo hành bị từ chối - Lý do: ${reason || 'Không đủ điều kiện'}. Mô tả gốc: ${claimDetails.description || ''}`,
            serviceDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
            serviceType: 'INSPECTION',
            partId: partId
          };

          await dataApi.createServiceHistory(serviceHistoryData);
          console.log('✅ Service history created for rejected claim:', claimId);
        } catch (historyErr) {
          console.error('❌ Error creating service history:', historyErr);
          console.error('Error details:', historyErr.response?.data || historyErr.message);
          // Don't fail the rejection if history creation fails
        }
      }

      fetchClaims();
      return { success: true };
    } catch (err) {
      console.error("Error rejecting claim:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (claimId) => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA yêu cầu bảo hành này không?')) {
      try {
        await dataApi.deleteWarrantyClaim(claimId);
        fetchClaims();
      } catch (err) {
        alert(`Lỗi khi xóa yêu cầu: ${err.message}`);
      }
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    claims,
    loading,
    error,
    pagination,
    filterStatus,
    handleFilterChange,
    handleApprove,
    handleReject,
    handleDelete,
    handlePageChange,
  };
};
