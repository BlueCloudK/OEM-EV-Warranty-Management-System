import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    let mounted = true;

    const fetchAndNormalizeMe = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token || !API_BASE_URL) {
          // fallback mock
          const mock = {
            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            username: 'demo_user',
            email: 'demo@oem-ev.com',
            fullName: 'Nguyen Van A',
            phoneNumber: '+84901234567',
            role: 'CUSTOMER',
            enabled: true
          };
          localStorage.setItem('user', JSON.stringify(mock));
          if (mounted) setUser(mock);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          // try fallback validate endpoint if available
          try {
            const res2 = await fetch(`${API_BASE_URL}/api/auth/validate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (res2.ok) {
              const raw = await res2.json();
              console.log('✅ Validate API Response:', raw);
              const normalized = normalizeUser(raw);
              console.log('✅ Normalized User:', normalized);
              localStorage.setItem('user', JSON.stringify(normalized));
              if (mounted) setUser(normalized);
              return;
            }
          } catch (e) {
            console.error('Validate endpoint error:', e);
          }

          // final fallback: mock
          console.warn('API failed, using mock data');
          const mock = {
            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            username: 'demo_user',
            email: 'demo@oem-ev.com',
            fullName: 'Nguyen Van A',
            phoneNumber: '+84901234567',
            role: 'CUSTOMER',
            enabled: true
          };
          localStorage.setItem('user', JSON.stringify(mock));
          if (mounted) setUser(mock);
          return;
        }

        const raw = await res.json();
        console.log('✅ /api/me Response:', raw);
        
        const normalized = normalizeUser(raw);
        console.log('✅ Normalized User:', normalized);
        
        localStorage.setItem('user', JSON.stringify(normalized));
        if (mounted) setUser(normalized);
        
      } catch (error) {
        console.error('❌ Error fetching /api/me:', error);
        // fallback mock
        const mock = {
          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          username: 'demo_user',
          email: 'demo@oem-ev.com',
          fullName: 'Nguyen Van A',
          phoneNumber: '+84901234567',
          role: 'CUSTOMER',
          enabled: true
        };
        localStorage.setItem('user', JSON.stringify(mock));
        if (mounted) setUser(mock);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAndNormalizeMe();

    return () => { mounted = false; };
  }, [API_BASE_URL]);

  const normalizeUser = (raw) => {
    const normalized = {
      userId: raw.userId ?? raw.id ?? raw.uuid ?? null,
      username: raw.username ?? (raw.email ? raw.email.split('@')[0] : ''),
      email: raw.email ?? raw.emailAddress ?? '',
      fullName: raw.fullName ?? raw.name ?? raw.displayName ?? '',
      phoneNumber: raw.phoneNumber ?? raw.phone ?? raw.mobile ?? '',
      role: raw.role ?? raw.roleName ?? raw.roleType ?? '',
      enabled: raw.enabled ?? raw.active ?? true
    };
    
    console.log('📋 Normalization:', { raw, normalized });
    return normalized;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', color: '#667eea' }} />
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <p>⚠️ Không thể tải thông tin người dùng</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: 12, padding: '8px 16px', cursor: 'pointer' }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/customer/dashboard')} 
        style={{ 
          marginBottom: 12, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          padding: '8px 16px',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        <FaArrowLeft /> Quay lại
      </button>

      <div style={{ display: 'flex', gap: 20, background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ width: 140, textAlign: 'center' }}>
          <div style={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            background: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto',
            border: '3px solid #667eea'
          }}>
            <FaUserCircle style={{ fontSize: 48, color: '#667eea' }} />
          </div>
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: 16 }}>
            {user?.fullName || user?.username || 'N/A'}
          </div>
          <div style={{ 
            color: '#fff', 
            fontSize: 12, 
            background: '#667eea', 
            padding: '4px 12px', 
            borderRadius: 12, 
            marginTop: 8,
            display: 'inline-block'
          }}>
            {user?.role || 'N/A'}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0, marginBottom: 20, color: '#1f2937' }}>Thông tin tài khoản</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>User ID</strong>
              <div style={{ fontFamily: 'monospace', marginTop: 6, fontSize: 14, wordBreak: 'break-all' }}>
                {user?.userId || 'N/A'}
              </div>
            </div>
            
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>Username</strong>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {user?.username || 'N/A'}
              </div>
            </div>
            
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>Email</strong>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {user?.email || 'N/A'}
              </div>
            </div>
            
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>Phone</strong>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {user?.phoneNumber || 'N/A'}
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>Full Name</strong>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {user?.fullName || 'N/A'}
              </div>
            </div>
            
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <strong style={{ color: '#6b7280', fontSize: 13 }}>Status</strong>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                <span style={{ 
                  background: user?.enabled ? '#10b981' : '#ef4444', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: 4,
                  fontSize: 12
                }}>
                  {user?.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default CustomerProfile;