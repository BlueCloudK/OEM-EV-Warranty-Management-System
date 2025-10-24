// ===========================================================================================
// SERVICE HISTORY MANAGEMENT COMPONENT FOR SC STAFF
// Quản lý lịch sử dịch vụ cho Service Center Staff
// SC STAFF PERMISSIONS: Create, Read, Update service histories (NO DELETE - ADMIN only)
// Can access: GET all, GET by ID, POST create, PUT update, GET by vehicle, GET by part, GET by date range
// ===========================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHistory,         // Icon lịch sử
  FaPlus,           // Icon thêm
  FaEye,            // Icon xem chi tiết
  FaEdit,           // Icon chỉnh sửa
  FaSearch,         // Icon tìm kiếm
  FaArrowLeft,      // Icon quay lại
  FaSpinner,        // Icon loading
  FaCalendar,       // Icon lịch
  FaCar,            // Icon xe
  FaTools,          // Icon công cụ/linh kiện
  FaUser,           // Icon người dùng
  FaCheck,          // Icon hoàn thành
  FaTimes,          // Icon đóng/từ chối
  FaClock,          // Icon thời gian
  FaWrench,         // Icon sửa chữa
  FaSave,           // Icon lưu
  FaInfo,           // Icon thông tin
  FaFilter,         // Icon lọc
  FaDownload,       // Icon tải xuống
  FaListAlt,        // Icon danh sách
  FaExchangeAlt     // Icon thay thế
} from 'react-icons/fa';

// ===========================================================================================
// MAIN COMPONENT
// ===========================================================================================

const ServiceHistoryManagement = () => {
  const navigate = useNavigate();
  
  // ===========================================================================================
  // STATE MANAGEMENT
  // ===========================================================================================
  
  // Data states
  const [serviceHistories, setServiceHistories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterPart, setFilterPart] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // View states
  const [activeView, setActiveView] = useState('list'); // list, create, edit, detail
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    serviceDate: '',
    serviceType: '',
    description: '',
    partId: '',
    vehicleId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // ===========================================================================================
  // MOCK DATA - For fallback when API is not available
  // ===========================================================================================
  
  const mockServiceHistories = [
    {
      serviceHistoryId: 1,
      serviceDate: "2024-10-15T10:30:00.000+00:00",
      serviceType: "REPLACEMENT",
      description: "Thay thế pin xe do sụt dung lượng",
      partId: "PART-BAT-001",
      partName: "Battery Pack",
      vehicleId: 1,
      vehicleName: "Tesla Model 3",
      vehicleVin: "92-MĐ-852.50"
    },
    {
      serviceHistoryId: 2,
      serviceDate: "2024-10-14T14:20:00.000+00:00",
      serviceType: "REPAIR",
      description: "Sửa chữa hệ thống sạc bị lỗi",
      partId: "PART-CHG-001",
      partName: "Charging System",
      vehicleId: 2,
      vehicleName: "Tesla Model Y",
      vehicleVin: "30-A1-456.87"
    },
    {
      serviceHistoryId: 3,
      serviceDate: "2024-10-13T09:15:00.000+00:00",
      serviceType: "MAINTENANCE",
      description: "Bảo dưỡng định kỳ motor điện",
      partId: "PART-MOT-001",
      partName: "Electric Motor",
      vehicleId: 1,
      vehicleName: "Tesla Model 3",
      vehicleVin: "92-MĐ-852.50"
    },
    {
      serviceHistoryId: 4,
      serviceDate: "2024-10-12T16:45:00.000+00:00",
      serviceType: "INSPECTION",
      description: "Kiểm tra hệ thống an toàn phanh",
      partId: "PART-BRK-001",
      partName: "Brake System",
      vehicleId: 3,
      vehicleName: "VinFast VF8",
      vehicleVin: "51-B1-789.12"
    }
  ];

  const mockVehicles = [
    { vehicleId: 1, vehicleName: "Tesla Model 3", vehicleVin: "92-MĐ-852.50" },
    { vehicleId: 2, vehicleName: "Tesla Model Y", vehicleVin: "30-A1-456.87" },
    { vehicleId: 3, vehicleName: "VinFast VF8", vehicleVin: "51-B1-789.12" }
  ];

  const mockParts = [
    { partId: "PART-BAT-001", partName: "Battery Pack", category: "Power System" },
    { partId: "PART-CHG-001", partName: "Charging System", category: "Power System" },
    { partId: "PART-MOT-001", partName: "Electric Motor", category: "Drive System" },
    { partId: "PART-BRK-001", partName: "Brake System", category: "Safety System" },
    { partId: "PART-DSP-001", partName: "Display Screen", category: "Electronics" }
  ];

  const serviceTypes = [
    { value: 'REPAIR', label: 'Sửa chữa', color: '#f59e0b', icon: <FaWrench /> },
    { value: 'REPLACEMENT', label: 'Thay thế', color: '#ef4444', icon: <FaExchangeAlt /> },
    { value: 'MAINTENANCE', label: 'Bảo dưỡng', color: '#10b981', icon: <FaTools /> },
    { value: 'INSPECTION', label: 'Kiểm tra', color: '#3b82f6', icon: <FaEye /> }
  ];

  // ===========================================================================================
  // EFFECTS
  // ===========================================================================================
  
  useEffect(() => {
    fetchServiceHistories();
    fetchVehicles();
    fetchParts();
  }, [currentPage, pageSize]);

  // ===========================================================================================
  // API FUNCTIONS - ONLY SC STAFF PERMITTED ENDPOINTS
  // ===========================================================================================
  
  // Fetch service histories from API (SC Staff can access all)
  const fetchServiceHistories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      console.group('📋 SC Staff: Fetching Service Histories');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setServiceHistories(mockServiceHistories);
        setTotalElements(mockServiceHistories.length);
        setTotalPages(1);
        setLoading(false);
        console.groupEnd();
        return;
      }

      let url = `${API_BASE_URL}/api/service-histories?page=${currentPage}&size=${pageSize}`;
      
      // Add search parameter if provided
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
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
        
        if (data.content) {
          setServiceHistories(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          setServiceHistories(Array.isArray(data) ? data : []);
          setTotalElements(Array.isArray(data) ? data.length : 0);
          setTotalPages(1);
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        // Fallback to mock data
        setServiceHistories(mockServiceHistories);
        setTotalElements(mockServiceHistories.length);
        setTotalPages(1);
      }
      console.groupEnd();
    } catch (error) {
      console.error('Network Error:', error);
      // Fallback to mock data
      setServiceHistories(mockServiceHistories);
      setTotalElements(mockServiceHistories.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service histories by vehicle ID
  const fetchServiceHistoriesByVehicle = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        return mockServiceHistories.filter(h => h.vehicleId === parseInt(vehicleId));
      }
      
      const response = await fetch(`${API_BASE_URL}/api/service-histories/by-vehicle/${vehicleId}?page=${currentPage}&size=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        return data.content || data || [];
      } else {
        return mockServiceHistories.filter(h => h.vehicleId === parseInt(vehicleId));
      }
    } catch (error) {
      console.error('Error fetching service histories by vehicle:', error);
      return mockServiceHistories.filter(h => h.vehicleId === parseInt(vehicleId));
    }
  };

  // Fetch service histories by part ID
  const fetchServiceHistoriesByPart = async (partId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        return mockServiceHistories.filter(h => h.partId === partId);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/service-histories/by-part/${partId}?page=${currentPage}&size=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        return data.content || data || [];
      } else {
        return mockServiceHistories.filter(h => h.partId === partId);
      }
    } catch (error) {
      console.error('Error fetching service histories by part:', error);
      return mockServiceHistories.filter(h => h.partId === partId);
    }
  };

  // Fetch service histories by date range
  const fetchServiceHistoriesByDateRange = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        return mockServiceHistories.filter(h => {
          const serviceDate = new Date(h.serviceDate);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return serviceDate >= start && serviceDate <= end;
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/api/service-histories/by-date-range?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&size=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        return data.content || data || [];
      } else {
        return mockServiceHistories.filter(h => {
          const serviceDate = new Date(h.serviceDate);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return serviceDate >= start && serviceDate <= end;
        });
      }
    } catch (error) {
      console.error('Error fetching service histories by date range:', error);
      return mockServiceHistories.filter(h => {
        const serviceDate = new Date(h.serviceDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return serviceDate >= start && serviceDate <= end;
      });
    }
  };

  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        setVehicles(mockVehicles);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.content || data || mockVehicles);
      } else {
        setVehicles(mockVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles(mockVehicles);
    }
  };

  // Fetch parts for dropdown
  const fetchParts = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        setParts(mockParts);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/parts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setParts(data.content || data || mockParts);
      } else {
        setParts(mockParts);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      setParts(mockParts);
    }
  };

  // ===========================================================================================
  // CRUD OPERATIONS - SC STAFF PERMISSIONS
  // ===========================================================================================
  
  // Open create form
  const openCreateForm = () => {
    setFormData({
      serviceDate: new Date().toISOString().slice(0, 16), // Current datetime
      serviceType: '',
      description: '',
      partId: '',
      vehicleId: ''
    });
    setFormErrors({});
    setActiveView('create');
  };

  // Open edit form
  const openEditForm = (history) => {
    setSelectedHistory(history);
    setFormData({
      serviceDate: history.serviceDate ? new Date(history.serviceDate).toISOString().slice(0, 16) : '',
      serviceType: history.serviceType,
      description: history.description,
      partId: history.partId,
      vehicleId: history.vehicleId.toString()
    });
    setFormErrors({});
    setActiveView('edit');
  };

  // View history detail
  const viewHistoryDetail = (history) => {
    setSelectedHistory(history);
    setActiveView('detail');
  };

  // Close form and return to list
  const closeForm = () => {
    setActiveView('list');
    setSelectedHistory(null);
    setFormErrors({});
  };

  // Submit service history form (SC Staff create/update)
  const handleSubmitHistory = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token) {
        alert('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }
      
      if (!API_BASE_URL) {
        alert('Lỗi cấu hình: Không tìm thấy VITE_API_BASE_URL');
        return;
      }

      const payload = {
        serviceDate: formData.serviceDate,
        serviceType: formData.serviceType,
        description: formData.description,
        partId: formData.partId,
        vehicleId: parseInt(formData.vehicleId)
      };

      let url, method;
      if (activeView === 'edit' && selectedHistory) {
        // Update existing history (PUT /api/service-histories/{id})
        url = `${API_BASE_URL}/api/service-histories/${selectedHistory.serviceHistoryId}`;
        method = 'PUT';
        console.log('SC Staff updating service history:', payload);
      } else {
        // Create new history (POST /api/service-histories)
        url = `${API_BASE_URL}/api/service-histories`;
        method = 'POST';
        console.log('SC Staff creating service history:', payload);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Service history ${method === 'PUT' ? 'updated' : 'created'}:`, result);
        
        await fetchServiceHistories();
        closeForm();
        alert(`Lịch sử dịch vụ đã được ${method === 'PUT' ? 'cập nhật' : 'tạo'} thành công!`);
      } else {
        let errorBody = null;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            errorBody = await response.json();
          } else {
            errorBody = await response.text();
          }
        } catch (err) {
          errorBody = 'Không đọc được nội dung trả về';
        }
        
        console.error('Service history operation failed:', response.status, errorBody);
        const message = (errorBody && (errorBody.message || errorBody.error || JSON.stringify(errorBody))) || response.statusText || 'Unknown error';
        alert(`${method === 'PUT' ? 'Cập nhật' : 'Tạo'} lịch sử dịch vụ thất bại (status ${response.status}): ${message}`);
      }
    } catch (error) {
      console.error('Error in service history operation:', error);
      alert(`Lỗi khi ${activeView === 'edit' ? 'cập nhật' : 'tạo'} lịch sử dịch vụ. Vui lòng thử lại.`);
    }
  };

  // ===========================================================================================
  // FORM VALIDATION
  // ===========================================================================================
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.serviceDate.trim()) {
      errors.serviceDate = 'Ngày dịch vụ là bắt buộc';
    }
    
    if (!formData.serviceType.trim()) {
      errors.serviceType = 'Loại dịch vụ là bắt buộc';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Mô tả dịch vụ là bắt buộc';
    } else if (formData.description.length < 10) {
      errors.description = 'Mô tả phải có ít nhất 10 ký tự';
    } else if (formData.description.length > 500) {
      errors.description = 'Mô tả không được vượt quá 500 ký tự';
    }
    
    if (!formData.partId || !formData.partId.trim()) {
      errors.partId = 'Linh kiện là bắt buộc';
    }
    
    if (!formData.vehicleId || !formData.vehicleId.trim()) {
      errors.vehicleId = 'Xe là bắt buộc';
    }
    
    return errors;
  };

  // ===========================================================================================
  // FILTER FUNCTIONS
  // ===========================================================================================
  
  const applyFilters = async () => {
    setLoading(true);
    setCurrentPage(0);
    
    try {
      let filteredHistories = [...serviceHistories];
      
      // Apply vehicle filter
      if (filterVehicle) {
        const vehicleHistories = await fetchServiceHistoriesByVehicle(filterVehicle);
        filteredHistories = vehicleHistories;
      }
      
      // Apply part filter
      if (filterPart) {
        const partHistories = await fetchServiceHistoriesByPart(filterPart);
        filteredHistories = filterPart && filterVehicle 
          ? filteredHistories.filter(h => partHistories.some(ph => ph.serviceHistoryId === h.serviceHistoryId))
          : partHistories;
      }
      
      // Apply date range filter
      if (dateRange.startDate && dateRange.endDate) {
        const dateHistories = await fetchServiceHistoriesByDateRange(dateRange.startDate, dateRange.endDate);
        filteredHistories = (filterVehicle || filterPart) && dateRange.startDate && dateRange.endDate
          ? filteredHistories.filter(h => dateHistories.some(dh => dh.serviceHistoryId === h.serviceHistoryId))
          : dateHistories;
      }
      
      // Apply service type filter
      if (filterServiceType) {
        filteredHistories = filteredHistories.filter(h => h.serviceType === filterServiceType);
      }
      
      setServiceHistories(filteredHistories);
      setTotalElements(filteredHistories.length);
      setTotalPages(Math.ceil(filteredHistories.length / pageSize));
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const clearFilters = () => {
    setFilterVehicle('');
    setFilterPart('');
    setFilterServiceType('');
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
    setCurrentPage(0);
    fetchServiceHistories();
  };

  // ===========================================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================================
  
  // Get service type badge styling
  const getServiceTypeBadge = (serviceType) => {
    const typeConfig = serviceTypes.find(t => t.value === serviceType) || serviceTypes[0];
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        color: typeConfig.color,
        background: typeConfig.color + '20'
      }}>
        {typeConfig.icon}
        {typeConfig.label}
      </span>
    );
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Filter histories based on search term
  const filteredHistories = serviceHistories.filter(history =>
    history.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.vehicleVin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.partName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <FaArrowLeft /> Quay lại
                </button>
              )}
              
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaHistory style={{ color: '#8b5cf6' }} />
                  Quản lý Lịch sử Dịch vụ (SC Staff)
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  {activeView === 'list' && 'Xem, tạo và cập nhật lịch sử dịch vụ của khách hàng'}
                  {activeView === 'create' && 'Tạo bản ghi dịch vụ mới'}
                  {activeView === 'edit' && 'Cập nhật thông tin dịch vụ'}
                  {activeView === 'detail' && 'Xem chi tiết lịch sử dịch vụ'}
                </p>
              </div>
            </div>
            
            {/* Create button */}
            {activeView === 'list' && (
              <button
                onClick={openCreateForm}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                <FaPlus /> Tạo lịch sử dịch vụ
              </button>
            )}
          </div>

          {/* ===== SEARCH AND FILTER SECTION ===== */}
          {activeView === 'list' && (
            <>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mô tả, biển số xe, tên xe, linh kiện..."
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    minWidth: '300px',
                    flex: 1
                  }}
                />
                
                <button
                  onClick={fetchServiceHistories}
                  style={{
                    background: '#8b5cf6',
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
              </div>
              
              {/* Advanced Filters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <select
                  value={filterVehicle}
                  onChange={(e) => setFilterVehicle(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                >
                  <option value="">Tất cả xe</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.vehicleName} ({vehicle.vehicleVin})
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterPart}
                  onChange={(e) => setFilterPart(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                >
                  <option value="">Tất cả linh kiện</option>
                  {parts.map((part) => (
                    <option key={part.partId} value={part.partId}>
                      {part.partName}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterServiceType}
                  onChange={(e) => setFilterServiceType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                >
                  <option value="">Tất cả loại dịch vụ</option>
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontWeight: '500', color: '#374151' }}>Từ ngày:</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontWeight: '500', color: '#374151' }}>Đến ngày:</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                
                <button
                  onClick={applyFilters}
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
                  <FaFilter /> Áp dụng bộ lọc
                </button>
                
                <button
                  onClick={clearFilters}
                  style={{
                    background: '#6b7280',
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
                  <FaTimes /> Xóa bộ lọc
                </button>
              </div>
            </>
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
                <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#8b5cf6' }} />
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Service Histories List */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ngày dịch vụ</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Loại dịch vụ</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Mô tả</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Xe</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Linh kiện</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistories.map((history) => (
                        <tr key={history.serviceHistoryId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>#{history.serviceHistoryId}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                            {formatDate(history.serviceDate)}
                          </td>
                          <td style={{ padding: '12px' }}>{getServiceTypeBadge(history.serviceType)}</td>
                          <td style={{ padding: '12px', maxWidth: '200px' }}>
                            <div style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {history.description}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '14px' }}>
                              <div style={{ fontWeight: '500' }}>{history.vehicleName}</div>
                              <div style={{ color: '#6b7280', fontFamily: 'monospace' }}>{history.vehicleVin}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>{history.partName}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => viewHistoryDetail(history)}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FaEye /> Xem
                              </button>
                              <button
                                onClick={() => openEditForm(history)}
                                style={{
                                  background: '#8b5cf6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FaEdit /> Sửa
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

                {/* Summary */}
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Hiển thị {filteredHistories.length} / {totalElements} bản ghi lịch sử dịch vụ
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== CREATE/EDIT FORM VIEW ===== */}
        {(activeView === 'create' || activeView === 'edit') && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px' }}>
              
              {/* Service Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Ngày dịch vụ *
                </label>
                <input
                  type="datetime-local"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.serviceDate ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {formErrors.serviceDate && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.serviceDate}
                  </p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Loại dịch vụ *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.serviceType ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Chọn loại dịch vụ --</option>
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.serviceType && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.serviceType}
                  </p>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Chọn xe *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.vehicleId ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Chọn xe --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.vehicleName} ({vehicle.vehicleVin})
                    </option>
                  ))}
                </select>
                {formErrors.vehicleId && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.vehicleId}
                  </p>
                )}
              </div>

              {/* Part Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Chọn linh kiện *
                </label>
                <select
                  value={formData.partId}
                  onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.partId ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Chọn linh kiện --</option>
                  {parts.map((part) => (
                    <option key={part.partId} value={part.partId}>
                      {part.partName} ({part.category})
                    </option>
                  ))}
                </select>
                {formErrors.partId && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.partId}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Mô tả dịch vụ *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết dịch vụ đã thực hiện (10-500 ký tự)..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: formErrors.description ? '2px solid #ef4444' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {formErrors.description && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>
                    {formErrors.description}
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                  {formData.description.length}/500 ký tự
                </p>
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
                onClick={handleSubmitHistory}
                style={{
                  background: '#8b5cf6',
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
                <FaSave /> {activeView === 'create' ? 'Tạo bản ghi' : 'Cập nhật bản ghi'}
              </button>
            </div>
          </div>
        )}

        {/* ===== DETAIL VIEW ===== */}
        {activeView === 'detail' && selectedHistory && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Thông tin dịch vụ</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>ID:</strong> #{selectedHistory.serviceHistoryId}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Ngày dịch vụ:</strong> {formatDate(selectedHistory.serviceDate)}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Loại dịch vụ:</strong> {getServiceTypeBadge(selectedHistory.serviceType)}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Linh kiện:</strong> {selectedHistory.partName}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Mã linh kiện:</strong> <code>{selectedHistory.partId}</code>
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Thông tin xe</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Tên xe:</strong> {selectedHistory.vehicleName}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Biển số:</strong> <code>{selectedHistory.vehicleVin}</code>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>ID xe:</strong> {selectedHistory.vehicleId}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Mô tả dịch vụ</h3>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                lineHeight: '1.6'
              }}>
                {selectedHistory.description}
              </div>
            </div>

            {/* Detail Actions */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openEditForm(selectedHistory)}
                style={{
                  background: '#8b5cf6',
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceHistoryManagement;