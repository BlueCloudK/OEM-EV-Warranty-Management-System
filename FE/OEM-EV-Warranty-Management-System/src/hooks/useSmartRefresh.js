import { useState, useEffect, useCallback } from 'react';

/**
 * Smart auto-refresh hook with multiple strategies
 *
 * @param {Function} fetchFunction - The function to call for refreshing data
 * @param {Object} options - Configuration options
 * @param {Function} options.shouldPoll - Function that returns true if polling should be active
 * @param {number} options.pollingInterval - Interval in ms for polling (default: 30000)
 * @param {number} options.visibilityThreshold - Min time in ms before visibility refresh (default: 30000)
 * @param {boolean} options.enablePolling - Enable smart polling (default: true)
 * @param {boolean} options.enableVisibilityRefresh - Enable visibility-based refresh (default: true)
 *
 * @returns {Object} - { lastUpdated, autoRefreshing, manualRefresh, getTimeAgo }
 */
export const useSmartRefresh = (fetchFunction, options = {}) => {
  const {
    shouldPoll = () => false,
    pollingInterval = 30000, // 30 seconds
    visibilityThreshold = 30000, // 30 seconds
    enablePolling = true,
    enableVisibilityRefresh = true,
  } = options;

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  // Wrapper for fetch function that tracks timestamp
  const wrappedFetch = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setAutoRefreshing(true);
      }
      await fetchFunction(silent);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Smart refresh error:', error);
    } finally {
      if (silent) {
        setAutoRefreshing(false);
      }
    }
  }, [fetchFunction]);

  // Manual refresh (non-silent)
  const manualRefresh = useCallback(() => {
    wrappedFetch(false);
  }, [wrappedFetch]);

  // Visibility-based refresh
  useEffect(() => {
    if (!enableVisibilityRefresh) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        if (timeSinceUpdate > visibilityThreshold) {
          console.log('🔄 Auto-refreshing (tab became visible)');
          wrappedFetch(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastUpdated, visibilityThreshold, enableVisibilityRefresh, wrappedFetch]);

  // Smart polling
  useEffect(() => {
    if (!enablePolling) return;

    const shouldStartPolling = shouldPoll();

    if (shouldStartPolling) {
      console.log('⏰ Smart polling enabled');
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing (smart polling)');
        wrappedFetch(true);
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [shouldPoll, pollingInterval, enablePolling, wrappedFetch]);

  // Helper to get relative time
  const getTimeAgo = useCallback((date) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  }, []);

  return {
    lastUpdated,
    autoRefreshing,
    manualRefresh,
    getTimeAgo,
    setLastUpdated, // Allow manual timestamp updates
  };
};

export default useSmartRefresh;
