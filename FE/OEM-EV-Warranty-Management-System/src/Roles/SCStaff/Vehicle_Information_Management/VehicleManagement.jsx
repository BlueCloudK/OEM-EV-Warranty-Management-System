// ================== IMPORT SECTION ==================
// Import React hooks và các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import các icon từ Font Awesome cho giao diện
import { 
  FaCar,        // Icon xe hơi
  FaEdit,       // Icon chỉnh sửa
  FaEye,        // Icon xem chi tiết
  FaSearch,     // Icon tìm kiếm
  FaArrowLeft,  // Icon mũi tên quay lại
  FaSpinner,    // Icon loading
  FaCalendar,   // Icon lịch (năm)
  FaIdCard,     // Icon thẻ ID
  FaPalette,    // Icon bảng màu
  FaCogs,       // Icon bánh răng (động cơ)
  FaUser,       // Icon người dùng
  FaBarcode     // Icon mã vạch (VIN)
} from 'react-icons/fa';

// ================== MAIN COMPONENT ==================
// Component chính quản lý thông tin xe
const VehicleManagement = () => {
  // ================== NAVIGATION HOOKS ==================
  // Hook để điều hướng giữa các trang
  const navigate = useNavigate();
  
  // ================== STATE MANAGEMENT ==================
  // State quản lý dữ liệu xe và khách hàng
  const [vehicles, setVehicles] = useState([]);        // Danh sách xe
  const [customers, setCustomers] = useState([]);      // Danh sách khách hàng
  const [loading, setLoading] = useState(true);        // Trạng thái loading
  
  // State quản lý tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');    // Từ khóa tìm kiếm
  const [searchType, setSearchType] = useState('general'); // Loại tìm kiếm: general, vin, customer
  
  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(0);   // Trang hiện tại (bắt đầu từ 0)
  const [pageSize, setPageSize] = useState(10);        // Số lượng xe mỗi trang
  const [totalPages, setTotalPages] = useState(0);     // Tổng số trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số xe
  
  // ================== VIEW STATE MANAGEMENT ==================
  // State quản lý các view khác nhau của component
  const [activeView, setActiveView] = useState('list'); // 'list', 'form', 'detail'
  // SCStaff không được tạo xe mới -> formMode mặc định là 'edit'
  const [formMode, setFormMode] = useState('edit');   // 'edit' only for SCStaff
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Xe được chọn
  
  // ================== FORM DATA MANAGEMENT ==================
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    vehicleName: '',    // Tên xe
    vehicleModel: '',   // Model xe
    vehicleVin: '',     // Số VIN (17 ký tự)
    vehicleYear: new Date().getFullYear(), // Năm sản xuất (mặc định năm hiện tại)
    vehicleColor: '',   // Màu xe
    vehicleEngine: '',  // Loại động cơ
    customerId: ''      // ID khách hàng sở hữu
  });
  const [formErrors, setFormErrors] = useState({}); // Lỗi validation form

  // ================== MOCK DATA ==================
  // Dữ liệu demo khi không kết nối được API
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

  // ================== LOGGING UTILITY ==================
  // Hàm tiện ích để log các cuộc gọi API cho việc debug
  const logApiCall = (action, url, data = null) => {
    console.group(`🚗 Vehicle API - ${action}`);
    console.log('📍 Endpoint:', url);
    console.log('🔐 Auth:', localStorage.getItem('token') ? 'Token present' : 'No token');
    if (data) console.log('📦 Data:', data);
    console.groupEnd();
  };

  // ================== EFFECT HOOKS ==================
  // Tự động load dữ liệu khi component mount hoặc khi page/pageSize thay đổi
  useEffect(() => {
    fetchVehicles();  // Lấy danh sách xe
    fetchCustomers(); // Lấy danh sách khách hàng cho dropdown
  }, [currentPage, pageSize]);

  // ================== API FUNCTIONS ==================
  
  // Hàm lấy danh sách xe từ API
  const fetchVehicles = async () => {
    try {
      setLoading(true); // Bật loading
      const token = localStorage.getItem('token'); // Lấy JWT token
      
      // Kiểm tra token, nếu không có thì dùng mock data
      if (!token) {
        console.error('No token found');
        setVehicles(mockVehicles);
        setTotalElements(mockVehicles.length);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      let url = `${API_BASE_URL}/api/vehicles?page=${currentPage}&size=${pageSize}`;
      
      // ================== SEARCH LOGIC ==================
      // Xây dựng URL dựa trên loại tìm kiếm
      if (searchTerm) {
        if (searchType === 'vin') {
          // Tìm kiếm theo VIN (trả về 1 xe)
          url = `${API_BASE_URL}/api/vehicles/by-vin?vin=${encodeURIComponent(searchTerm)}`;
        } else if (searchType === 'customer') {
          // Tìm kiếm theo Customer ID (có phân trang)
          url = `${API_BASE_URL}/api/vehicles/by-customer/${encodeURIComponent(searchTerm)}?page=${currentPage}&size=${pageSize}`;
        } else {
          // Tìm kiếm chung (có phân trang)
          url = `${API_BASE_URL}/api/vehicles?page=${currentPage}&size=${pageSize}&search=${encodeURIComponent(searchTerm)}`;
        }
      }

      logApiCall('GET Vehicles', url); // Log cuộc gọi API

      // Gọi API với JWT Bearer token
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehicles fetched:', data);
        
        // ================== RESPONSE HANDLING ==================
        // Xử lý các loại response khác nhau
        if (searchType === 'vin' && !Array.isArray(data)) {
          // Response cho tìm kiếm VIN (1 xe)
          setVehicles([data]);
          setTotalElements(1);
          setTotalPages(1);
        } else if (data.content) {
          // Response có phân trang
          setVehicles(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          // Response trực tiếp (array hoặc object)
          setVehicles(Array.isArray(data) ? data : [data]);
          setTotalElements(Array.isArray(data) ? data.length : 1);
          setTotalPages(1);
        }
      } else {
        console.error('Failed to fetch vehicles:', response.status);
        // Fallback về mock data nếu API lỗi
        setVehicles(mockVehicles);
        setTotalElements(mockVehicles.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Fallback về mock data nếu có lỗi
      setVehicles(mockVehicles);
      setTotalElements(mockVehicles.length);
      setTotalPages(1);
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  // ================== FETCH CUSTOMERS ==================
  // Hàm lấy danh sách khách hàng cho dropdown trong form
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.content || []); // Lưu danh sách khách hàng
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // ================== SEARCH HANDLERS ==================
  // Xử lý tìm kiếm
  const handleSearch = () => {
    setCurrentPage(0); // Reset về trang đầu khi tìm kiếm
    fetchVehicles();   // Gọi lại API với từ khóa mới
  };

  // Xóa bộ lọc tìm kiếm
  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('general');
    setCurrentPage(0);
    fetchVehicles(); // Reload toàn bộ danh sách
  };

  // ================== CRUD OPERATIONS ==================
  
  // NOTE: Removed create form open function for SCStaff (no create permission)

  // Mở form chỉnh sửa xe
  const openEditForm = (vehicle) => {
    setFormMode('edit');
    setSelectedVehicle(vehicle);
    // Fill form với dữ liệu xe hiện tại
    setFormData({
      vehicleName: vehicle.vehicleName,
      vehicleModel: vehicle.vehicleModel,
      vehicleVin: vehicle.vehicleVin,
      vehicleYear: vehicle.vehicleYear,
      vehicleColor: vehicle.vehicleColor,
      vehicleEngine: vehicle.vehicleEngine,
      customerId: vehicle.customerId
    });
    setFormErrors({});
    setActiveView('form');
  };

  // Xem chi tiết xe
  const viewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveView('detail');
  };

  // Đóng form và quay lại danh sách
  const closeForm = () => {
    setActiveView('list');
    setSelectedVehicle(null);
    setFormErrors({});
  };

  // ================== CREATE/UPDATE VEHICLE ==================
  // Hàm xử lý tạo mới hoặc cập nhật xe
  const handleSubmitVehicle = async () => {
    const errors = validateForm(); // Validate form trước khi submit
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Dừng nếu có lỗi validation
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // For SCStaff we only allow updating existing vehicles.
      let url, method;
      if (formMode === 'edit' && selectedVehicle) {
        // Mode chỉnh sửa: dùng PUT và ID xe
        url = `${API_BASE_URL}/api/vehicles/${selectedVehicle.vehicleId}`;
        method = 'PUT';
      } else {
        // Không cho phép tạo mới từ giao diện SCStaff
        alert('Không thể tạo xe mới từ tài khoản SCStaff. Vui lòng chọn một xe để cập nhật.');
        return;
      }

      logApiCall(`${method} Vehicle`, url, formData);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Vehicle ${formMode === 'edit' ? 'updated' : 'created'}:`, result);
        
        await fetchVehicles(); // Reload danh sách xe
        closeForm();           // Đóng form
        alert(`Xe đã được ${formMode === 'edit' ? 'cập nhật' : 'tạo'} thành công!`);
      } else {
        const error = await response.json();
        console.error('❌ Vehicle operation failed:', error);
        alert(`${formMode === 'edit' ? 'Cập nhật' : 'Tạo'} xe thất bại: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in vehicle operation:', error);
      alert(`Lỗi khi ${formMode === 'edit' ? 'cập nhật' : 'tạo'} xe. Vui lòng thử lại.`);
    }
  };

  // DELETE removed: SCStaff không có quyền xóa xe từ giao diện này

  // ================== FORM VALIDATION ==================
  // Hàm validate dữ liệu form
  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra tên xe
    if (!formData.vehicleName.trim()) {
      errors.vehicleName = 'Tên xe là bắt buộc';
    }
    
    // Kiểm tra model xe
    if (!formData.vehicleModel.trim()) {
      errors.vehicleModel = 'Model xe là bắt buộc';
    }
    
    // Kiểm tra VIN (phải đúng 17 ký tự)
    if (!formData.vehicleVin.trim()) {
      errors.vehicleVin = 'VIN là bắt buộc';
    } else if (formData.vehicleVin.length !== 17) {
      errors.vehicleVin = 'VIN phải có đúng 17 ký tự';
    }
    
    // Kiểm tra năm sản xuất
    if (!formData.vehicleYear || formData.vehicleYear < 1900 || formData.vehicleYear > new Date().getFullYear() + 1) {
      errors.vehicleYear = 'Năm sản xuất không hợp lệ';
    }
    
    // Kiểm tra màu xe
    if (!formData.vehicleColor.trim()) {
      errors.vehicleColor = 'Màu xe là bắt buộc';
    }
    
    // Kiểm tra loại động cơ
    if (!formData.vehicleEngine.trim()) {
      errors.vehicleEngine = 'Loại động cơ là bắt buộc';
    }
    
    // Kiểm tra khách hàng
    if (!formData.customerId) {
      errors.customerId = 'Khách hàng là bắt buộc';
    }
    
    return errors;
  };

  // ================== MAIN RENDER ==================
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: 'auto' }}>
        
        {/* ================== HEADER SECTION ================== */}
        {/* Header với navigation và tiêu đề */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Navigation và tiêu đề */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: activeView === 'list' ? '20px' : '0' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Nút quay lại tùy theo view hiện tại */}
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
                  <FaArrowLeft /> Quay lại danh sách
                </button>
              ) : (
                <button
                  onClick={() => navigate('/scstaff')}
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
                  <FaArrowLeft /> Quay lại Dashboard
                </button>
              )}
              
              {/* Tiêu đề và mô tả */}
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCar style={{ color: '#10b981' }} />
                  Quản lí Thông Tin Xe
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  {activeView === 'list' && 'Danh sách và quản lý thông tin xe điện'}
                  {activeView === 'form' && (formMode === 'create' ? 'Tạo thông tin xe mới' : 'Cập nhật thông tin xe')}
                  {activeView === 'detail' && 'Xem chi tiết thông tin xe'}
                </p>
              </div>
            </div>
            
            {/* Nút thêm xe mới - chỉ hiện ở view list */}
                  {/* NOTE: 'Thêm xe mới' removed for SCStaff (no create permission) */}
          </div>

          {/* ================== SEARCH SECTION ================== */}
          {/* Phần tìm kiếm - chỉ hiện ở view list */}
          {activeView === 'list' && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Dropdown chọn loại tìm kiếm */}
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
              
              {/* Input tìm kiếm */}
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
              
              {/* Nút tìm kiếm */}
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
              
              {/* Nút xóa bộ lọc */}
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

          {/* ================== STATS SECTION ================== */}
          {/* Thống kê - chỉ hiện ở view list */}
          {activeView === 'list' && (
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>Tổng số xe: <strong>{totalElements}</strong></span>
              <span>Trang {currentPage + 1} / {totalPages}</span>
            </div>
          )}
        </div>

        {/* ================== MAIN CONTENT AREA ================== */}
        {/* Khu vực nội dung chính - thay đổi theo activeView */}
        
        {/* LIST VIEW - Hiển thị danh sách xe */}
        {activeView === 'list' && (
          <>
          <>
            {/* ================== LOADING STATE ================== */}
            {/* Hiển thị loading spinner khi đang tải dữ liệu */}
            {loading ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '60px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <FaSpinner style={{ fontSize: '32px', color: '#10b981', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải danh sách xe...</p>
              </div>
            ) : vehicles.length === 0 ? (
              
              // ================== EMPTY STATE ==================
              // Hiển thị khi không có xe nào
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '60px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <FaCar style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
                <h3 style={{ color: '#374151', marginBottom: '8px' }}>Không có xe nào</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                  {searchTerm ? 'Không tìm thấy xe nào phù hợp với tìm kiếm.' : 'Chưa có xe nào được đăng ký.'}
                </p>
                {/* SCStaff không có quyền tạo xe mới - hiển thị hướng dẫn */}
                <div style={{ color: '#6b7280', marginTop: '12px' }}>
                  Liên hệ Admin hoặc EVM Staff để đăng ký xe mới cho khách hàng.
                </div>
              </div>
            ) : (
              
              // ================== VEHICLE TABLE ==================
              // Bảng hiển thị danh sách xe
              <div style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    
                    {/* ================== TABLE HEADER ================== */}
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                          Thông tin xe
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                          VIN & Model
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                          Thông số
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                          Khách hàng
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    
                    {/* ================== TABLE BODY ================== */}
                    <tbody>
                      {/* Lặp qua từng xe để hiển thị */}
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.vehicleId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          
                          {/* Cột thông tin xe */}
                          <td style={{ padding: '16px' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                {vehicle.vehicleName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaCalendar style={{ fontSize: '12px' }} />
                                  {vehicle.vehicleYear}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaPalette style={{ fontSize: '12px' }} />
                                  {vehicle.vehicleColor}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Cột VIN & Model */}
                          <td style={{ padding: '16px' }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                {vehicle.vehicleModel}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                                <FaBarcode style={{ fontSize: '12px' }} />
                                {vehicle.vehicleVin}
                              </div>
                            </div>
                          </td>
                          
                          {/* Cột thông số */}
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6b7280' }}>
                              <FaCogs style={{ fontSize: '12px' }} />
                              {vehicle.vehicleEngine}
                            </div>
                          </td>
                          
                          {/* Cột khách hàng */}
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                              <FaUser style={{ color: '#6b7280', fontSize: '12px' }} />
                              <div>
                                <div style={{ fontWeight: '500', color: '#374151' }}>
                                  {vehicle.customerName || 'N/A'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                                  {vehicle.customerId}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Cột hành động */}
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {/* Nút xem chi tiết */}
                              <button
                                onClick={() => viewVehicleDetail(vehicle)}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </button>
                              {/* Nút chỉnh sửa */}
                              <button
                                onClick={() => openEditForm(vehicle)}
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
                              {/* Nút xóa bị loại bỏ cho SCStaff (không có quyền) */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ================== PAGINATION ================== */}
                {/* Phân trang - chỉ hiện khi có nhiều hơn 1 trang */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: currentPage === 0 ? '#f9fafb' : 'white',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Trước
                    </button>
                    <span style={{ color: '#6b7280' }}>
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: currentPage >= totalPages - 1 ? '#f9fafb' : 'white',
                        cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
          </>
        )}

        {/* ================== FORM VIEW ================== */}
        {/* Form View cho Create/Edit */}
        {activeView === 'form' && (
          <VehicleForm 
            formMode={formMode}
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            customers={customers}
            onSubmit={handleSubmitVehicle}
            onCancel={closeForm}
          />
        )}

        {/* ================== DETAIL VIEW ================== */}
        {/* Detail View cho xem chi tiết xe */}
        {activeView === 'detail' && selectedVehicle && (
          <VehicleDetail 
            vehicle={selectedVehicle}
            onEdit={() => openEditForm(selectedVehicle)}
          />
        )}
      </div>
      
      {/* ================== CSS ANIMATION ================== */}
      {/* CSS cho animation spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
;

// ================== VEHICLE FORM COMPONENT ==================
// Component form để tạo mới hoặc chỉnh sửa xe
const VehicleForm = ({ formMode, formData, setFormData, formErrors, customers, onSubmit, onCancel }) => {
  // Hàm validate dữ liệu form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.vehicleName.trim()) {
      errors.vehicleName = 'Tên xe là bắt buộc';
    }
    
    if (!formData.vehicleModel.trim()) {
      errors.vehicleModel = 'Model xe là bắt buộc';
    }
    
    if (!formData.vehicleVin.trim()) {
      errors.vehicleVin = 'VIN là bắt buộc';
    } else if (formData.vehicleVin.length !== 17) {
      errors.vehicleVin = 'VIN phải có đúng 17 ký tự';
    }
    
    if (!formData.vehicleYear || formData.vehicleYear < 1900 || formData.vehicleYear > new Date().getFullYear() + 1) {
      errors.vehicleYear = 'Năm sản xuất không hợp lệ';
    }
    
    if (!formData.vehicleColor.trim()) {
      errors.vehicleColor = 'Màu xe là bắt buộc';
    }
    
    if (!formData.vehicleEngine.trim()) {
      errors.vehicleEngine = 'Loại động cơ là bắt buộc';
    }
    
    if (!formData.customerId) {
      errors.customerId = 'Khách hàng là bắt buộc';
    }
    
    return errors;
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      onSubmit();
    }
  };

  // ================== FORM RENDER ==================
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* ================== VEHICLE NAME FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaCar style={{ color: '#6b7280' }} />
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
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ví dụ: Tesla Model 3"
            />
            {formErrors.vehicleName && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleName}
              </p>
            )}
          </div>

          {/* ================== VEHICLE MODEL FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaIdCard style={{ color: '#6b7280' }} />
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
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ví dụ: Model 3 Standard Range"
            />
            {formErrors.vehicleModel && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleModel}
              </p>
            )}
          </div>

          {/* ================== VIN FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaBarcode style={{ color: '#6b7280' }} />
              VIN (Số khung) *
            </label>
            <input
              type="text"
              value={formData.vehicleVin}
              onChange={(e) => setFormData({ ...formData, vehicleVin: e.target.value.toUpperCase() })}
              maxLength={17}
              style={{
                width: '100%',
                padding: '12px',
                border: formErrors.vehicleVin ? '2px solid #ef4444' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
              placeholder="17 ký tự VIN"
            />
            {formErrors.vehicleVin && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleVin}
              </p>
            )}
          </div>

          {/* ================== YEAR FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaCalendar style={{ color: '#6b7280' }} />
              Năm sản xuất *
            </label>
            <input
              type="number"
              value={formData.vehicleYear}
              onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value) })}
              min={1900}
              max={new Date().getFullYear() + 1}
              style={{
                width: '100%',
                padding: '12px',
                border: formErrors.vehicleYear ? '2px solid #ef4444' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.vehicleYear && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleYear}
              </p>
            )}
          </div>

          {/* ================== COLOR FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaPalette style={{ color: '#6b7280' }} />
              Màu xe *
            </label>
            <input
              type="text"
              value={formData.vehicleColor}
              onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: formErrors.vehicleColor ? '2px solid #ef4444' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ví dụ: Trắng, Đen, Xanh"
            />
            {formErrors.vehicleColor && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleColor}
              </p>
            )}
          </div>

          {/* ================== ENGINE FIELD ================== */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaCogs style={{ color: '#6b7280' }} />
              Loại động cơ *
            </label>
            <input
              type="text"
              value={formData.vehicleEngine}
              onChange={(e) => setFormData({ ...formData, vehicleEngine: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: formErrors.vehicleEngine ? '2px solid #ef4444' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ví dụ: Electric Motor, Dual Motor AWD"
            />
            {formErrors.vehicleEngine && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.vehicleEngine}
              </p>
            )}
          </div>

          {/* ================== CUSTOMER SELECTION FIELD ================== */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaUser style={{ color: '#6b7280' }} />
              Khách hàng *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: formErrors.customerId ? '2px solid #ef4444' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
            {formErrors.customerId && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {formErrors.customerId}
              </p>
            )}
          </div>

          {/* ================== FORM ACTIONS ================== */}
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaCar />
              Cập nhật xe
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ================== VEHICLE DETAIL COMPONENT ==================
// Component hiển thị chi tiết thông tin xe
// Lưu ý: SCStaff chỉ được xem và chỉnh sửa, không có quyền xóa
const VehicleDetail = ({ vehicle, onEdit }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'grid', gap: '24px' }}>
        
        {/* ================== BASIC INFO SECTION ================== */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCar style={{ color: '#10b981' }} />
            Thông tin cơ bản
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <strong style={{ color: '#374151' }}>Tên xe:</strong>
              <div style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>
                {vehicle.vehicleName}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Model:</strong>
              <div style={{ color: '#1f2937', marginTop: '4px' }}>
                {vehicle.vehicleModel}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Năm sản xuất:</strong>
              <div style={{ color: '#1f2937', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCalendar style={{ color: '#6b7280', fontSize: '14px' }} />
                {vehicle.vehicleYear}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Màu xe:</strong>
              <div style={{ color: '#1f2937', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaPalette style={{ color: '#6b7280', fontSize: '14px' }} />
                {vehicle.vehicleColor}
              </div>
            </div>
          </div>
        </div>

        {/* ================== TECHNICAL INFO SECTION ================== */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCogs style={{ color: '#10b981' }} />
            Thông số kỹ thuật
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong style={{ color: '#374151' }}>VIN (Số khung):</strong>
              <div style={{ 
                color: '#1f2937', 
                fontFamily: 'monospace', 
                fontSize: '16px', 
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaBarcode style={{ color: '#6b7280' }} />
                {vehicle.vehicleVin}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Loại động cơ:</strong>
              <div style={{ color: '#1f2937', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCogs style={{ color: '#6b7280', fontSize: '14px' }} />
                {vehicle.vehicleEngine}
              </div>
            </div>
          </div>
        </div>

        {/* ================== CUSTOMER INFO SECTION ================== */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser style={{ color: '#10b981' }} />
            Thông tin chủ sở hữu
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong style={{ color: '#374151' }}>Tên khách hàng:</strong>
              <div style={{ color: '#1f2937', marginTop: '4px' }}>
                {vehicle.customerName || 'Không có thông tin'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Customer ID:</strong>
              <div style={{ 
                color: '#1f2937', 
                fontFamily: 'monospace', 
                fontSize: '14px', 
                marginTop: '4px' 
              }}>
                {vehicle.customerId}
              </div>
            </div>
          </div>
        </div>

        {/* ================== ACTION BUTTONS ================== */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onEdit}
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
          {/* Xóa nút Xóa: SCStaff không có quyền xóa */}
        </div>
      </div>
    </div>
  );
};

}
export default VehicleManagement;