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

      // Process claims - handle both paginated and non-paginated responses
      let assignedClaims = 0;
      let inProgressClaims = 0;
      let completedClaims = 0;

      if (claimsRes.status === 'fulfilled') {
        let claims = [];
        const response = claimsRes.value;
        
        // Handle paginated response
        if (response && Array.isArray(response.content)) {
          claims = response.content;
        } else if (response && Array.isArray(response)) {
          claims = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          claims = response.data;
        }

        // Filter claims for technician (approved by EVM or in progress)
        assignedClaims = claims.filter(c =>
          c.status === 'APPROVED_BY_EVM' || 
          c.status === 'IN_PROGRESS' ||
          c.status === 'APPROVED_BY_SC'
        ).length;
        
        inProgressClaims = claims.filter(c => 
          c.status === 'IN_PROGRESS'
        ).length;
        
        completedClaims = claims.filter(c => 
          c.status === 'COMPLETED'
        ).length;
      }

      // Get installed parts count - handle both paginated and non-paginated
      let installedParts = 0;
      if (partsRes.status === 'fulfilled') {
        const response = partsRes.value;
        if (response && typeof response.totalElements === 'number') {
          installedParts = response.totalElements;
        } else if (response && Array.isArray(response)) {
          installedParts = response.length;
        } else if (response && Array.isArray(response.content)) {
          installedParts = response.totalElements || response.content.length;
        } else if (response && response.data && Array.isArray(response.data)) {
          installedParts = response.data.length;
        }
      }

      setStats({
        assignedClaims,
        inProgressClaims,
        completedClaims,
        installedParts,
      });

      // Generate recent activity
      const activities = [];

      if (claimsRes.status === 'fulfilled') {
        let claims = [];
        const response = claimsRes.value;
        
        // Handle paginated response
        if (response && Array.isArray(response.content)) {
          claims = response.content;
        } else if (response && Array.isArray(response)) {
          claims = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          claims = response.data;
        }

        claims.slice(0, 5).forEach((claim, index) => {
          const statusText = {
            'APPROVED_BY_EVM': 'được giao cho bạn',
            'APPROVED_BY_SC': 'được giao cho bạn',
            'IN_PROGRESS': 'đang xử lý',
            'COMPLETED': 'đã hoàn thành'
          }[claim.status];

          if (statusText) {
            const claimId = claim.claimId || claim.id || `claim-${index}`;
            const timestamp = claim.createdAt || claim.submittedDate || claim.updatedAt || new Date().toISOString();
            
            activities.push({
              id: `claim-${claimId}-${index}`,
              icon: 'FaWrench',
              action: `Công việc #${claimId} ${statusText}`,
              time: formatTimeAgo(timestamp)
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
