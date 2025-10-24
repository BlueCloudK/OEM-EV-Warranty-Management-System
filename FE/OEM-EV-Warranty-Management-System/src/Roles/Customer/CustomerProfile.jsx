import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSpinner, FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', email: '', phoneNumber: '', address: '' });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // ✅ Chuẩn hóa dữ liệu từ bất kỳ API nào
  const normalizeUser = (raw) => {
    if (!raw) return {};

    // unwrap nếu có { user: {...} }
    const data = raw?.user ? raw.user : raw;

    // /api/profile (CUSTOMER)
    if (data.customerId || data.customerEmail) {
      return {
        userId: data.userId ?? data.customerId ?? null,
        username: data.username ?? '',
        email: data.customerEmail ?? '',
        fullName: data.customerName ?? '',
        phoneNumber: data.customerPhone ?? '',
        address: data.address ?? '',
        role: 'CUSTOMER',
        enabled: true
      };
    }

    // /api/me (GENERAL)
    return {
      userId: data.userId ?? data.id ?? null,
      username: data.username ?? (data.email ? data.email.split('@')[0] : ''),
      email: data.email ?? '',
      fullName: data.fullName ?? '',
      phoneNumber: data.phoneNumber ?? '',
      role:
        data.role ??
        (data.hasCustomerRole
          ? 'CUSTOMER'
          : data.hasAdminRole
          ? 'ADMIN'
          : data.hasStaffRole
          ? 'STAFF'
          : ''),
      enabled: data.enabled ?? data.active ?? true
    };
  };

  // ✅ Gọi API để lấy user + profile
  const fetchAndNormalizeMe = async (mounted = true) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Không tìm thấy token');
        return;
      }

      setLoading(true);

      // Gọi /api/me
      const resMe = await fetch(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resMe.ok) {
        console.warn('⚠️ /api/me lỗi:', resMe.status);
        return;
      }

      const meData = await resMe.json();
      console.log('✅ /api/me Response:', meData);

      let normalized = normalizeUser(meData);

      // Nếu là CUSTOMER thì gọi thêm /api/profile
      if (normalized.role === 'CUSTOMER' || meData.hasCustomerRole) {
        try {
          const resProfile = await fetch(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (resProfile.ok) {
            const profileData = await resProfile.json();
            console.log('✅ /api/profile Response:', profileData);

            const profileNormalized = normalizeUser(profileData);

            // Gộp dữ liệu
            normalized = { ...normalized, ...profileNormalized };
          } else {
            console.warn('⚠️ Không thể lấy /api/profile');
          }
        } catch (err) {
          console.error('❌ Lỗi khi gọi /api/profile:', err);
        }
      }

      console.log('✅ Final Normalized User:', normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
      if (mounted) setUser(normalized);
    } catch (error) {
      console.error('🔥 Lỗi khi fetch user:', error);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchAndNormalizeMe(mounted);
    return () => (mounted = false);
  }, [API_BASE_URL]);

  // Start editing - populate editData from current user
  const startEdit = () => {
    setEditData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({ fullName: '', email: '', phoneNumber: '', address: '' });
  };

  const validateEdit = (data) => {
    const errors = {};
    if (!data.fullName || data.fullName.trim().length < 2) errors.fullName = 'Họ tên ít nhất 2 ký tự';
    if (!data.email || !data.email.includes('@')) errors.email = 'Email không hợp lệ';
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateEdit(editData);
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join('\n'));
      return;
    }

    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      if (!token || !API_BASE_URL) {
        // Fallback: update localStorage and state
        const patched = { ...user, ...editData };
        localStorage.setItem('user', JSON.stringify(patched));
        setUser(patched);
        setEditing(false);
        alert('Cập nhật hồ sơ (mock) thành công');
        return;
      }

      const payload = {
        fullName: editData.fullName,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
        address: editData.address
      };

      console.debug('PUT payload ->', payload);
      console.debug('PUT url ->', `${API_BASE_URL}/api/customers/profile`);
      const res = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Try to parse body for better error info
        let bodyText = '';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await res.json();
            bodyText = JSON.stringify(j);
          } else {
            bodyText = await res.text();
          }
        } catch (parseErr) {
          console.warn('Could not parse error body', parseErr);
        }

        // Special handling for 403 to give actionable advice
        if (res.status === 403) {
          console.error('Forbidden (403) when calling PUT /api/customers/profile', { status: res.status, body: bodyText });
          alert('Lỗi 403: Không có quyền cập nhật hồ sơ. Vui lòng kiểm tra quyền hoặc đăng nhập lại.');
          // Optionally suggest re-login
          return;
        }

        const errText = `Status ${res.status}${bodyText ? ` - ${bodyText}` : ''}`;
        throw new Error(errText);
      }

      const updated = await res.json();
      const normalized = normalizeUser(updated);
      localStorage.setItem('user', JSON.stringify(normalized));
      setUser(normalized);
      setEditing(false);
      alert('Cập nhật hồ sơ thành công');
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      alert('Không thể cập nhật hồ sơ: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Giao diện loading
  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <FaSpinner
            style={{
              fontSize: '3rem',
              animation: 'spin 1s linear infinite',
              color: '#667eea'
            }}
          />
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // ✅ Nếu không có dữ liệu
  if (!user) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
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

  // ✅ Giao diện hiển thị
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

      <div
        style={{
          display: 'flex',
          gap: 20,
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {/* Avatar */}
        <div style={{ width: 140, textAlign: 'center' }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              border: '3px solid #667eea'
            }}
          >
            <FaUserCircle style={{ fontSize: 48, color: '#667eea' }} />
          </div>
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: 16 }}>
            {user?.fullName || user?.username || 'N/A'}
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: 12,
              background: '#667eea',
              padding: '4px 12px',
              borderRadius: 12,
              marginTop: 8,
              display: 'inline-block'
            }}
          >
            {user?.role || 'N/A'}
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ marginTop: 0, marginBottom: 0, color: '#1f2937' }}>Thông tin tài khoản</h2>
            <div>
              {!editing ? (
                <button
                  onClick={startEdit}
                  style={{ padding: '8px 12px', borderRadius: 8, background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <FaEdit style={{ marginRight: 8 }} /> Chỉnh sửa
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{ padding: '8px 12px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <FaSave /> Lưu
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{ padding: '8px 12px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <FaTimes /> Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}
          >
            <InfoBox label="User ID" value={user.userId} mono />
            <InfoBox label="Username" value={user.username} />

            {/* Editable fields when editing, otherwise readonly InfoBox */}
            {editing ? (
              <>
                <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                  <strong style={{ color: '#6b7280', fontSize: 13 }}>Email</strong>
                  <input
                    value={editData.email}
                    onChange={(e) => setEditData(d => ({ ...d, email: e.target.value }))}
                    style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>

                <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                  <strong style={{ color: '#6b7280', fontSize: 13 }}>Phone</strong>
                  <input
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData(d => ({ ...d, phoneNumber: e.target.value }))}
                    style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                  <strong style={{ color: '#6b7280', fontSize: 13 }}>Full Name</strong>
                  <input
                    value={editData.fullName}
                    onChange={(e) => setEditData(d => ({ ...d, fullName: e.target.value }))}
                    style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                  <strong style={{ color: '#6b7280', fontSize: 13 }}>Address</strong>
                  <input
                    value={editData.address}
                    onChange={(e) => setEditData(d => ({ ...d, address: e.target.value }))}
                    style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
              </>
            ) : (
              <>
                <InfoBox label="Email" value={user.email} />
                <InfoBox label="Phone" value={user.phoneNumber} />
                <InfoBox label="Full Name" value={user.fullName} full />
                {user.address && <InfoBox label="Address" value={user.address} full />}
              </>
            )}

            <InfoBox
              label="Status"
              value={
                <span
                  style={{
                    background: user.enabled ? '#10b981' : '#ef4444',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}
                >
                  {user.enabled ? 'Active' : 'Inactive'}
                </span>
              }
            />
          </div>
        </div>
      </div>

      <style>
        {`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}
      </style>
    </div>
  );
};

// ✅ Component nhỏ hiển thị 1 ô thông tin
const InfoBox = ({ label, value, full = false, mono = false }) => (
  <div
    style={{
      gridColumn: full ? '1 / -1' : undefined,
      padding: 12,
      background: '#f9fafb',
      borderRadius: 8
    }}
  >
    <strong style={{ color: '#6b7280', fontSize: 13 }}>{label}</strong>
    <div
      style={{
        marginTop: 6,
        fontSize: 14,
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all'
      }}
    >
      {value || 'N/A'}
    </div>
  </div>
);

export default CustomerProfile;
