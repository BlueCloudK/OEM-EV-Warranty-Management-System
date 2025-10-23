import React, { useState, useEffect } from 'react';

// Simple icon components as replacements
const SpinnerIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
  </svg>
);

const ClipboardLargeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3 }}>
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
  </svg>
);

const ServiceHistories = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyServices(page, size);
  }, [page, size]);

  const fetchMyServices = async (p = 0, s = 10) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      if (!token || !API_BASE_URL) {
        // fallback mock
        const mock = {
          content: [
            {
              serviceHistoryId: 1,
              serviceDate: new Date().toISOString(),
              serviceType: 'Maintenance',
              description: 'Thay dầu, kiểm tra hệ thống điện',
              partId: 'P-001',
              partName: 'Battery Connector',
              vehicleId: 5,
              vehicleName: 'Tesla Model 3',
              vehicleVin: 'VIN123456'
            }
          ],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true
        };
        setItems(mock.content);
        setTotalPages(mock.totalPages);
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/service-histories/my-services?page=${p}&size=${s}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      console.error('Error fetching service histories:', err);
      setError(err.message || 'Error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeColor = (type) => {
    const colors = {
      'Maintenance': '#3b82f6',
      'Repair': '#ef4444',
      'Inspection': '#10b981',
      'Upgrade': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const handleNavigateBack = () => {
    window.history.back();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <button 
            onClick={handleNavigateBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: '#f97316',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fff7ed';
              e.target.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeftIcon /> Quay lại
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardIcon />
            <h2 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Lịch sử dịch vụ
            </h2>
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          minHeight: '400px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              gap: '16px'
            }}>
              <SpinnerIcon />
              <div style={{ color: '#6b7280', fontSize: '16px' }}>Đang tải dữ liệu...</div>
            </div>
          ) : error ? (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '20px',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Đã xảy ra lỗi</div>
                <div>{error}</div>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af'
            }}>
              <ClipboardLargeIcon />
              <div style={{ fontSize: '18px', fontWeight: '500', marginTop: '16px' }}>Không có lịch sử dịch vụ</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>Các dịch vụ của bạn sẽ hiển thị tại đây</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px' }}>
                {items.map((it, idx) => (
                  <div
                    key={it.serviceHistoryId}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      animation: `slideIn 0.4s ease ${idx * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#f97316';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                      {/* Left Section */}
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            background: getServiceTypeColor(it.serviceType),
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <WrenchIcon />
                            {it.serviceType}
                          </div>
                        </div>
                        
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}>
                          {it.partName || it.partId}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#6b7280',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}>
                          <CalendarIcon />
                          {new Date(it.serviceDate).toLocaleString('vi-VN')}
                        </div>
                        
                        <div style={{
                          color: '#4b5563',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          background: '#f9fafb',
                          padding: '12px',
                          borderRadius: '8px',
                          borderLeft: '3px solid ' + getServiceTypeColor(it.serviceType)
                        }}>
                          {it.description}
                        </div>
                      </div>

                      {/* Right Section */}
                      <div style={{
                        flex: '0 0 auto',
                        minWidth: '200px',
                        background: 'linear-gradient(135deg, #fbbf2415 0%, #f9731615 100%)',
                        padding: '16px',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#f97316',
                          fontWeight: '600',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          <CarIcon />
                          Thông tin xe
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {it.vehicleName}
                        </div>
                        <div style={{
                          fontFamily: 'Monaco, Courier, monospace',
                          fontSize: '13px',
                          color: '#6b7280',
                          background: '#ffffff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {it.vehicleVin}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page <= 0}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: page <= 0 ? '#f3f4f6' : '#f97316',
                      color: page <= 0 ? '#9ca3af' : 'white',
                      fontWeight: '600',
                      cursor: page <= 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (page > 0) {
                        e.target.style.background = '#ea580c';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page > 0) {
                        e.target.style.background = '#f97316';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    Trang trước
                  </button>
                  
                  <div style={{
                    padding: '10px 20px',
                    background: '#fff7ed',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: '#1f2937',
                    border: '1px solid #fed7aa'
                  }}>
                    Trang {page + 1} / {totalPages}
                  </div>
                  
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: page >= totalPages - 1 ? '#f3f4f6' : '#f97316',
                      color: page >= totalPages - 1 ? '#9ca3af' : 'white',
                      fontWeight: '600',
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (page < totalPages - 1) {
                        e.target.style.background = '#ea580c';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page < totalPages - 1) {
                        e.target.style.background = '#f97316';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceHistories;