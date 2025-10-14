import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaSearch,
  FaUserPlus,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendar,
  FaSpinner
} from 'react-icons/fa';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // name, email, phone
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    userId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock data for demo
  const mockCustomers = [
    {
      customerId: "123e4567-e89b-12d3-a456-426614174000",
      name: "Nguyễn Văn An",
      email: "nguyen.van.an@email.com",
      phone: "+84901234567",
      address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      createdAt: "2024-01-15T10:30:00.000+00:00",
      userId: 5,
      username: "nguyen_van_an"
    },
    {
      customerId: "456e7890-e89b-12d3-a456-426614174001",
      name: "Trần Thị Bình",
      email: "tran.thi.binh@email.com",
      phone: "+84901234568",
      address: "456 Đường Lê Lợi, Quận 3, TP.HCM",
      createdAt: "2024-02-10T09:15:00.000+00:00",
      userId: 6,
      username: "tran_thi_binh"
    },
    {
      customerId: "789e1234-e89b-12d3-a456-426614174002",
      name: "Lê Văn Cường",
      email: "le.van.cuong@email.com",
      phone: "+84901234569",
      address: "789 Đường Pasteur, Quận 1, TP.HCM",
      createdAt: "2024-03-05T14:20:00.000+00:00",
      userId: 7,
      username: "le_van_cuong"
    }
  ];

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setCustomers(mockCustomers);
        setTotalElements(mockCustomers.length);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      let url = `${API_BASE_URL}/api/customers?page=${currentPage}&size=${pageSize}`;
      
      if (searchTerm) {
        if (searchType === 'name') {
          url = `${API_BASE_URL}/api/customers/search?name=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=${pageSize}`;
        } else if (searchType === 'email') {
          url = `${API_BASE_URL}/api/customers/by-email?email=${encodeURIComponent(searchTerm)}`;
        } else if (searchType === 'phone') {
          url = `${API_BASE_URL}/api/customers/by-phone?phone=${encodeURIComponent(searchTerm)}`;
        }
      }

      console.log('🔍 Fetching customers from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Customers fetched:', data);
        
        if (searchType === 'email' || searchType === 'phone') {
          // Single customer response
          setCustomers([data]);
          setTotalElements(1);
          setTotalPages(1);
        } else {
          // Paginated response
          setCustomers(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        console.error('Failed to fetch customers:', response.status);
        // Use mock data as fallback
        setCustomers(mockCustomers);
        setTotalElements(mockCustomers.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use mock data as fallback
      setCustomers(mockCustomers);
      setTotalElements(mockCustomers.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchCustomers();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCustomer = await response.json();
        console.log('✅ Customer created:', newCustomer);
        
        // Add to local state
        setCustomers(prev => [newCustomer, ...prev]);
        setTotalElements(prev => prev + 1);
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', address: '', userId: '' });
        setShowCreateForm(false);
        
        alert('Khách hàng đã được tạo thành công!');
      } else {
        const error = await response.json();
        alert(`Tạo khách hàng thất bại: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Lỗi khi tạo khách hàng. Vui lòng thử lại.');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên khách hàng là bắt buộc';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(\+84|0)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }
    
    return errors;
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      userId: customer.userId
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCustomers(prev => prev.filter(c => c.customerId !== customerId));
        setTotalElements(prev => prev - 1);
        alert('Khách hàng đã được xóa thành công!');
      } else {
        alert('Xóa khách hàng thất bại!');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Lỗi khi xóa khách hàng.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: 'auto' }}>
        {/* Header */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/scstaff/dashboard')}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaArrowLeft /> Quay lại
              </button>
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaUsers style={{ color: '#3b82f6' }} />
                  Quản lý Profile Khách hàng
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  Quản lý thông tin khách hàng của trung tâm dịch vụ
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setSelectedCustomer(null);
                setFormData({ name: '', email: '', phone: '', address: '', userId: '' });
              }}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <FaUserPlus /> Tạo khách hàng mới
            </button>
          </div>

          {/* Search Section */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white'
              }}
            >
              <option value="name">Tìm theo tên</option>
              <option value="email">Tìm theo email</option>
              <option value="phone">Tìm theo SĐT</option>
            </select>
            <input
              type="text"
              placeholder={`Nhập ${searchType === 'name' ? 'tên khách hàng' : searchType === 'email' ? 'email' : 'số điện thoại'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                minWidth: '250px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSearch /> Tìm kiếm
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span>Tổng số khách hàng: <strong>{totalElements}</strong></span>
            <span>Trang {currentPage + 1} / {totalPages}</span>
          </div>
        </div>

        {/* Customer List */}
        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <FaSpinner style={{ fontSize: '24px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', color: '#6b7280' }}>Đang tải danh sách khách hàng...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <FaUsers style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>Không tìm thấy khách hàng</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              {searchTerm ? 'Không có khách hàng nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có khách hàng nào trong hệ thống.'}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaUserPlus /> Tạo khách hàng đầu tiên
            </button>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Thông tin khách hàng
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Liên hệ
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Địa chỉ
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Ngày tạo
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr 
                      key={customer.customerId} 
                      style={{ 
                        borderBottom: index < customers.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { background: '#f9fafb' }
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                            {customer.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            ID: {customer.customerId?.substring(0, 8)}...
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            User ID: {customer.userId} ({customer.username})
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            <FaEnvelope style={{ color: '#6b7280', fontSize: '12px' }} />
                            {customer.email}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            <FaPhone style={{ color: '#6b7280', fontSize: '12px' }} />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '14px' }}>
                          <FaMapMarkerAlt style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }} />
                          <span style={{ lineHeight: '1.4' }}>{customer.address}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                          <FaCalendar style={{ fontSize: '12px' }} />
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(customer)}
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.customerId)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} khách hàng
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: currentPage === 0 ? '#f9fafb' : 'white',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trước
                  </button>
                  <span style={{ padding: '6px 12px', color: '#374151' }}>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: currentPage >= totalPages - 1 ? '#f9fafb' : 'white',
                      cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
                {selectedCustomer ? 'Chỉnh sửa khách hàng' : 'Tạo khách hàng mới'}
              </h2>
              
              <form onSubmit={handleCreateCustomer}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: formErrors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập tên khách hàng"
                  />
                  {formErrors.name && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: formErrors.email ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập email"
                  />
                  {formErrors.email && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: formErrors.phone ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập số điện thoại (+84...)"
                  />
                  {formErrors.phone && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Địa chỉ *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: formErrors.address ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                  {formErrors.address && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    User ID (tùy chọn)
                  </label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập User ID liên kết"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedCustomer(null);
                      setFormData({ name: '', email: '', phone: '', address: '', userId: '' });
                      setFormErrors({});
                    }}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#10b981',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {selectedCustomer ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;