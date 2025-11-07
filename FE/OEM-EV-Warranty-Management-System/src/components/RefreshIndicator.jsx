import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Reusable component to show last updated timestamp and auto-refresh status
 */
const RefreshIndicator = ({ lastUpdated, autoRefreshing, getTimeAgo, isPollingActive }) => {
  if (!lastUpdated) return null;

  return (
    <small style={{
      color: '#7f8c8d',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      fontSize: '13px'
    }}>
      {autoRefreshing && (
        <FaSpinner
          className="spinner"
          style={{ fontSize: '12px' }}
        />
      )}
      <span>Cập nhật: {getTimeAgo(lastUpdated)}</span>
      {isPollingActive && (
        <span style={{ color: '#27ae60', fontWeight: '500' }}>
          • Auto-refresh đang bật
        </span>
      )}
    </small>
  );
};

export default RefreshIndicator;
