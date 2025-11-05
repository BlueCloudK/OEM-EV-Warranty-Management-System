import { useState, useEffect, useCallback } from "react";
import { dataApi } from "../api/dataApi";

// Helper function to format time
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Unknown time";
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

/**
 * Custom Hook for Admin Dashboard Logic (Auth logic removed)
 * - Its only responsibility is to fetch data for the dashboard.
 * - Authentication is now handled by the component that uses this hook.
 */
export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalParts: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0,
    totalFeedbacks: 0,
    totalRecalls: 0,
    claimsByStatus: []
  });
  const [chartData, setChartData] = useState({ overviewChart: [], claimsStatusChart: [], recallProgressChart: [] });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Optimized: Fetch all data in parallel with minimal size to reduce payload
      const [
        customersRes,
        vehiclesRes,
        partsRes,
        claimsRes,
        pendingClaimsRes,
        completedClaimsRes,
        feedbacksRes,
        recallsRes,
        recallProgressRes,
        recentCustomers,
        recentClaims,
        recentVehicles,
      ] = await Promise.allSettled([
        // Get total counts only (size=1 to minimize data transfer)
        dataApi.getAllCustomers({ size: 1 }),
        dataApi.getAllVehicles({ size: 1 }),
        dataApi.getAllParts({ size: 1 }),
        dataApi.getAllWarrantyClaims({ size: 1 }), // Total claims count

        // Get specific status counts efficiently
        dataApi.getAdminPendingClaims({ size: 1 }), // Pending claims count
        dataApi.getClaimsByStatus('COMPLETED', { size: 1 }), // Completed claims count

        // Get Feedbacks and Recalls counts
        dataApi.getAllFeedbacks({ size: 1 }),
        dataApi.getRecallCampaignStatus().catch(() => ({ totalElements: 0 })), // Recalls count with fallback
        dataApi.getRecallCampaignProgress().catch(() => []), // Recall progress data with fallback

        // Get recent items for activity feed
        dataApi.getAllCustomers({ sort: "createdAt,desc", size: 3 }),
        dataApi.getAllWarrantyClaims({ sort: "claimDate,desc", size: 3 }),
        dataApi.getAllVehicles({ sort: "createdAt,desc", size: 3 }),
      ]);

      // Process stats efficiently
      const newStats = {
        totalCustomers: customersRes.status === 'fulfilled' ? (customersRes.value?.totalElements || 0) : 0,
        totalVehicles: vehiclesRes.status === 'fulfilled' ? (vehiclesRes.value?.totalElements || 0) : 0,
        totalParts: partsRes.status === 'fulfilled' ? (partsRes.value?.totalElements || 0) : 0,
        totalClaims: claimsRes.status === 'fulfilled' ? (claimsRes.value?.totalElements || 0) : 0,
        pendingClaims: pendingClaimsRes.status === 'fulfilled' ? (pendingClaimsRes.value?.totalElements || 0) : 0,
        completedClaims: completedClaimsRes.status === 'fulfilled' ? (completedClaimsRes.value?.totalElements || 0) : 0,
        totalFeedbacks: feedbacksRes.status === 'fulfilled' ? (feedbacksRes.value?.totalElements || 0) : 0,
        totalRecalls: recallsRes.status === 'fulfilled' ? (recallsRes.value?.totalElements || recallsRes.value?.total || 0) : 0,
        claimsByStatus: []
      };

      // Build claims by status chart data
      // Note: If backend provides aggregated endpoint, replace this with single API call
      const statusData = [
        { name: 'PENDING_ADMIN_APPROVAL', value: newStats.pendingClaims },
        { name: 'COMPLETED', value: newStats.completedClaims },
        { name: 'IN_PROGRESS', value: Math.max(0, newStats.totalClaims - newStats.pendingClaims - newStats.completedClaims) }
      ];
      newStats.claimsByStatus = statusData.filter(item => item.value > 0);

      setStats(newStats);

      // Build comprehensive chart data for visualization
      const newChartData = {
        // Overview Bar Chart - Tổng quan hệ thống
        overviewChart: [
          { name: 'Khách hàng', value: newStats.totalCustomers, fill: '#3b82f6' },
          { name: 'Phương tiện', value: newStats.totalVehicles, fill: '#10b981' },
          { name: 'Linh kiện', value: newStats.totalParts, fill: '#f59e0b' },
          { name: 'Yêu cầu BH', value: newStats.totalClaims, fill: '#8b5cf6' },
          { name: 'Phản hồi', value: newStats.totalFeedbacks, fill: '#06b6d4' },
          { name: 'Recall', value: newStats.totalRecalls, fill: '#ef4444' }
        ],

        // Claims Status Progress Bar - Phân bố trạng thái bảo hành
        claimsStatusChart: [
          { name: 'Hoàn thành', value: newStats.completedClaims, fill: '#10b981' },
          { name: 'Đang xử lý', value: Math.max(0, newStats.totalClaims - newStats.pendingClaims - newStats.completedClaims), fill: '#3b82f6' },
          { name: 'Chờ duyệt', value: newStats.pendingClaims, fill: '#fbbf24' }
        ].filter(item => item.value > 0),

        // Recall Progress Chart - Tiến độ chiến dịch Recall
        recallProgressChart: recallProgressRes.status === 'fulfilled' && Array.isArray(recallProgressRes.value)
          ? recallProgressRes.value.map(campaign => ({
              name: campaign.campaignName || campaign.name || 'Chiến dịch Recall',
              completed: campaign.completed || campaign.confirmedCount || 0,
              pending: campaign.pending || campaign.pendingCount || 0,
              notified: campaign.notified || campaign.notifiedCount || 0,
              total: campaign.total || campaign.totalAffected || 0
            }))
          : []
      };

      setChartData(newChartData);

      // Process recent activities with proper time sorting
      const activities = [];

      if (recentCustomers.status === 'fulfilled' && recentCustomers.value?.content) {
        recentCustomers.value.content.forEach(c => {
          activities.push({
            id: `cust-${c.customerId}`,
            action: `Khách hàng mới: ${c.name}`,
            time: formatTimeAgo(c.createdAt),
            timestamp: new Date(c.createdAt).getTime(),
            icon: 'FaUsers'
          });
        });
      }

      if (recentClaims.status === 'fulfilled' && recentClaims.value?.content) {
        recentClaims.value.content.forEach(c => {
          activities.push({
            id: `claim-${c.warrantyClaimId}`,
            action: `Yêu cầu bảo hành: ${c.description?.substring(0, 50) || 'N/A'}`,
            time: formatTimeAgo(c.claimDate),
            timestamp: new Date(c.claimDate).getTime(),
            icon: 'FaClipboardList'
          });
        });
      }

      if (recentVehicles.status === 'fulfilled' && recentVehicles.value?.content) {
        recentVehicles.value.content.forEach(v => {
          activities.push({
            id: `veh-${v.vehicleId}`,
            action: `Xe mới: ${v.vehicleName}`,
            time: formatTimeAgo(v.createdAt),
            timestamp: new Date(v.createdAt).getTime(),
            icon: 'FaCar'
          });
        });
      }

      // Sort by timestamp (newest first) and take top 5
      const sortedActivities = activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map(({ id, action, time, icon }) => ({ id, action, time, icon }));

      setRecentActivity(sortedActivities);

    } catch (err) {
      console.error("❌ Dashboard data fetch error:", err);
      // Set empty state on error to prevent UI breaks
      setStats({
        totalCustomers: 0,
        totalVehicles: 0,
        totalParts: 0,
        totalClaims: 0,
        pendingClaims: 0,
        completedClaims: 0,
        totalFeedbacks: 0,
        totalRecalls: 0,
        claimsByStatus: []
      });
      setChartData({
        overviewChart: [],
        claimsStatusChart: [],
        recallProgressChart: []
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { stats, chartData, loading, recentActivity };
};

