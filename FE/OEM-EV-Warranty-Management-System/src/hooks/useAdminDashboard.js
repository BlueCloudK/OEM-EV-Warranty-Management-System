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
  const [stats, setStats] = useState({ totalCustomers: 0, totalVehicles: 0, totalParts: 0, totalClaims: 0, pendingClaims: 0, completedClaims: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersRes, vehiclesRes, partsRes, claimsRes, recentCustomers, recentClaims, recentVehicles] = await Promise.allSettled([
        dataApi.getAllCustomers({ size: 1 }),
        dataApi.getAllVehicles({ size: 1 }),
        dataApi.getAllParts({ size: 1 }),
        dataApi.getAllWarrantyClaims({ size: 1000 }),
        dataApi.getAllCustomers({ sort: "createdAt,desc", size: 2 }),
        dataApi.getAllWarrantyClaims({ sort: "createdAt,desc", size: 2 }),
        dataApi.getAllVehicles({ sort: "createdAt,desc", size: 2 }),
      ]);

      // Process stats
      const newStats = {};
      newStats.totalCustomers = customersRes.status === 'fulfilled' ? customersRes.value.totalElements || 0 : 0;
      newStats.totalVehicles = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.totalElements || 0 : 0;
      newStats.totalParts = partsRes.status === 'fulfilled' ? partsRes.value.totalElements || 0 : 0;
      if (claimsRes.status === 'fulfilled' && claimsRes.value.content) {
        const claims = claimsRes.value.content;
        newStats.totalClaims = claimsRes.value.totalElements || 0;
        newStats.pendingClaims = claims.filter(c => ['SUBMITTED', 'MANAGER_REVIEW', 'PROCESSING'].includes(c.status)).length;
        newStats.completedClaims = claims.filter(c => c.status === 'COMPLETED').length;
      }
      setStats(newStats);

      // Process recent activities
      const activities = [];
      if (recentCustomers.status === 'fulfilled' && recentCustomers.value.content) {
        recentCustomers.value.content.forEach(c => activities.push({ id: `cust-${c.customerId}`, action: `Khách hàng mới: ${c.name}`, time: formatTimeAgo(c.createdAt), icon: 'FaUsers' }));
      }
      if (recentClaims.status === 'fulfilled' && recentClaims.value.content) {
        recentClaims.value.content.forEach(c => activities.push({ id: `claim-${c.warrantyClaimId}`, action: `Yêu cầu bảo hành: ${c.description}`, time: formatTimeAgo(c.claimDate), icon: 'FaClipboardList' }));
      }
      if (recentVehicles.status === 'fulfilled' && recentVehicles.value.content) {
        recentVehicles.value.content.forEach(v => activities.push({ id: `veh-${v.vehicleId}`, action: `Xe mới: ${v.vehicleName}`, time: formatTimeAgo(v.createdAt), icon: 'FaCar' }));
      }
      setRecentActivity(activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4));

    } catch (err) {
      console.error("❌ Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { stats, loading, recentActivity };
};
