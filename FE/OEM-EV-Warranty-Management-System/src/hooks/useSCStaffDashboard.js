import { useState, useEffect, useCallback } from "react";
import { dataApi } from "../api/dataApi";

/**
 * Custom Hook for SCStaff Dashboard Logic (Auth logic removed)
 * - Its only responsibility is to fetch statistics for the dashboard.
 */
export const useSCStaffDashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    submittedClaims: 0,
    completedServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersRes, vehiclesRes, claimsRes, servicesRes] = await Promise.allSettled([
        dataApi.getAllCustomers({ size: 1 }),
        dataApi.getAllVehicles({ size: 1 }),
        dataApi.getAllWarrantyClaims({ size: 100 }),
        dataApi.getAllServiceHistories({ size: 100 }),
      ]);

      // Extract customers count - handle both paginated and non-paginated responses
      let customersCount = 0;
      if (customersRes.status === 'fulfilled') {
        const customersData = customersRes.value;
        customersCount = customersData?.totalElements || 
          (Array.isArray(customersData) ? customersData.length : 0);
      }

      // Extract vehicles count
      let vehiclesCount = 0;
      if (vehiclesRes.status === 'fulfilled') {
        const vehiclesData = vehiclesRes.value;
        vehiclesCount = vehiclesData?.totalElements || 
          (Array.isArray(vehiclesData) ? vehiclesData.length : 0);
      }

      // Process claims - count submitted/pending claims
      let submittedClaimsCount = 0;
      if (claimsRes.status === 'fulfilled') {
        const claimsData = claimsRes.value;
        const claimsArray = Array.isArray(claimsData)
          ? claimsData
          : (claimsData?.content || []);
        
        submittedClaimsCount = claimsArray.filter(c => 
          c.status === 'SUBMITTED' || 
          c.status === 'MANAGER_REVIEW' || 
          c.status === 'PROCESSING' ||
          c.status === 'APPROVED_BY_SC'
        ).length;
      }

      // Process service histories - count completed services
      let completedServicesCount = 0;
      if (servicesRes.status === 'fulfilled') {
        const servicesData = servicesRes.value;
        const servicesArray = Array.isArray(servicesData)
          ? servicesData
          : (servicesData?.content || []);
        
        completedServicesCount = servicesArray.filter(s => 
          s.status === 'COMPLETED' || 
          s.completionDate !== null ||
          (s.serviceHistoryId && s.status === 'COMPLETED')
        ).length;
      }

      setStats({
        customers: customersCount,
        vehicles: vehiclesCount,
        submittedClaims: submittedClaimsCount,
        completedServices: completedServicesCount,
      });

    } catch (err) {
      console.error('❌ Failed to load SCStaff dashboard stats', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
      setStats({
        customers: 0,
        vehicles: 0,
        submittedClaims: 0,
        completedServices: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
};
