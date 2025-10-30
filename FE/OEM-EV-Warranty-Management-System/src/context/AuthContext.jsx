import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAuthApi } from '../api/adminUsers';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Helper function to normalize the user object from the API
const normalizeUser = (user) => {
  if (!user) return null;

  // If roleName already exists, do nothing.
  if (user.roleName) return user;

  // If `roles` array exists, create `roleName` from it.
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const mainRole = user.roles[0]; // e.g., "ROLE_ADMIN"
    // Create a new user object to avoid mutating the original one
    const normalized = { 
      ...user, 
      roleName: mainRole.replace('ROLE_', '') // e.g., "ADMIN"
    };
    return normalized;
  }
  
  return user;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No token found');
      
      const rawUser = await adminAuthApi.getCurrentUser();
      const user = normalizeUser(rawUser); // Normalize the data

      if (!user) throw new Error("Invalid user data from API");

      setAuthState({ user, isAuthenticated: true });
    } catch (error) {
      console.log('Initial auth check failed:', error.message);
      setAuthState({ user: null, isAuthenticated: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (username, password) => {
    try {
      const data = await adminAuthApi.login({ username, password });
      if (data && data.accessToken) {
        const rawUser = await adminAuthApi.getCurrentUser();
        const user = normalizeUser(rawUser); // Normalize the data

        if (!user) throw new Error("Invalid user data after login");

        // If user is CUSTOMER, fetch profile to get customerId
        if (user.roleName === 'CUSTOMER' || user.hasCustomerRole) {
          try {
            const profile = await adminAuthApi.getMyProfile();
            if (profile && profile.customerId) {
              // Store customerId in localStorage
              localStorage.setItem('customerId', profile.customerId);
              console.log('✅ Customer ID saved:', profile.customerId);
            }
          } catch (profileError) {
            console.warn('Failed to fetch customer profile:', profileError);
          }
        }

        setAuthState({ user, isAuthenticated: true });
        return user; // Return normalized user data
      }
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      setAuthState({ user: null, isAuthenticated: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('customerId');
      throw error;
    }
  };

  const logout = () => {
    adminAuthApi.logout();
    setAuthState({ user: null, isAuthenticated: false });
  };

  const value = {
    ...authState,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
