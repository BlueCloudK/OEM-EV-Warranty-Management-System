// ===========================================================================================
// VEHICLE MANAGEMENT COMPONENT FOR SC STAFF
// Quản lý thông tin xe điện cho Service Center Staff
// ===========================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar,        // Icon xe hơi
  FaEdit,       // Icon chỉnh sửa
  FaEye,        // Icon xem chi tiết
  FaSearch,     // Icon tìm kiếm
  FaArrowLeft,  // Icon quay lại
  FaSpinner,    // Icon loading
  FaCalendar,   // Icon lịch (năm)
  FaIdCard,     // Icon thẻ ID
  FaPalette,    // Icon màu
  FaCogs,       // Icon động cơ
  FaUser,       // Icon người dùng
  FaBarcode,    // Icon mã vạch (VIN)
  FaSave,       // Icon lưu
  FaTimes,      // Icon đóng
  FaTrash,      // Icon xóa
  FaClipboardCheck // Icon bảo hành
} from 'react-icons/fa';

// ===========================================================================================
// MAIN COMPONENT
// ===========================================================================================

const VehicleManagement = () => {
  const navigate = useNavigate();
  
  // ===========================================================================================
  // STATE MANAGEMENT
  // ===========================================================================================
  
  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general'); // general, vin, customer
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // View states
  const [activeView, setActiveView] = useState('list'); // list, detail
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ===========================================================================================
  // MOCK DATA - For fallback when API is not available
  // ===========================================================================================
  
  const mockVehicles = [
    {
      vehicleId: 1,
      vehicleName: "Tesla Model 3",
      vehicleModel: "Model 3 Standard Range",
      vehicleVin: "1HGBH41JXMN109186",
      vehicleYear: 2023,
      vehicleColor: "White",
      vehicleEngine: "Electric Motor",
      customerId: "123e4567-e89b-12d3-a456-426614174000",
      customerName: "Nguyễn Văn An"
    },
    {
      vehicleId: 2,
      vehicleName: "Tesla Model Y",
      vehicleModel: "Model Y Long Range",
      vehicleVin: "5YJ3E1EA4KF123456",
      vehicleYear: 2024,
      vehicleColor: "Blue",
      vehicleEngine: "Dual Motor AWD",
      customerId: "456e7890-e89b-12d3-a456-426614174001",
      customerName: "Trần Thị Bình"
    }
  ];

  // ===========================================================================================
  // EFFECTS
  // ===========================================================================================
  
  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, [currentPage, pageSize]);

  // ===========================================================================================
  // API FUNCTIONS
  // ===========================================================================================
  
  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // Debug logging
      console.group('🚗 Fetching Vehicles');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setVehicles(mockVehicles);
        setTotalElements(mockVehicles.length);
        setTotalPages(1);
        setLoading(false);
        console.groupEnd();
        return;
      }

      // Build URL based on search type
      let url = `${API_BASE_URL}/api/vehicles?page=${currentPage}&size=${pageSize}`;
      
      if (searchTerm) {
        if (searchType === 'vin') {
          url = `${API_BASE_URL}/api/vehicles/by-vin?vin=${encodeURIComponent(searchTerm)}`;
        } else if (searchType === 'customer') {
          url = `${API_BASE_URL}/api/vehicles/by-customer/${encodeURIComponent(searchTerm)}?page=${currentPage}&size=${pageSize}`;
        } else {
          url = `${API_BASE_URL}/api/vehicles?page=${currentPage}&size=${pageSize}&search=${encodeURIComponent(searchTerm)}`;
        }
      }

      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Handle different response types
        if (searchType === 'vin' && !Array.isArray(data)) {
          // Single vehicle response
          setVehicles([data]);
          setTotalElements(1);
          setTotalPages(1);
        } else if (data.content) {
          // Paginated response
          setVehicles(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          // Direct array response
          setVehicles(Array.isArray(data) ? data : [data]);
          setTotalElements(Array.isArray(data) ? data.length : 1);
          setTotalPages(1);
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        // Fallback to mock data
        setVehicles(mockVehicles);
        setTotalElements(mockVehicles.length);
        setTotalPages(1);
      }
      console.groupEnd();
    } catch (error) {
      console.error('Network Error:', error);
      // Fallback to mock data
      setVehicles(mockVehicles);
      setTotalElements(mockVehicles.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) return;
      
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.content || data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  // ===========================================================================================
  // CRUD OPERATIONS
  // ===========================================================================================

  // View vehicle detail
  const viewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveView('detail');
  };

  // Navigate to warranty claims with pre-filled vehicle info
  const createWarrantyClaim = (vehicle) => {
    // Prepare vehicle data to pass to warranty claims
    const vehicleData = {
      vehicleId: vehicle.vehicleId,
      vehicleName: vehicle.vehicleName,
      vehicleModel: vehicle.vehicleModel,
      vehicleVin: vehicle.vehicleVin,
      vehicleYear: vehicle.vehicleYear,
      vehicleColor: vehicle.vehicleColor,
      vehicleEngine: vehicle.vehicleEngine,
      customerId: vehicle.customerId,
      customerName: vehicle.customerName
    };
    
    // Navigate to warranty claims with vehicle data as state
    navigate('/scstaff/warranty-claims', { 
      state: { 
        prefilledVehicle: vehicleData,
        openCreateForm: true 
      } 
    });
  };

  // Close form and return to list
  const closeForm = () => {
    setActiveView('list');
    setSelectedVehicle(null);
  };

  // Delete vehicle (only for ADMIN/EVM_STAFF)
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchVehicles();
        alert('Xe đã được xóa thành công!');
      } else {
        const error = await response.json();
        alert(`Xóa xe thất bại: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Lỗi khi xóa xe. Vui lòng thử lại.');
    }
  };

  // ===========================================================================================
  // SEARCH HANDLERS
  // ===========================================================================================
  
  const handleSearch = () => {
    setCurrentPage(0);
    fetchVehicles();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('general');
    setCurrentPage(0);
    fetchVehicles();
  };

  // ===========================================================================================
  // RENDER
  // ===========================================================================================
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: 'auto' }}>
        
        {/* ===== HEADER SECTION ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: activeView === 'list' ? '20px' : '0' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Back button */}
              {activeView !== 'list' ? (
                <button
                  onClick={() => setActiveView('list')}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
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
              ) : (
                <button
                  onClick={() => navigate('/scstaff')}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaArrowLeft /> Dashboard
                </button>
              )}
              
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCar style={{ color: '#10b981' }} />
                  Quản lý Thông Tin Xe
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  {activeView === 'list' && 'Danh sách xe điện, quản lý thông tin và tạo yêu cầu bảo hành'}
                  {activeView === 'form' && 'Cập nhật thông tin xe'}
                  {activeView === 'detail' && 'Xem chi tiết thông tin xe và tạo yêu cầu bảo hành'}
                </p>
              </div>
            </div>
          </div>

          {/* ===== SEARCH SECTION ===== */}
          {activeView === 'list' && (
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
                <option value="general">Tìm chung</option>
                <option value="vin">Tìm theo VIN</option>
                <option value="customer">Tìm theo Customer ID</option>
              </select>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  searchType === 'vin' ? 'Nhập VIN...' :
                  searchType === 'customer' ? 'Nhập Customer ID...' :
                  'Tìm kiếm xe...'
                }
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  minWidth: '200px'
                }}
              />
              
              <button
                onClick={handleSearch}
                style={{
                  background: '#10b981',
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
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        {activeView === 'list' && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#10b981' }} />
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Vehicle List */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Tên xe</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Model</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>VIN</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Năm</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Khách hàng</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.vehicleId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>{vehicle.vehicleName}</td>
                          <td style={{ padding: '12px' }}>{vehicle.vehicleModel}</td>
                          <td style={{ padding: '12px', fontFamily: 'monospace' }}>{vehicle.vehicleVin}</td>
                          <td style={{ padding: '12px' }}>{vehicle.vehicleYear}</td>
                          <td style={{ padding: '12px' }}>{vehicle.customerName || vehicle.customerId}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                onClick={() => viewVehicleDetail(vehicle)}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                <FaEye /> Xem
                              </button>
                              <button
                                onClick={() => createWarrantyClaim(vehicle)}
                                style={{
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  transition: 'background-color 0.2s'
                                }}
                                title="Tạo yêu cầu bảo hành cho xe này"
                                onMouseOver={(e) => e.target.style.background = '#059669'}
                                onMouseOut={(e) => e.target.style.background = '#10b981'}
                              >
                                <FaClipboardCheck /> Bảo hành
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
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '20px' 
                  }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: currentPage === 0 ? '#f9fafb' : '#fff',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Trước
                    </button>
                    
                    <span style={{ padding: '8px 16px' }}>
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: currentPage === totalPages - 1 ? '#f9fafb' : '#fff',
                        cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== FORM VIEW ===== */}
        {activeView === 'form' && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Vehicle Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Tên xe *
                </label>
                <input
                  type="text"
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.vehicleName ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {formErrors.vehicleName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.vehicleName}
                  </p>
                )}
              </div>

              {/* Vehicle Model */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Model xe *
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.vehicleModel ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {formErrors.vehicleModel && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.vehicleModel}
                  </p>
                )}
              </div>

              {/* VIN */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  VIN  *
                </label>
                <input
                  type="text"
                  maxLength={17}
                  value={formData.vehicleVin}
                  onChange={(e) => setFormData({ ...formData, vehicleVin: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.vehicleVin ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
                {formErrors.vehicleVin && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.vehicleVin}
                  </p>
                )}
              </div>

              {/* Vehicle Year */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Năm sản xuất *
                </label>
                <input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.vehicleYear ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {formErrors.vehicleYear && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.vehicleYear}
                  </p>
                )}
              </div>

              {/* Vehicle Color */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Màu xe
                </label>
                <input
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Vehicle Engine */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Loại động cơ
                </label>
                <input
                  type="text"
                  value={formData.vehicleEngine}
                  onChange={(e) => setFormData({ ...formData, vehicleEngine: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Customer ID */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Customer ID *
                </label>
                {customers.length > 0 ? (
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: formErrors.customerId ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.customerId} value={customer.customerId}>
                        {customer.name} ({customer.customerId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    placeholder="Nhập Customer ID"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: formErrors.customerId ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                )}
                {formErrors.customerId && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.customerId}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              marginTop: '24px' 
            }}>
              <button
                onClick={closeForm}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaTimes /> Hủy
              </button>
              <button
                onClick={handleSubmitVehicle}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaSave /> Cập nhật
              </button>
            </div>
          </div>
        )}

        {/* ===== DETAIL VIEW ===== */}
        {activeView === 'detail' && selectedVehicle && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Thông tin cơ bản</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Tên xe:</strong> {selectedVehicle.vehicleName}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Model:</strong> {selectedVehicle.vehicleModel}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>VIN:</strong> <code>{selectedVehicle.vehicleVin}</code>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Năm sản xuất:</strong> {selectedVehicle.vehicleYear}
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Thông tin bổ sung</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Màu xe:</strong> {selectedVehicle.vehicleColor || 'Chưa có thông tin'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Loại động cơ:</strong> {selectedVehicle.vehicleEngine || 'Chưa có thông tin'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Customer ID:</strong> <code>{selectedVehicle.customerId}</code>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Tên khách hàng:</strong> {selectedVehicle.customerName || 'Chưa có thông tin'}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openEditForm(selectedVehicle)}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                <FaEdit /> Chỉnh sửa
              </button>
              <button
                onClick={() => createWarrantyClaim(selectedVehicle)}
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
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                title="Tạo yêu cầu bảo hành cho xe này"
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                <FaClipboardCheck /> Tạo yêu cầu bảo hành
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;
