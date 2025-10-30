import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const useEVMDashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalParts: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    pendingPartRequests: 0,
    pendingRecalls: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [vehiclesRes, partsRes, claimsRes, partRequestsRes, recallsRes] = await Promise.allSettled([
        apiClient('/api/vehicles?page=0&size=1'),
        apiClient('/api/parts?page=0&size=1'),
        apiClient('/api/warranty-claims?page=0&size=100'),
        apiClient('/api/part-requests?page=0&size=100'),
        apiClient('/api/recall-requests?page=0&size=100'),
      ]);

      // Extract totals
      const totalVehicles = vehiclesRes.status === 'fulfilled' ? (vehiclesRes.value?.totalElements || 0) : 0;
      const totalParts = partsRes.status === 'fulfilled' ? (partsRes.value?.totalElements || 0) : 0;

      // Process claims
      let pendingClaims = 0;
      let approvedClaims = 0;
      if (claimsRes.status === 'fulfilled') {
        const claims = claimsRes.value?.content || [];
        pendingClaims = claims.filter(c => c.status === 'APPROVED_BY_SC').length;
        approvedClaims = claims.filter(c => c.status === 'APPROVED_BY_EVM' || c.status === 'COMPLETED').length;
      }

      // Process part requests
      let pendingPartRequests = 0;
      if (partRequestsRes.status === 'fulfilled') {
        const partRequests = partRequestsRes.value?.content || [];
        pendingPartRequests = partRequests.filter(pr => pr.status === 'PENDING').length;
      }

      // Process recalls
      let pendingRecalls = 0;
      if (recallsRes.status === 'fulfilled') {
        const recalls = recallsRes.value?.content || [];
        pendingRecalls = recalls.filter(r => r.status === 'PENDING_ADMIN_APPROVAL').length;
      }

      setStats({
        totalVehicles,
        totalParts,
        pendingClaims,
        approvedClaims,
        pendingPartRequests,
        pendingRecalls,
      });

      // Generate recent activity
      const activities = [];

      // Add recent claims
      if (claimsRes.status === 'fulfilled') {
        const claims = claimsRes.value?.content || [];
        claims.slice(0, 3).forEach(claim => {
          const statusText = {
            'APPROVED_BY_SC': 'chờ EVM duyệt',
            'APPROVED_BY_EVM': 'đã được duyệt',
            'REJECTED_BY_EVM': 'đã từ chối'
          }[claim.status];

          if (statusText) {
            activities.push({
              id: `claim-${claim.claimId}`,
              icon: 'FaClipboardList',
              action: `Yêu cầu bảo hành #${claim.claimId} ${statusText}`,
              time: formatTimeAgo(claim.createdAt || claim.submittedDate)
            });
          }
        });
      }

      // Add recent part requests
      if (partRequestsRes.status === 'fulfilled') {
        const partRequests = partRequestsRes.value?.content || [];
        partRequests.slice(0, 2).forEach(pr => {
          activities.push({
            id: `part-req-${pr.partRequestId}`,
            icon: 'FaBoxes',
            action: `Yêu cầu phụ tùng: ${pr.part?.partName || 'N/A'}`,
            time: formatTimeAgo(pr.requestedDate)
          });
        });
      }

      setRecentActivity(activities.slice(0, 5));

    } catch (err) {
      console.error('Error fetching EVM dashboard data:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};
