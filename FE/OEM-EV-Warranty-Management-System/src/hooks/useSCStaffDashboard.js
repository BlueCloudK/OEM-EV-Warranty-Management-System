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

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [customersRes, vehiclesRes, claimsRes, servicesRes] = await Promise.allSettled([
        dataApi.getAllCustomers({ size: 1 }),
        dataApi.getAllVehicles({ size: 1 }),
        dataApi.getAllWarrantyClaims({ status: 'SUBMITTED', size: 1 }),
        dataApi.getAllServiceHistories({ status: 'COMPLETED', size: 1 }),
      ]);

      setStats({
        customers: customersRes.status === 'fulfilled' ? customersRes.value.totalElements || 0 : 0,
        vehicles: vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.totalElements || 0 : 0,
        submittedClaims: claimsRes.status === 'fulfilled' ? claimsRes.value.totalElements || 0 : 0,
        completedServices: servicesRes.status === 'fulfilled' ? servicesRes.value.totalElements || 0 : 0,
      });

    } catch (err) {
      console.error('❌ Failed to load SCStaff dashboard stats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading };
};
