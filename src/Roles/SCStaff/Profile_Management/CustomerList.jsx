import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaSearch, 
  FaUserPlus, 
  FaEdit, 
  FaEye,
  FaUsers,
  FaFilter,
  FaDownload,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

/**
 * ================================
 * 📋 CUSTOMER RAW DATA STRUCTURE
 * ================================
 * API Endpoint: GET /api/customers
 * 
 * Response Format từ Backend:
 * {
 *   "content": [
 *     {
 *       "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // UUID - Primary Key
 *       "name": "string",                                      // Tên khách hàng
 *       "email": "string",                                     // Email liên hệ
 *       "phone": "string",                                     // Số điện thoại
 *       "address": "string",                                   // Địa chỉ
 *       "createdAt": "2025-10-12T16:43:18.812Z",              // ISO DateTime
 *       "userId": 0,                                           // ID người dùng (number)
 *       "username": "string"                                   // Username đăng nhập
 *     }
 *   ],
 *   "page": 0,           // Current page number (0-based)
 *   "size": 0,           // Page size
 *   "totalElements": 0,  // Total number of customers
 *   "totalPages": 0,     // Total number of pages
 *   "first": true,       // Is first page
 *   "last": true         // Is last page
 * }
 * 
 * 🎯 Tất cả fields trong content[] đều được hiển thị trong table
 */

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // ================================
  // 📊 TABLE COLUMNS CONFIGURATION
  // ================================
  const CUSTOMER_FIELDS = {
    CUSTOMER_ID: 'customerId',    // UUID - Primary Key
    NAME: 'name',                 // Tên khách hàng
    EMAIL: 'email',               // Email liên hệ  
    PHONE: 'phone',               // Số điện thoại
    ADDRESS: 'address',           // Địa chỉ
    USERNAME: 'username',         // Username đăng nhập
    USER_ID: 'userId',            // ID người dùng (number)
    CREATED_AT: 'createdAt'       // Ngày tạo tài khoản
  };

  const TABLE_COLUMNS = [
    { field: CUSTOMER_FIELDS.CUSTOMER_ID, label: 'Customer ID', sortable: false, width: '120px' },
    { field: CUSTOMER_FIELDS.NAME, label: 'Họ tên', sortable: true, width: 'auto' },
    { field: CUSTOMER_FIELDS.EMAIL, label: 'Email', sortable: true, width: 'auto' },
    { field: CUSTOMER_FIELDS.PHONE, label: 'Số điện thoại', sortable: false, width: '130px' },
    { field: CUSTOMER_FIELDS.ADDRESS, label: 'Địa chỉ', sortable: false, width: '200px' },
    { field: CUSTOMER_FIELDS.USERNAME, label: 'Username', sortable: false, width: '120px' },
    { field: CUSTOMER_FIELDS.USER_ID, label: 'User ID', sortable: false, width: '80px' },
    { field: CUSTOMER_FIELDS.CREATED_AT, label: 'Ngày tạo', sortable: true, width: '120px' },
    { field: 'actions', label: 'Thao tác', sortable: false, width: '120px' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, sortBy, sortDirection, searchTerm]);

  // ============================================
  // 📡 SINGLE API ENDPOINT INTEGRATION
  // ============================================
  // ONLY endpoint used: GET /api/customers
  // Response: { content: [...customers], page, size, totalElements, totalPages, first, last }
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để xem danh sách khách hàng");
        setLoading(false);
        return;
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // GET /api/customers - Returns paginated response with content array
      const response = await fetch(`${API_BASE_URL}api/customers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract customer data from content array and pagination info
        setCustomers(data.content || []);           // Array of customer objects
        setTotalElements(data.totalElements || 0);  // Total number of customers
        setTotalPages(data.totalPages || 0);        // Total pages
        setError("");
      } else if (response.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem('token');
      } else if (response.status === 403) {
        setError("Bạn không có quyền truy cập danh sách khách hàng.");
      } else {
        setError(`Lỗi ${response.status}: Không thể tải danh sách khách hàng`);
      }
    } catch (err) {
      console.error("Customer list fetch error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Có lỗi xảy ra khi tải danh sách khách hàng: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleEditCustomer = (customerId) => {
    console.log('Edit customer:', customerId);
    // TODO: Implement edit functionality
  };

  const handleViewCustomer = (customerId) => {
    console.log('View customer:', customerId);
    // TODO: Implement view functionality
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  };

  const cardStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    padding: "30px 40px",
  };

  const contentStyle = {
    padding: "30px 40px",
  };

  const controlsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  };

  const searchBoxStyle = {
    position: "relative",
    flex: 1,
    maxWidth: "400px",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "12px 16px 12px 45px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  };

  const thStyle = {
    background: "#f9fafb",
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
    fontSize: "13px",
  };

  const tdStyle = {
    padding: "16px 12px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
    color: "#374151",
  };

  const rowStyle = {
    transition: "background-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
            <button
              onClick={() => navigate("/scstaff")}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "14px",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              <FaArrowLeft /> Quay lại
            </button>
            <h1 style={{ fontSize: "28px", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUsers /> Danh sách khách hàng
            </h1>
          </div>
          <p style={{ opacity: 0.9, fontSize: "16px", margin: 0 }}>
            Quản lý thông tin khách hàng trong hệ thống bảo hành EV
          </p>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Controls */}
          <div style={controlsStyle}>
            <div style={searchBoxStyle}>
              <FaSearch style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={handleSearch}
                style={searchInputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              onClick={() => console.log('Add customer clicked')}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#059669";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#10b981";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <FaUserPlus /> Thêm khách hàng
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔄</div>
              <h3>Đang tải danh sách khách hàng...</h3>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #f3f4f6" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={thStyle}>Customer ID</th>
                    <th 
                      style={{...thStyle, cursor: 'pointer'}}
                      onClick={() => handleSort('name')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Họ tên
                        {sortBy === 'name' && (
                          <span style={{ fontSize: '10px' }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      style={{...thStyle, cursor: 'pointer'}}
                      onClick={() => handleSort('email')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Email
                        {sortBy === 'email' && (
                          <span style={{ fontSize: '10px' }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={thStyle}>Số điện thoại</th>
                    <th style={thStyle}>Địa chỉ</th>
                    <th style={thStyle}>Username</th>
                    <th style={thStyle}>User ID</th>
                    <th 
                      style={{...thStyle, cursor: 'pointer'}}
                      onClick={() => handleSort('createdAt')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Ngày tạo
                        {sortBy === 'createdAt' && (
                          <span style={{ fontSize: '10px' }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={thStyle}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer, index) => (
                      <tr 
                        key={customer.customerId || index} 
                        style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={tdStyle}>
                          <div style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '10px', 
                            color: '#6b7280',
                            background: '#f9fafb',
                            padding: '2px 4px',
                            borderRadius: '3px'
                          }}>
                            {customer.customerId || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>
                            {customer.name || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ color: '#3b82f6' }}>
                            {customer.email || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>{customer.phone || 'N/A'}</td>
                        <td style={tdStyle}>
                          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {customer.address || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {customer.username || 'N/A'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ 
                            color: '#dc2626', 
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {customer.userId || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {formatDate(customer.createdAt)}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleViewCustomer(customer.customerId)}
                              style={{
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: '0.3s',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Xem chi tiết"
                              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer.customerId)}
                              style={{
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: '0.3s',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Chỉnh sửa"
                              onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                              onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
                        <h3>Không có khách hàng nào</h3>
                        <p>Danh sách khách hàng hiện đang trống</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && customers.length > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "25px",
              padding: "20px 0",
            }}>
              <div style={{ color: "#6b7280", fontSize: "14px" }}>
                Hiển thị {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} khách hàng
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  style={{
                    background: currentPage === 0 ? "#f3f4f6" : "#f3f4f6",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    opacity: currentPage === 0 ? 0.5 : 1
                  }}
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index)}
                    style={{
                      background: currentPage === index ? "#4f46e5" : "#f3f4f6",
                      color: currentPage === index ? "white" : "#374151",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      fontWeight: currentPage === index ? "600" : "normal"
                    }}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    background: currentPage >= totalPages - 1 ? "#f3f4f6" : "#f3f4f6",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    opacity: currentPage >= totalPages - 1 ? 0.5 : 1
                  }}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
