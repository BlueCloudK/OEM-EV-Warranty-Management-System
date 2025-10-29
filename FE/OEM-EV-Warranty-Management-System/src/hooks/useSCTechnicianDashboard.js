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

export const useSCTechnicianDashboard = () => {
  const [stats, setStats] = useState({
    assignedClaims: 0,
    inProgressClaims: 0,
    completedClaims: 0,
    installedParts: 0,
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

      // Fetch warranty claims and installed parts
      const [claimsRes, partsRes] = await Promise.allSettled([
        apiClient('/api/warranty-claims?page=0&size=100'),
        apiClient('/api/installed-parts?page=0&size=1'),
      ]);

      // Process claims
      let assignedClaims = 0;
      let inProgressClaims = 0;
      let completedClaims = 0;

      if (claimsRes.status === 'fulfilled') {
        const claims = claimsRes.value?.content || [];
        // Assuming technician sees claims that are approved
        assignedClaims = claims.filter(c =>
          c.status === 'APPROVED_BY_EVM' || c.status === 'IN_PROGRESS'
        ).length;
        inProgressClaims = claims.filter(c => c.status === 'IN_PROGRESS').length;
        completedClaims = claims.filter(c => c.status === 'COMPLETED').length;
      }

      // Get installed parts count
      const installedParts = partsRes.status === 'fulfilled' ? (partsRes.value?.totalElements || 0) : 0;

      setStats({
        assignedClaims,
        inProgressClaims,
        completedClaims,
        installedParts,
      });

      // Generate recent activity
      const activities = [];

      if (claimsRes.status === 'fulfilled') {
        const claims = claimsRes.value?.content || [];
        claims.slice(0, 5).forEach(claim => {
          const statusText = {
            'APPROVED_BY_EVM': 'được giao cho bạn',
            'IN_PROGRESS': 'đang xử lý',
            'COMPLETED': 'đã hoàn thành'
          }[claim.status];

          if (statusText) {
            activities.push({
              id: `claim-${claim.claimId}`,
              icon: 'FaWrench',
              action: `Công việc #${claim.claimId} ${statusText}`,
              time: formatTimeAgo(claim.createdAt || claim.submittedDate)
            });
          }
        });
      }

      setRecentActivity(activities);

    } catch (err) {
      console.error('Error fetching SC Technician dashboard data:', err);
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
