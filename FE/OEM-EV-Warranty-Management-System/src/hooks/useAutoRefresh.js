import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for auto-refreshing data based on visibility changes and polling.
 * 
 * @param {Object} options
 * @param {Function} options.fetchData - Function to fetch data. Should accept a boolean 'silent' argument.
 * @param {boolean} options.shouldPoll - Whether to enable polling.
 * @param {number} options.pollInterval - Polling interval in ms (default: 30000).
 * @param {number} options.staleTime - Time in ms before data is considered stale for visibility refresh (default: 30000).
 * @returns {Object} { lastUpdated, isRefreshing }
 */
const useAutoRefresh = ({
    fetchData,
    shouldPoll = false,
    pollInterval = 30000,
    staleTime = 30000
}) => {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const lastUpdatedRef = useRef(lastUpdated);

    // Update ref when state changes
    useEffect(() => {
        lastUpdatedRef.current = lastUpdated;
    }, [lastUpdated]);

    // Auto-refresh when user returns to tab
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && lastUpdatedRef.current) {
                const timeSinceUpdate = Date.now() - lastUpdatedRef.current.getTime();
                // Refresh if more than staleTime since last update
                if (timeSinceUpdate > staleTime) {
                    console.log('🔄 Auto-refreshing (tab became visible)');
                    triggerRefresh();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [staleTime]);

    // Smart polling
    useEffect(() => {
        let interval;
        if (shouldPoll) {
            console.log('⏰ Smart polling enabled');
            interval = setInterval(() => {
                console.log('🔄 Auto-refreshing (smart polling)');
                triggerRefresh();
            }, pollInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [shouldPoll, pollInterval]);

    const triggerRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchData(true); // Call with silent=true
            const now = new Date();
            setLastUpdated(now);
        } catch (error) {
            console.error('Error during auto-refresh:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return {
        lastUpdated,
        setLastUpdated, // Allow manual update of timestamp
        isRefreshing
    };
};

export default useAutoRefresh;
