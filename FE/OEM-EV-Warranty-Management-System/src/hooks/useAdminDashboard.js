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
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params properly
      const recentParams = { page: 0, size: 5, sort: 'createdAt,desc' };
      
      const [customersRes, vehiclesRes, partsRes, claimsRes, recentCustomers, recentClaims, recentVehicles, recentServiceHistories] = await Promise.allSettled([
        dataApi.getAllCustomers({ page: 0, size: 1 }),
        dataApi.getAllVehicles({ page: 0, size: 1 }),
        dataApi.getAllParts({ page: 0, size: 1 }),
        dataApi.getAllWarrantyClaims({ page: 0, size: 1000 }),
        dataApi.getAllCustomers(recentParams),
        dataApi.getAllWarrantyClaims(recentParams),
        dataApi.getAllVehicles(recentParams),
        dataApi.getAllServiceHistories(recentParams),
      ]);

      // Process stats - handle both paginated and non-paginated responses
      const newStats = {};
      
      // Extract totalCustomers
      if (customersRes.status === 'fulfilled') {
        const customersData = customersRes.value;
        newStats.totalCustomers = customersData?.totalElements || 
          (Array.isArray(customersData) ? customersData.length : 0);
      } else {
        newStats.totalCustomers = 0;
      }

      // Extract totalVehicles
      if (vehiclesRes.status === 'fulfilled') {
        const vehiclesData = vehiclesRes.value;
        newStats.totalVehicles = vehiclesData?.totalElements || 
          (Array.isArray(vehiclesData) ? vehiclesData.length : 0);
      } else {
        newStats.totalVehicles = 0;
      }

      // Extract totalParts
      if (partsRes.status === 'fulfilled') {
        const partsData = partsRes.value;
        newStats.totalParts = partsData?.totalElements || 
          (Array.isArray(partsData) ? partsData.length : 0);
      } else {
        newStats.totalParts = 0;
      }

      // Process claims
      let claimsArray = [];
      if (claimsRes.status === 'fulfilled') {
        const claimsData = claimsRes.value;
        claimsArray = Array.isArray(claimsData)
          ? claimsData
          : (claimsData?.content || []);
        newStats.totalClaims = claimsData?.totalElements || claimsArray.length;
        
        // Filter pending and completed claims
        newStats.pendingClaims = claimsArray.filter(c => 
          ['SUBMITTED', 'MANAGER_REVIEW', 'PROCESSING', 'APPROVED_BY_SC', 'APPROVED_BY_EVM'].includes(c.status)
        ).length;
        
        newStats.completedClaims = claimsArray.filter(c => 
          c.status === 'COMPLETED'
        ).length;
      } else {
        newStats.totalClaims = 0;
        newStats.pendingClaims = 0;
        newStats.completedClaims = 0;
      }

      setStats(newStats);

      // Process recent activities
      const activities = [];
      
      // Add recent customers
      if (recentCustomers.status === 'fulfilled') {
        const customersData = recentCustomers.value;
        const customersArray = Array.isArray(customersData)
          ? customersData
          : (customersData?.content || []);
        
        customersArray.forEach((c, index) => {
          const customerId = c.customerId || c.id || `unknown-${index}`;
          activities.push({ 
            id: `cust-${customerId}-${index}`, 
            action: `Khách hàng mới: ${c.name || c.fullName || 'N/A'}`, 
            time: formatTimeAgo(c.createdAt), 
            icon: 'FaUsers',
            timestamp: new Date(c.createdAt || Date.now()).getTime()
          });
        });
      }

      // Add recent claims
      if (recentClaims.status === 'fulfilled') {
        const claimsData = recentClaims.value;
        const claimsArray = Array.isArray(claimsData)
          ? claimsData
          : (claimsData?.content || []);
        
        claimsArray.forEach((c, index) => {
          const claimId = c.warrantyClaimId || c.claimId || c.id || `unknown-${index}`;
          activities.push({ 
            id: `claim-${claimId}-${index}`, 
            action: `Yêu cầu bảo hành: ${c.description || c.issueDescription || 'N/A'}`, 
            time: formatTimeAgo(c.claimDate || c.createdAt || c.submittedDate), 
            icon: 'FaClipboardList',
            timestamp: new Date(c.claimDate || c.createdAt || c.submittedDate || Date.now()).getTime()
          });
        });
      }

      // Add recent vehicles
      if (recentVehicles.status === 'fulfilled') {
        const vehiclesData = recentVehicles.value;
        const vehiclesArray = Array.isArray(vehiclesData)
          ? vehiclesData
          : (vehiclesData?.content || []);
        
        vehiclesArray.forEach((v, index) => {
          const vehicleId = v.vehicleId || v.id || `unknown-${index}`;
          activities.push({ 
            id: `veh-${vehicleId}-${index}`, 
            action: `Xe mới: ${v.vehicleName || v.model || v.vin || 'N/A'}`, 
            time: formatTimeAgo(v.createdAt), 
            icon: 'FaCar',
            timestamp: new Date(v.createdAt || Date.now()).getTime()
          });
        });
      }

      // Add recent service histories
      if (recentServiceHistories.status === 'fulfilled') {
        const serviceHistoriesData = recentServiceHistories.value;
        const serviceHistoriesArray = Array.isArray(serviceHistoriesData)
          ? serviceHistoriesData
          : (serviceHistoriesData?.content || []);
        
        serviceHistoriesArray.forEach((sh, index) => {
          const serviceHistoryId = sh.serviceHistoryId || sh.id || `unknown-${index}`;
          const vehicleInfo = sh.vehicle?.vehicleName || sh.vehicle?.vin || sh.vehicleId || 'N/A';
          activities.push({ 
            id: `svc-${serviceHistoryId}-${index}`, 
            action: `Dịch vụ mới: ${vehicleInfo}`, 
            time: formatTimeAgo(sh.serviceDate || sh.createdAt), 
            icon: 'FaHistory',
            timestamp: new Date(sh.serviceDate || sh.createdAt || Date.now()).getTime()
          });
        });
      }

      // Sort by timestamp (newest first) and take top 5
      const sortedActivities = activities
        .filter(a => a.timestamp) // Only include activities with valid timestamp
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5);
      
      setRecentActivity(sortedActivities);

    } catch (err) {
      console.error("❌ Dashboard data fetch error:", err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
      setStats({
        totalCustomers: 0,
        totalVehicles: 0,
        totalParts: 0,
        totalClaims: 0,
        pendingClaims: 0,
        completedClaims: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { stats, loading, error, recentActivity, refresh: fetchAllData };
};
