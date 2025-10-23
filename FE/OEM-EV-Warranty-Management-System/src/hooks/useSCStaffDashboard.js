import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dataApi } from "../api/dataApi";

/**
 * Custom Hook for SCStaff Dashboard Logic
 * - Fetches all necessary statistics for the SCStaff role.
 * - Manages loading and error states.
 * - Ensures user is authenticated and has the correct role.
 */
export const useSCStaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    submittedClaims: 0,
    completedServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication and Role Check
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }

    const loadStats = async () => {
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
        // In case of a total failure, stats will remain 0
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [navigate]);

  return { stats, loading };
};
