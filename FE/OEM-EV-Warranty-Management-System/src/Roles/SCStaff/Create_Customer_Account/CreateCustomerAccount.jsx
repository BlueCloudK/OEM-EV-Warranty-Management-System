import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaArrowLeft } from "react-icons/fa";

export default function CreateCustomerAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    address: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password || "string",
      address: form.address,
      name: form.name,
      phone: form.phone
    };

    try {
      // If we don't have an API base or token, fall back to a mock response so dev flow continues
      if (!API_BASE || !token) {
        // Mock success
        await new Promise(r => setTimeout(r, 600));
        const mock = {
          userId: `mock-${Date.now()}`,
          username: payload.username || `user-${Math.random().toString(36).slice(2,8)}`,
          email: payload.email,
          name: payload.name,
          phone: payload.phone
        };
        setMessage({ type: 'success', text: `Khách hàng tạo thành công (mock): ${mock.userId}` });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/staff/register-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Server returned ${res.status}`);
      }

      const j = await res.json();
      setMessage({ type: 'success', text: `Khách hàng tạo thành công: ${j.userId || j.id || j.username || ''}` });
      setLoading(false);
      // Optionally navigate to customer details or list
      // navigate('/scstaff/customers');
    } catch (err) {
      console.error('Failed to register customer', err);
      setMessage({ type: 'error', text: err?.message || 'Lỗi khi tạo khách hàng' });
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', background: '#fff', padding: 50, borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.08)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => navigate('/scstaff/')} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginRight: 8 }}>
            <FaArrowLeft /> Quay lại
          </button>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FaUserPlus />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Tạo tài khoản và Profile khách hàng</h2>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Tạo tài khoản mới cho khách hàng bởi nhân viên trung tâm dịch vụ.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input value={form.username} onChange={e => updateField('username', e.target.value)} placeholder="Username" required style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" type="email" required style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Password (optional)" type="password" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Phone" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Full name" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Address" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button disabled={loading} type="submit" style={{ background: '#3b82f6', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              {loading ? 'Đang tạo...' : 'Tạo khách hàng'}
            </button>
            <button type="button" onClick={() => navigate('/scstaff/')} style={{ background: '#efefef', color: '#111827', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Hủy</button>
            {message && (
              <div style={{ marginLeft: 8, color: message.type === 'error' ? '#ef4444' : '#059669' }}>{message.text}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
