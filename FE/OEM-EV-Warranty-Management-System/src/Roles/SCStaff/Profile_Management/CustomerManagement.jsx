// ===========================================================================================
// PHẦN 1: IMPORT CÁC THƯ VIỆN VÀ COMPONENTS CẦN THIẾT
// ===========================================================================================

import React, { useState, useEffect } from 'react'; // React hooks để quản lý state và lifecycle
import { useNavigate, useLocation } from 'react-router-dom'; // Hook để điều hướng giữa các trang
import {
  FaUsers,        // Icon nhóm người (cho tiêu đề)
  FaPlus,         // Icon dấu cộng (thêm mới)
  FaEdit,         // Icon bút chì (chỉnh sửa)
  FaEye,          // Icon mắt (xem chi tiết)
  FaSearch,       // Icon kính lúp (tìm kiếm)
  FaUserPlus,     // Icon thêm người dùng
  FaArrowLeft,    // Icon mũi tên quay lại
  FaPhone,        // Icon điện thoại
  FaEnvelope,     // Icon thư (email)
  FaMapMarkerAlt, // Icon vị trí (địa chỉ)
  FaCalendar,     // Icon lịch (ngày tạo)
  FaCheckCircle,  // Icon dấu tích (thành công)
  FaSpinner       // Icon loading xoay tròn
} from 'react-icons/fa';

// ===========================================================================================
// PHẦN 2: COMPONENT CHÍNH VÀ KHAI BÁO CÁC STATE
// ===========================================================================================

const CustomerManagement = () => {
  // Hook để điều hướng trang
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy userId và các thông tin từ navigation state (từ trang tạo tài khoản)
  const { userId, fromAccountCreation, openCreateForm } = location.state || {};

  // ===== CÁC STATE QUẢN LÝ DỮ LIỆU KHÁCH HÀNG =====
  const [customers, setCustomers] = useState([]);              // Danh sách khách hàng
  const [loading, setLoading] = useState(true);                // Trạng thái loading khi fetch data

  // ===== CÁC STATE QUẢN LÝ TÌM KIẾM =====
  const [searchTerm, setSearchTerm] = useState('');            // Từ khóa tìm kiếm
  const [searchType, setSearchType] = useState('name');        // Loại tìm kiếm: name, email, phone

  // ===== CÁC STATE QUẢN LÝ PHÂN TRANG =====
  const [currentPage, setCurrentPage] = useState(0);          // Trang hiện tại (bắt đầu từ 0)
  const [pageSize, setPageSize] = useState(10);               // Số item mỗi trang
  const [totalPages, setTotalPages] = useState(0);            // Tổng số trang
  const [totalElements, setTotalElements] = useState(0);      // Tổng số khách hàng

  // ===== CÁC STATE QUẢN LÝ FORM =====
  const [showCreateForm, setShowCreateForm] = useState(false); // Hiển thị form tạo/sửa
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Khách hàng được chọn để sửa

  // State chứa dữ liệu form
  const [formData, setFormData] = useState({
    name: '',     // Tên khách hàng
    email: '',    // Email khách hàng
    phone: '',    // Số điện thoại
    address: '',  // Địa chỉ
    userId: ''    // ID người dùng liên kết
  });

  // State chứa lỗi validation
  const [formErrors, setFormErrors] = useState({});

  // ===========================================================================================
  // PHẦN 3: DỮ LIỆU MOCK - DỮ LIỆU MẪU CHO DEMO
  // ===========================================================================================

  // Dữ liệu khách hàng mẫu để test khi API không hoạt động
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

  // ===========================================================================================
  // PHẦN 4: USEEFFECT - TẢI DỮ LIỆU KHI COMPONENT MOUNT VÀ KHI THAY ĐỔI TRANG
  // ===========================================================================================

  // Gọi API lấy danh sách khách hàng khi component mount hoặc khi thay đổi trang/pageSize
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize]); // Dependencies: chạy lại khi currentPage hoặc pageSize thay đổi

  // Xử lý khi có userId từ trang tạo tài khoản
  useEffect(() => {
    if (fromAccountCreation && userId && openCreateForm) {
      console.log('🔗 Received userId from account creation:', userId);
      setShowCreateForm(true);
      setFormData(prev => ({
        ...prev,
        userId: userId.toString()
      }));
    }
  }, [fromAccountCreation, userId, openCreateForm]);

  // ===========================================================================================
  // PHẦN 5: HÀM FETCH CUSTOMERS - LẤY DANH SÁCH KHÁCH HÀNG TỪ API
  // ===========================================================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true); // Bật trạng thái loading
      const token = localStorage.getItem('token'); // Lấy token xác thực

      // ===== KIỂM TRA TOKEN =====
      if (!token) {
        console.error('No token found');
        // Fallback: sử dụng dữ liệu mock khi không có token
        setCustomers(mockCustomers);
        setTotalElements(mockCustomers.length);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      // ===== XÂY DỰNG URL API DỰA TRÊN LOẠI TÌM KIẾM =====
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      let url = `${API_BASE_URL}/api/customers?page=${currentPage}&size=${pageSize}`;

      // Nếu có từ khóa tìm kiếm, thay đổi URL tương ứng
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

      // ===== GỬI REQUEST TỚI API =====
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token để xác thực
          'Content-Type': 'application/json'
        }
      });

      // ===== XỬ LÝ RESPONSE THÀNH CÔNG =====
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Customers fetched:', data);

        // Xử lý dữ liệu response khác nhau cho từng loại tìm kiếm
        if (searchType === 'email' || searchType === 'phone') {
          // Response trả về 1 khách hàng duy nhất (search by email/phone)
          setCustomers([data]);
          setTotalElements(1);
          setTotalPages(1);
        } else {
          // Response trả về dữ liệu phân trang (search by name hoặc get all)
          setCustomers(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        // ===== XỬ LÝ KHI API TRẢ VỀ LỖI =====
        console.error('Failed to fetch customers:', response.status);
        // Fallback: sử dụng dữ liệu mock
        setCustomers(mockCustomers);
        setTotalElements(mockCustomers.length);
        setTotalPages(1);
      }
    } catch (error) {
      // ===== XỬ LÝ LỖI NETWORK/CONNECTION =====
      console.error('Error fetching customers:', error);
      // Fallback: sử dụng dữ liệu mock
      setCustomers(mockCustomers);
      setTotalElements(mockCustomers.length);
      setTotalPages(1);
    } finally {
      // ===== LUÔN TẮT LOADING SAU KHI XONG =====
      setLoading(false);
    }
  };

  // ===========================================================================================
  // PHẦN 6: CÁC HÀM XỬ LÝ TÌM KIẾM
  // ===========================================================================================

  // Thực hiện tìm kiếm (reset về trang đầu và gọi lại API)
  const handleSearch = () => {
    setCurrentPage(0);  // Reset về trang đầu tiên
    fetchCustomers();   // Gọi lại API với từ khóa tìm kiếm
  };

  // Xóa từ khóa tìm kiếm và load lại toàn bộ dữ liệu
  const clearSearch = () => {
    setSearchTerm('');    // Xóa từ khóa
    setCurrentPage(0);    // Reset về trang đầu
    fetchCustomers();     // Load lại toàn bộ dữ liệu
  };

  // ===========================================================================================
  // PHẦN 7: HÀM XỬ LÝ TẠO/CHỈNH SỬA KHÁCH HÀNG
  // ===========================================================================================

  const handleCreateCustomer = async (e) => {
    e.preventDefault(); // Ngăn form reload trang

    // ===== BƯỚC 1: VALIDATE DỮ LIỆU =====
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Dừng lại nếu có lỗi validation
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // ===== BƯỚC 2: PHÂN BIỆT TẠO MỚI VÀ CHỈNH SỬA =====
      const isEditing = selectedCustomer !== null;
      const url = isEditing
        ? `${API_BASE_URL}/api/customers/${selectedCustomer.customerId}`
        : `${API_BASE_URL}/api/customers`;
      const method = isEditing ? 'PUT' : 'POST';

      // ===== BƯỚC 3: GỬI REQUEST =====
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData) // Gửi dữ liệu form dưới dạng JSON
      });

      // ===== BƯỚC 4: XỬ LÝ RESPONSE THÀNH CÔNG =====
      if (response.ok) {
        const customerData = await response.json();
        console.log(`✅ Customer ${isEditing ? 'updated' : 'created'}:`, customerData);

        if (isEditing) {
          // Cập nhật khách hàng trong danh sách
          setCustomers(prev => prev.map(customer =>
            customer.customerId === selectedCustomer.customerId
              ? { ...customer, ...formData } // merge dữ liệu mới vào khách hàng cũ
              : customer
          ));
          alert('Khách hàng đã được cập nhật thành công!');
        } else {
          // Thêm khách hàng mới vào đầu danh sách
          setCustomers(prev => [customerData, ...prev]);
          setTotalElements(prev => prev + 1);
          alert('Khách hàng đã được tạo thành công!');
        }

        // Reset form sau khi hoàn thành
        setFormData({ name: '', email: '', phone: '', address: '', userId: '' });
        setSelectedCustomer(null);
        setShowCreateForm(false);

      } else {
        // ===== BƯỚC 5: XỬ LÝ LỖI TỪ API =====
        const error = await response.json();
        alert(`${isEditing ? 'Cập nhật' : 'Tạo'} khách hàng thất bại: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      // ===== BƯỚC 6: XỬ LÝ LỖI NETWORK =====
      console.error(`Error ${selectedCustomer ? 'updating' : 'creating'} customer:`, error);
      alert(`Lỗi khi ${selectedCustomer ? 'cập nhật' : 'tạo'} khách hàng. Vui lòng thử lại.`);
    }
  };

  // ===========================================================================================
  // PHẦN 8: HÀM VALIDATION FORM - KIỂM TRA DỮ LIỆU ĐẦU VÀO
  // ===========================================================================================

  const validateForm = () => {
    const errors = {};

    // ===== VALIDATION CHO TÊN KHÁCH HÀNG =====
    if (!formData.name.trim()) {
      errors.name = 'Tên khách hàng là bắt buộc';
    }

    // ===== VALIDATION CHO EMAIL =====
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // ===== VALIDATION CHO SỐ ĐIỆN THOẠI =====
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(\+84|0)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    // ===== VALIDATION CHO ĐỊA CHỈ =====
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }

    return errors; // Trả về object chứa các lỗi
  };

  // ===========================================================================================
  // PHẦN 9: HÀM XỬ LÝ CHỈNH SỬA KHÁCH HÀNG
  // ===========================================================================================

  // Mở form chỉnh sửa với dữ liệu của khách hàng được chọn
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);          // Lưu khách hàng được chọn
    // Điền dữ liệu khách hàng vào form
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      userId: customer.userId
    });
    setShowCreateForm(true);               // Hiển thị form (dùng chung form create/edit)
  };



  // ===========================================================================================
  // PHẦN 11: HÀM TIỆN ÍCH - FORMAT NGÀY THÁNG
  // ===========================================================================================

  // Chuyển đổi string ISO date thành định dạng ngày tháng Việt Nam
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',    // Năm đầy đủ (VD: 2024)
      month: '2-digit',   // Tháng 2 chữ số (VD: 01, 12)
      day: '2-digit',     // Ngày 2 chữ số (VD: 05, 25)
      hour: '2-digit',    // Giờ 2 chữ số (VD: 09, 14)
      minute: '2-digit'   // Phút 2 chữ số (VD: 30, 45)
    });
  };

  // ===========================================================================================
  // PHẦN 12: RENDER UI - HIỂN THỊ GIAO DIỆN NGƯỜI DÙNG
  // ===========================================================================================

  return (
    // Container chính với background gradient
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: 'auto' }}>

        {/* ===== HEADER SECTION - TIÊU ĐỀ VÀ CÁC NÚT HÀNH ĐỘNG ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Nút quay lại Dashboard */}
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
              {/* Tiêu đề và mô tả trang */}
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
            {/* Nút tạo khách hàng mới */}
            <button
              onClick={() => {
                setShowCreateForm(true);           // Hiển thị form
                setSelectedCustomer(null);         // Reset customer được chọn (để biết là tạo mới)
                setFormData({ name: '', email: '', phone: '', address: '', userId: '' }); // Reset form data
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

          {/* Success notification when coming from account creation */}
          {fromAccountCreation && userId && (
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #059669'
            }}>
              <FaCheckCircle />
              <span>
                Tài khoản đã được tạo thành công với User ID: <strong>{userId}</strong>.
                Vui lòng điền thông tin khách hàng bên dưới để hoàn tất hồ sơ.
              </span>
            </div>
          )}

          {/* ===== SEARCH SECTION - PHẦN TÌM KIẾM ===== */}
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
              <option value="name">Tìm theo tên</option>
              <option value="email">Tìm theo email</option>
              <option value="phone">Tìm theo SĐT</option>
            </select>
            {/* Input nhập từ khóa tìm kiếm */}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Cho phép search bằng Enter
            />
            {/* Nút tìm kiếm */}
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
            {/* Nút xóa bộ lọc (chỉ hiện khi có từ khóa) */}
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

          {/* ===== STATS SECTION - THỐNG KÊ SỐ LIỆU ===== */}
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

        {/* ===== CUSTOMER LIST SECTION - DANH SÁCH KHÁCH HÀNG ===== */}
        {loading ? (
          // Hiển thị loading spinner khi đang tải dữ liệu
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
          // Hiển thị empty state khi không có khách hàng
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
          // Hiển thị bảng danh sách khách hàng
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              {/* ===== TABLE HEADER - TIÊU ĐỀ BẢNG ===== */}
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
                {/* ===== TABLE BODY - NỘI DUNG BẢNG ===== */}
                <tbody>
                  {customers.map((customer, index) => (
                    // Mỗi hàng trong bảng đại diện cho 1 khách hàng
                    <tr
                      key={customer.customerId}
                      style={{
                        borderBottom: index < customers.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { background: '#f9fafb' }
                      }}
                    >
                      {/* Cột thông tin khách hàng */}
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                            {customer.name}
                          </div>
                          {/* Customer ID hidden for privacy */}
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            User ID: {customer.userId} ({customer.username})
                          </div>
                        </div>
                      </td>
                      {/* Cột thông tin liên hệ */}
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
                      {/* Cột địa chỉ */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '14px' }}>
                          <FaMapMarkerAlt style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }} />
                          <span style={{ lineHeight: '1.4' }}>{customer.address}</span>
                        </div>
                      </td>
                      {/* Cột ngày tạo */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                          <FaCalendar style={{ fontSize: '12px' }} />
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                      {/* Cột các nút thao tác */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {/* Nút chỉnh sửa */}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== PAGINATION SECTION - PHÂN TRANG ===== */}
            {totalPages > 1 && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Thông tin số lượng hiển thị */}
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} khách hàng
                </div>
                {/* Các nút điều hướng phân trang */}
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

        {/* ===== CREATE/EDIT FORM MODAL - FORM TẠO/CHỈNH SỬA KHÁCH HÀNG ===== */}
        {showCreateForm && (
          // Overlay che màn hình
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)', // Nền đen mờ
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000 // Hiển thị trên cùng
          }}>
            {/* Modal content */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              {/* Tiêu đề form */}
              <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
                {selectedCustomer ? 'Chỉnh sửa khách hàng' : 'Tạo khách hàng mới'}
              </h2>

              <form onSubmit={handleCreateCustomer}>
                {/* ===== TRƯỜNG TÊN KHÁCH HÀNG ===== */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                {/* ===== TRƯỜNG EMAIL ===== */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                {/* ===== TRƯỜNG SỐ ĐIỆN THOẠI ===== */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

                {/* ===== TRƯỜNG ĐỊA CHỈ ===== */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Địa chỉ *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

                {/* ===== TRƯỜNG USER ID (TÙY CHỌN) ===== */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    User ID (tùy chọn)
                  </label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
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

                {/* ===== CÁC NÚT HÀNH ĐỘNG ===== */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {/* Nút Hủy */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);        // Đóng form
                      setSelectedCustomer(null);       // Reset customer được chọn
                      setFormData({ name: '', email: '', phone: '', address: '', userId: '' }); // Reset form data
                      setFormErrors({});               // Reset lỗi
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
                  {/* Nút Submit */}
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