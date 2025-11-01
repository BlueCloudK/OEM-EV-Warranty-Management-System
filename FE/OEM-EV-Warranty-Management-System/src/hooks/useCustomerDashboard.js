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

export const useCustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeWarranties: 0,
    pendingClaims: 0,
    completedServices: 0,
    pendingRecalls: 0,
    totalClaims: 0,
    rejectedClaims: 0,
  });
  const [vehicles, setVehicles] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vehicles
      const vehiclesResponse = await apiClient('/api/vehicles/my-vehicles');
      // Handle both array response and paginated response
      const vehiclesData = Array.isArray(vehiclesResponse) 
        ? vehiclesResponse 
        : (vehiclesResponse?.content || vehiclesResponse?.data || []);
      const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : [];
      setVehicles(vehiclesArray);

      // Fetch warranty claims
      const claimsResponse = await apiClient('/api/warranty-claims/my-claims');
      // Handle both array response and paginated response
      const claimsData = Array.isArray(claimsResponse)
        ? claimsResponse
        : (claimsResponse?.content || claimsResponse?.data || []);
      const claimsArray = Array.isArray(claimsData) ? claimsData : [];
      setRecentClaims(claimsArray.slice(0, 5)); // Get latest 5 claims

      // Fetch recalls
      let recallsArray = [];
      try {
        const recallsResponse = await apiClient('/api/recall-requests/my-recalls');
        // Handle both array response and paginated response
        const recallsData = Array.isArray(recallsResponse)
          ? recallsResponse
          : (recallsResponse?.content || recallsResponse?.data || []);
        recallsArray = Array.isArray(recallsData) ? recallsData : [];
      } catch (err) {
        console.warn('Could not fetch recalls:', err);
      }

      // Calculate stats using extracted arrays
      const activeWarranties = vehiclesArray.filter(v => {
        if (!v.warrantyEndDate) return false;
        const endDate = new Date(v.warrantyEndDate);
        return endDate > new Date();
      }).length;

      const pendingClaims = claimsArray.filter(c =>
        c.status === 'SUBMITTED' || c.status === 'APPROVED_BY_SC'
      ).length;

      const completedServices = claimsArray.filter(c =>
        c.status === 'COMPLETED'
      ).length;

      const rejectedClaims = claimsArray.filter(c =>
        c.status === 'REJECTED_BY_SC' || c.status === 'REJECTED_BY_EVM'
      ).length;

      const pendingRecalls = recallsArray.filter(r =>
        r.status === 'WAITING_CUSTOMER_CONFIRM'
      ).length;

      const calculatedStats = {
        totalVehicles: vehiclesArray.length,
        activeWarranties,
        pendingClaims,
        completedServices,
        pendingRecalls,
        totalClaims: claimsArray.length,
        rejectedClaims,
      };
      
      setStats(calculatedStats);

      // Generate recent activity
      const activities = [];

      // Add recent claims
      claimsArray.slice(0, 3).forEach((claim, index) => {
        const claimId = claim.claimId || claim.id || `unknown-${index}`;
        const statusText = {
          'SUBMITTED': 'đã được gửi',
          'APPROVED_BY_SC': 'đã được SC duyệt',
          'APPROVED_BY_EVM': 'đã được EVM duyệt',
          'REJECTED_BY_SC': 'bị SC từ chối',
          'REJECTED_BY_EVM': 'bị EVM từ chối',
          'COMPLETED': 'đã hoàn thành',
          'IN_PROGRESS': 'đang xử lý'
        }[claim.status] || claim.status;

        activities.push({
          id: `claim-${claimId}-${index}`,
          icon: 'FaClipboardList',
          action: `Yêu cầu bảo hành #${claimId} ${statusText}`,
          time: formatTimeAgo(claim.createdAt || claim.submittedDate)
        });
      });

      // Add recent recalls
      recallsArray.slice(0, 2).forEach((recall, index) => {
        const recallId = recall.recallRequestId || recall.id || `unknown-${index}`;
        activities.push({
          id: `recall-${recallId}-${index}`,
          icon: 'FaExclamationTriangle',
          action: `Thông báo thu hồi phụ tùng: ${recall.installedPart?.part?.partName || 'N/A'}`,
          time: formatTimeAgo(recall.createdAt)
        });
      });

      // Sort by time
      setRecentActivity(activities.slice(0, 5));

      // Generate alerts
      const newAlerts = [];

      // Alert for pending recalls
      if (pendingRecalls > 0) {
        newAlerts.push({
          id: 'recalls',
          type: 'danger',
          title: `${pendingRecalls} thông báo thu hồi cần xác nhận`,
          message: 'Vui lòng kiểm tra và xác nhận các yêu cầu thu hồi phụ tùng',
        });
      }

      // Alert for expiring warranties
      const expiringWarranties = vehiclesArray.filter(v => {
        if (!v.warrantyEndDate) return false;
        const endDate = new Date(v.warrantyEndDate);
        const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      });

      if (expiringWarranties.length > 0) {
        newAlerts.push({
          id: 'expiring-warranty',
          type: 'warning',
          title: `${expiringWarranties.length} xe sắp hết hạn bảo hành`,
          message: 'Bảo hành sẽ hết hiệu lực trong vòng 30 ngày',
        });
      }

      // Alert for pending claims
      if (pendingClaims > 0) {
        newAlerts.push({
          id: 'pending-claims',
          type: 'info',
          title: `${pendingClaims} yêu cầu bảo hành đang xử lý`,
          message: 'Các yêu cầu của bạn đang được xem xét',
        });
      }

      setAlerts(newAlerts);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    vehicles,
    recentClaims,
    recentActivity,
    alerts,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};
