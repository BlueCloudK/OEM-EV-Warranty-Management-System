// ===========================================================================================
// WARRANTY CLAIMS MANAGEMENT COMPONENT FOR SC STAFF
// Quản lý yêu cầu bảo hành cho Service Center Staff
// SC STAFF PERMISSIONS: Create, Read, Update claims (NO DELETE, NO WORKFLOW ACTIONS)
// ===========================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaClipboardList,  // Icon clipboard (yêu cầu bảo hành)
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
  FaClock,          // Icon chờ xử lý
  FaExclamationTriangle, // Icon cảnh báo
  FaSave,           // Icon lưu
  FaInfo            // Icon thông tin
} from 'react-icons/fa';

// ===========================================================================================
// MAIN COMPONENT
// ===========================================================================================

const WarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ===========================================================================================
  // STATE MANAGEMENT
  // ===========================================================================================
  
  // Data states
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // View states
  const [activeView, setActiveView] = useState('list'); // list, create, edit, detail
  const [selectedClaim, setSelectedClaim] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    description: '',
    partId: '',
    vehicleId: '',
    status: 'SUBMITTED'
  });
  const [formErrors, setFormErrors] = useState({});

  // ===========================================================================================
  // MOCK DATA - For fallback when API is not available
  // ===========================================================================================
  
  const mockWarrantyClaims = [
    {
      warrantyClaimId: 1,
      description: "Pin xe bị sụt dung lượng, cần thay thế theo bảo hành",
      claimDate: "2024-10-15T10:30:00.000+00:00",
      resolutionDate: null,
      status: "SUBMITTED",
      partId: 1,
      partName: "Battery Pack",
      vehicleId: 1,
      vehicleVin: "92-MĐ-852.50",
      vehicleBrand: "Tesla",
      vehicleModel: "Model 3"
    },
    {
      warrantyClaimId: 2,
      description: "Hệ thống sạc có lỗi, không sạc được pin",
      claimDate: "2024-10-14T14:20:00.000+00:00",
      resolutionDate: null,
      status: "SC_REVIEW",
      partId: 2,
      partName: "Charging System",
      vehicleId: 2,
      vehicleVin: "30-A1-456.87",
      vehicleBrand: "Tesla",
      vehicleModel: "Model Y"
    },
    {
      warrantyClaimId: 3,
      description: "Motor điện có tiếng ồn bất thường",
      claimDate: "2024-10-13T09:15:00.000+00:00",
      resolutionDate: "2024-10-16T16:45:00.000+00:00",
      status: "COMPLETED",
      partId: 3,
      partName: "Electric Motor",
      vehicleId: 1,
      vehicleVin: "92-MĐ-852.50",
      vehicleBrand: "Tesla",
      vehicleModel: "Model 3"
    }
  ];

  const mockVehicles = [
    { vehicleId: 1, vehicleName: "Tesla Model 3", vehicleVin: "92-MĐ-852.50" },
    { vehicleId: 2, vehicleName: "Tesla Model Y", vehicleVin: "30-A1-456.87" },
    { vehicleId: 3, vehicleName: "VinFast VF8", vehicleVin: "51-B1-789.12" }
  ];

  const mockParts = [
    { partId: 1, partName: "Battery Pack", category: "Power System" },
    { partId: 2, partName: "Charging System", category: "Power System" },
    { partId: 3, partName: "Electric Motor", category: "Drive System" },
    { partId: 4, partName: "Brake System", category: "Safety System" },
    { partId: 5, partName: "Display Screen", category: "Electronics" }
  ];

  // ===========================================================================================
  // EFFECTS
  // ===========================================================================================
  
  useEffect(() => {
    fetchWarrantyClaims();
    fetchVehicles();
    fetchParts();
  }, [currentPage, pageSize, filterStatus]);

  // Handle navigation from VehicleManagement with pre-filled data
  useEffect(() => {
    if (location.state?.prefilledVehicle) {
      const vehicleData = location.state.prefilledVehicle;
      console.group('📋 WarrantyClaimsManagement: Received pre-filled vehicle data');
      console.log('Vehicle Data:', vehicleData);
      console.log('Vehicle ID:', vehicleData.vehicleId);
      console.log('Vehicle Name:', vehicleData.vehicleName);
      console.log('Vehicle VIN:', vehicleData.vehicleVin);
      console.groupEnd();
      
      // Set form data with vehicle info
      setFormData(prev => ({
        ...prev,
        vehicleId: vehicleData.vehicleId?.toString() || '',
        description: `Yêu cầu bảo hành cho xe ${vehicleData.vehicleName} (${vehicleData.vehicleVin})`,
        status: 'SUBMITTED'
      }));
      
      // Auto-open create form if requested
      if (location.state.openCreateForm) {
        console.log('🔄 Auto-opening create form...');
        setActiveView('create');
      }
      
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ===========================================================================================
  // API FUNCTIONS - ONLY SC STAFF PERMITTED ENDPOINTS
  // ===========================================================================================
  
  // Fetch warranty claims from API
  const fetchWarrantyClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      console.group('📋 SC Staff: Fetching Warranty Claims');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Filter status:', filterStatus);
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setWarrantyClaims(mockWarrantyClaims);
        setTotalElements(mockWarrantyClaims.length);
        setTotalPages(1);
        setLoading(false);
        console.groupEnd();
        return;
      }

      // Build URL based on filter status (SC_STAFF can access all status endpoints)
      let url = `${API_BASE_URL}/api/warranty-claims?page=${currentPage}&size=${pageSize}`;
      
      if (filterStatus !== 'all') {
        url = `${API_BASE_URL}/api/warranty-claims/by-status/${filterStatus}?page=${currentPage}&size=${pageSize}`;
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
          setWarrantyClaims(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          setWarrantyClaims(Array.isArray(data) ? data : []);
          setTotalElements(Array.isArray(data) ? data.length : 0);
          setTotalPages(1);
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        // Fallback to mock data
        setWarrantyClaims(mockWarrantyClaims);
        setTotalElements(mockWarrantyClaims.length);
        setTotalPages(1);
      }
      console.groupEnd();
    } catch (error) {
      console.error('Network Error:', error);
      // Fallback to mock data
      setWarrantyClaims(mockWarrantyClaims);
      setTotalElements(mockWarrantyClaims.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
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

  // Create service history when warranty claim is completed
  const createServiceHistoryFromClaim = async (claim, partInfo, vehicleInfo) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      if (!token || !API_BASE_URL) {
        console.warn('Cannot create service history: missing token or API_BASE_URL');
        return false;
      }

      // Determine service type based on claim description
      let serviceType = 'REPAIR'; // Default
      const description = claim.description.toLowerCase();
      if (description.includes('thay thế') || description.includes('thay')) {
        serviceType = 'REPLACEMENT';
      } else if (description.includes('bảo dưỡng')) {
        serviceType = 'MAINTENANCE';
      } else if (description.includes('kiểm tra')) {
        serviceType = 'INSPECTION';
      }

      const serviceHistoryPayload = {
        serviceDate: new Date().toISOString(),
        serviceType: serviceType,
        description: `Hoàn thành yêu cầu bảo hành: ${claim.description}`,
        partId: claim.partId,
        vehicleId: claim.vehicleId
      };

      console.group('📋 Creating Service History from Warranty Claim');
      console.log('Claim ID:', claim.warrantyClaimId);
      console.log('Service History Payload:', serviceHistoryPayload);
      
      const response = await fetch(`${API_BASE_URL}/api/service-histories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceHistoryPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Service History created successfully:', result);
        console.groupEnd();
        return true;
      } else {
        const errorBody = await response.text();
        console.error('❌ Failed to create Service History:', response.status, errorBody);
        console.groupEnd();
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating Service History:', error);
      return false;
    }
  };
  
  // Open create form
  const openCreateForm = () => {
    // Only reset if no pre-filled data exists
    if (!formData.vehicleId && !formData.description.includes('Yêu cầu bảo hành cho xe')) {
      setFormData({
        description: '',
        partId: '',
        vehicleId: '',
        status: 'SUBMITTED'
      });
    }
    setFormErrors({});
    setActiveView('create');
  };

  // Open edit form
  const openEditForm = (claim) => {
    setSelectedClaim(claim);
    setFormData({
      description: claim.description,
      partId: claim.partId.toString(),
      vehicleId: claim.vehicleId.toString(),
      status: claim.status || 'SUBMITTED'
    });
    setFormErrors({});
    setActiveView('edit');
  };

  // View claim detail
  const viewClaimDetail = (claim) => {
    setSelectedClaim(claim);
    setActiveView('detail');
  };

  // Close form and return to list
  const closeForm = () => {
    setActiveView('list');
    setSelectedClaim(null);
    setFormErrors({});
  };

  // Submit warranty claim form (SC Staff create/update)
  const handleSubmitClaim = async () => {
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
        description: formData.description,
        partId: parseInt(formData.partId),
        vehicleId: parseInt(formData.vehicleId),
        status: formData.status
      };

      let url, method;
      if (activeView === 'edit' && selectedClaim) {
        // Update existing claim (PUT /api/warranty-claims/{id})
        url = `${API_BASE_URL}/api/warranty-claims/${selectedClaim.warrantyClaimId}`;
        method = 'PUT';
        console.log('SC Staff updating warranty claim:', payload);
      } else {
        // Create new claim using SC Staff specific endpoint
        url = `${API_BASE_URL}/api/warranty-claims/sc-create`;
        method = 'POST';
        console.log('SC Staff creating warranty claim:', payload);
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
        console.log(`✅ Warranty claim ${method === 'PUT' ? 'updated' : 'created'}:`, result);
        
        // Check if warranty claim is completed and create service history
        if (formData.status === 'COMPLETED' || formData.status === 'RESOLVED') {
          console.log('🔄 Warranty claim completed, creating service history...');
          
          // Find part and vehicle info for service history
          const partInfo = parts.find(p => p.partId === parseInt(formData.partId));
          const vehicleInfo = vehicles.find(v => v.vehicleId === parseInt(formData.vehicleId));
          
          const serviceHistoryCreated = await createServiceHistoryFromClaim(
            { 
              ...result, 
              description: formData.description,
              partId: formData.partId,
              vehicleId: formData.vehicleId
            },
            partInfo,
            vehicleInfo
          );
          
          if (serviceHistoryCreated) {
            alert(`Yêu cầu bảo hành đã được ${method === 'PUT' ? 'cập nhật' : 'tạo'} thành công!\n✅ Lịch sử dịch vụ đã được tự động tạo.`);
          } else {
            alert(`Yêu cầu bảo hành đã được ${method === 'PUT' ? 'cập nhật' : 'tạo'} thành công!\n⚠️ Không thể tạo lịch sử dịch vụ tự động. Vui lòng tạo thủ công.`);
          }
        } else {
          alert(`Yêu cầu bảo hành đã được ${method === 'PUT' ? 'cập nhật' : 'tạo'} thành công!`);
        }
        
        await fetchWarrantyClaims();
        closeForm();
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
        
        console.error('Warranty claim operation failed:', response.status, errorBody);
        const message = (errorBody && (errorBody.message || errorBody.error || JSON.stringify(errorBody))) || response.statusText || 'Unknown error';
        alert(`${method === 'PUT' ? 'Cập nhật' : 'Tạo'} yêu cầu bảo hành thất bại (status ${response.status}): ${message}`);
      }
    } catch (error) {
      console.error('Error in warranty claim operation:', error);
      alert(`Lỗi khi ${activeView === 'edit' ? 'cập nhật' : 'tạo'} yêu cầu bảo hành. Vui lòng thử lại.`);
    }
  };

  // ===========================================================================================
  // FORM VALIDATION
  // ===========================================================================================
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Mô tả vấn đề là bắt buộc';
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
  // UTILITY FUNCTIONS
  // ===========================================================================================
  
  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUBMITTED': { 
        color: '#f59e0b', 
        background: '#fef3c7', 
        text: 'Chờ duyệt',
        icon: <FaClock />
      },
      'SC_REVIEW': { 
        color: '#3b82f6', 
        background: '#dbeafe', 
        text: 'Đang xem xét',
        icon: <FaEye />
      },
      'PROCESSING': { 
        color: '#8b5cf6', 
        background: '#ede9fe', 
        text: 'Đang xử lý',
        icon: <FaTools />
      },
      'COMPLETED': { 
        color: '#10b981', 
        background: '#d1fae5', 
        text: 'Hoàn thành',
        icon: <FaCheck />
      },
      'REJECTED': { 
        color: '#ef4444', 
        background: '#fee2e2', 
        text: 'Từ chối',
        icon: <FaTimes />
      }
    };

    const config = statusConfig[status] || statusConfig['SUBMITTED'];
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        color: config.color,
        background: config.background
      }}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Filter claims based on search term
  const filteredClaims = warrantyClaims.filter(claim =>
    claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.vehicleVin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.partName?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <FaArrowLeft /> Dashboard
                </button>
              )}
              
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaClipboardList style={{ color: '#f59e0b' }} />
                  Quản lý Yêu cầu Bảo hành (SC Staff)
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  {activeView === 'list' && 'Xem, tạo và cập nhật yêu cầu bảo hành từ khách hàng'}
                  {activeView === 'create' && 'Tạo yêu cầu bảo hành mới cho khách hàng'}
                  {activeView === 'edit' && 'Cập nhật thông tin yêu cầu bảo hành'}
                  {activeView === 'detail' && 'Xem chi tiết yêu cầu bảo hành'}
                </p>
              </div>
            </div>
            
            {/* Create button */}
            {activeView === 'list' && (
              <button
                onClick={openCreateForm}
                style={{
                  background: '#f59e0b',
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
                <FaPlus /> Tạo yêu cầu bảo hành
              </button>
            )}
          </div>

          {/* ===== SEARCH AND FILTER SECTION ===== */}
          {activeView === 'list' && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo mô tả, biển số xe, linh kiện..."
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  minWidth: '300px',
                  flex: 1
                }}
              />
              
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(0);
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white'
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="SUBMITTED">Chờ duyệt</option>
                <option value="SC_REVIEW">Đang xem xét</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="REJECTED">Từ chối</option>
              </select>
              
              <button
                onClick={() => {
                  setCurrentPage(0);
                  fetchWarrantyClaims();
                }}
                style={{
                  background: '#f59e0b',
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
                <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#f59e0b' }} />
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Claims List */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Mô tả</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Xe</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Linh kiện</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Trạng thái</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ngày tạo</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim) => (
                        <tr key={claim.warrantyClaimId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>#{claim.warrantyClaimId}</td>
                          <td style={{ padding: '12px', maxWidth: '200px' }}>
                            <div style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {claim.description}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '14px' }}>
                              <div style={{ fontWeight: '500' }}>{claim.vehicleBrand} {claim.vehicleModel}</div>
                              <div style={{ color: '#6b7280', fontFamily: 'monospace' }}>{claim.vehicleVin}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>{claim.partName}</td>
                          <td style={{ padding: '12px' }}>{getStatusBadge(claim.status)}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                            {formatDate(claim.claimDate)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => viewClaimDetail(claim)}
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
                                onClick={() => openEditForm(claim)}
                                style={{
                                  background: '#f59e0b',
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
                  Hiển thị {filteredClaims.length} / {totalElements} yêu cầu bảo hành
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
            {/* Pre-filled Vehicle Notification */}
            {activeView === 'create' && formData.vehicleId && formData.description.includes('Yêu cầu bảo hành cho xe') && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaInfo style={{ color: '#10b981' }} />
                <span style={{ color: '#047857', fontSize: '14px' }}>
                  ✅ Xe đã được chọn từ danh sách. Vui lòng chọn linh kiện và mô tả vấn đề.
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '600px' }}>
              
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

              {/* Status Selection (Only for Edit) */}
              {activeView === 'edit' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Trạng thái yêu cầu *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="SUBMITTED">Đã gửi</option>
                    <option value="SC_REVIEW">SC đang xem xét</option>
                    <option value="APPROVED">Đã phê duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="RESOLVED">Đã giải quyết</option>
                  </select>
                  <p style={{ color: '#059669', fontSize: '12px', marginTop: '4px' }}>
                    💡 Khi chọn "Đã hoàn thành" hoặc "Đã giải quyết", hệ thống sẽ tự động tạo lịch sử dịch vụ.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Mô tả vấn đề *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề bảo hành (10-500 ký tự)..."
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
                onClick={handleSubmitClaim}
                style={{
                  background: '#f59e0b',
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
                <FaSave /> {activeView === 'create' ? 'Tạo yêu cầu bảo hành' : 'Cập nhật yêu cầu'}
              </button>
            </div>
          </div>
        )}

        {/* ===== DETAIL VIEW ===== */}
        {activeView === 'detail' && selectedClaim && (
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
                  <strong>ID:</strong> #{selectedClaim.warrantyClaimId}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Trạng thái:</strong> {getStatusBadge(selectedClaim.status)}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Ngày tạo:</strong> {formatDate(selectedClaim.claimDate)}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Ngày hoàn thành:</strong> {formatDate(selectedClaim.resolutionDate)}
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Thông tin xe và linh kiện</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Xe:</strong> {selectedClaim.vehicleBrand} {selectedClaim.vehicleModel}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Biển số:</strong> <code>{selectedClaim.vehicleVin}</code>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Linh kiện:</strong> {selectedClaim.partName}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Mô tả vấn đề</h3>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                lineHeight: '1.6'
              }}>
                {selectedClaim.description}
              </div>
            </div>

            {/* Detail Actions */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openEditForm(selectedClaim)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyClaimsManagement;
