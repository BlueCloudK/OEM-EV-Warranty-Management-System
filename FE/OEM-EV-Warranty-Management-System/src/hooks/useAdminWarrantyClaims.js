import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';
import { useConfirm } from './useConfirm.jsx';
import { useSmartRefresh } from './useSmartRefresh';

export const useAdminWarrantyClaims = () => {
  const { showConfirm, confirmDialog } = useConfirm();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchClaims = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
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
      if (!silent) {
        setError("Không thể tải danh sách yêu cầu bảo hành.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

  // Smart refresh: poll when there are claims waiting for admin action
  const { lastUpdated, autoRefreshing, getTimeAgo } = useSmartRefresh(fetchClaims, {
    shouldPoll: () => claims.some(c =>
      c.status === 'SUBMITTED' || c.status === 'MANAGER_REVIEW'
    ),
    pollingInterval: 30000, // 30 seconds
    enablePolling: true,
    enableVisibilityRefresh: true,
  });

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (claimId) => {
    const confirmed = await showConfirm({
      title: 'Duyệt yêu cầu bảo hành',
      message: 'Bạn có chắc chắn muốn DUYỆT yêu cầu bảo hành này không?',
      confirmText: 'Duyệt',
      type: 'success'
    });

    if (confirmed) {
      try {
        await dataApi.adminAcceptClaim(claimId);
        fetchClaims();
      } catch (err) {
        await showConfirm({
          title: 'Lỗi',
          message: `Lỗi khi duyệt yêu cầu: ${err.message}`,
          confirmText: 'Đóng',
          cancelText: '',
          type: 'danger'
        });
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
    const confirmed = await showConfirm({
      title: 'Xóa yêu cầu bảo hành',
      message: 'Bạn có chắc chắn muốn XÓA yêu cầu bảo hành này không?\nHành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await dataApi.deleteWarrantyClaim(claimId);
        fetchClaims();
      } catch (err) {
        await showConfirm({
          title: 'Lỗi',
          message: `Lỗi khi xóa yêu cầu: ${err.message}`,
          confirmText: 'Đóng',
          cancelText: '',
          type: 'danger'
        });
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
    refreshClaims: fetchClaims,
    confirmDialog,
    // Smart refresh props
    lastUpdated,
    autoRefreshing,
    getTimeAgo,
  };
};

