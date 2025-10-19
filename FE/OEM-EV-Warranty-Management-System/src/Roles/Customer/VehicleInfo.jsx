import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendar,
  FaIdCard,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaEye,
  FaShieldAlt,
  FaUser,
  FaCar
} from 'react-icons/fa';

const VehicleInfo = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  });

  useEffect(() => {
    fetchMyVehicles();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') navigate('/customer/dashboard');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Normalize response: accept array, page object with content, or single object
  const normalizeVehicles = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    // Single object -> wrap
    if (data.vehicleId || data.vehicleVin) return [data];
    return [];
  };

  const fetchMyVehicles = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      console.group('🚗 Fetching My Vehicles');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);

      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setMockVehicles();
        console.groupEnd();
        return;
      }

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));

      const res = await fetch(`${API_BASE_URL}/api/vehicles/my-vehicles?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('API Error:', res.status, text);
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Vehicle payload:', data);

      const list = normalizeVehicles(data);
      setVehicles(list);

      // If paged response, populate pagination
      if (data && typeof data === 'object' && Array.isArray(data.content)) {
        setPagination({
          pageNumber: data.pageNumber ?? 0,
          pageSize: data.pageSize ?? size,
          totalElements: data.totalElements ?? list.length,
          totalPages: data.totalPages ?? 1,
          first: data.first ?? true,
          last: data.last ?? true
        });
      } else {
        // single page
        setPagination({ pageNumber: 0, pageSize: list.length, totalElements: list.length, totalPages: 1, first: true, last: true });
      }

      console.groupEnd();
    } catch (err) {
      console.error('❌ Error fetching vehicles:', err);
      setMockVehicles();
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Mock response matching user's sample
  const setMockVehicles = () => {
    const mock = {
      content: [
        {
          vehicleId: 0,
          vehicleName: 'string',
          vehicleModel: 'string',
          vehicleYear: 0,
          vehicleVin: 'string',
          customerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          customerName: 'Le Minh Khoi'
        }
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true
    };
    setVehicles(mock.content);
    setPagination({
      pageNumber: mock.pageNumber,
      pageSize: mock.pageSize,
      totalElements: mock.totalElements,
      totalPages: mock.totalPages,
      first: mock.first,
      last: mock.last
    });
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return '-'; }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) fetchMyVehicles(newPage, pagination.pageSize);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '3rem', color: '#f5576c', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Đang tải danh sách xe của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: 'linear-gradient(120deg,#fdfbfb,#ebedee)' }}>
      <style>{`
        @keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        .container { max-width:1200px;margin:0 auto }
        .header { display:flex;align-items:center;gap:16px;margin-bottom:18px }
        .card-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px }
        .vehicle-card { background:#fff;border-radius:12px;padding:18px;box-shadow:0 8px 20px rgba(16,24,40,0.06);transition:transform .18s,box-shadow .18s }
        .vehicle-card:hover{ transform:translateY(-6px); box-shadow:0 18px 40px rgba(16,24,40,0.08) }
        .meta { display:flex;align-items:center;gap:12px }
        .vin { font-family:monospace;background:#f3f4f6;padding:6px 8px;border-radius:8px }
        .empty { text-align:center;padding:40px;background:#fff;border-radius:12px }
      `}</style>

      <div className="container">
        <div className="header">
          <button onClick={() => navigate('/customer/dashboard')} style={{ border: 'none', background: '#fff', padding: 10, borderRadius: 10, cursor: 'pointer' }} title="Quay lại">
            <FaArrowLeft />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}><FaCar style={{ marginRight: 8, color: '#ef4444' }} />Xe của tôi</h2>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty">
            <p style={{ fontSize: 42 }}>🚗</p>
            <h3>Chưa có xe nào</h3>
            <p style={{ color: '#64748b' }}>Bạn chưa đăng ký xe nào trong hệ thống.</p>
            <button onClick={() => navigate('/customer/register-vehicle')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}>
              <FaPlus /> Đăng ký xe mới
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {vehicles.map((v, idx) => (
              <div key={v.vehicleId ?? idx} className="vehicle-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaCar style={{ color: '#ef4444', fontSize: 22 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 120 }}>Chủ sở hữu:</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.customerName || 'Không xác định'}</div>
                    </div>

                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 120 }}>Tên xe:</div>
                      <div style={{ fontWeight: 700 }}>{v.vehicleName || 'Không xác định'}</div>
                    </div>

                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 120 }}>Model:</div>
                      <div style={{ fontWeight: 600 }}>{v.vehicleModel || '-'}</div>
                    </div>

                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 120 }}>Năm:</div>
                      <div style={{ fontWeight: 600 }}>{v.vehicleYear ?? 'N/A'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 120 }}>Mã VIN:</div>
                      <div className="vin" style={{ marginTop: 0 }}>{v.vehicleVin || 'Không có'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => navigate(`/customer/vehicle/${v.vehicleId}/details`)} style={{ border: 'none', background: '#eef2ff', color: '#4338ca', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    <FaEye />
                  </button>
                  <button onClick={() => navigate(`/customer/vehicle/${v.vehicleId}/warranty`)} style={{ border: 'none', background: '#fff', color: '#ef4444', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid #fee2e2' }}>
                    <FaShieldAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: pagination.first ? '#f1f5f9' : '#fff' }}>← Trước</button>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fff' }}>{pagination.pageNumber + 1} / {pagination.totalPages}</div>
            <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: pagination.last ? '#f1f5f9' : '#fff' }}>Sau →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleInfo;
