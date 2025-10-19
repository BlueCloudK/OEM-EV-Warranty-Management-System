import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaClock, 
  FaCalendar, 
  FaIdCard,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCar,
  FaUser,
  FaFileAlt,
  FaWrench
} from 'react-icons/fa';

const WarrantyHistory = () => {
  const navigate = useNavigate();
  const [warrantyRequests, setWarrantyRequests] = useState([]);
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
    fetchWarrantyHistory();
    
    // Add keyboard shortcut for back navigation
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate('/customer/dashboard');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // Main function to fetch warranty history
  const fetchWarrantyHistory = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      console.group('🛡️ Fetching Warranty History');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Query params:', { page, size });
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setMockWarrantyHistory();
        console.groupEnd();
        return;
      }

      // Call GET /api/warranty-claims/my-claims (assuming this endpoint for customer's warranty claims)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      console.log(`📡 Calling GET /api/warranty-claims/my-claims?${queryParams}`);
      
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/my-claims?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const warrantyData = await response.json();
        console.log('✅ Warranty data received:', warrantyData);
        
        // Handle both paginated and array responses
        if (warrantyData && warrantyData.content) {
          setWarrantyRequests(warrantyData.content);
          setPagination({
            pageNumber: warrantyData.pageNumber || 0,
            pageSize: warrantyData.pageSize || 10,
            totalElements: warrantyData.totalElements || 0,
            totalPages: warrantyData.totalPages || 0,
            first: warrantyData.first || true,
            last: warrantyData.last || true
          });
        } else if (Array.isArray(warrantyData)) {
          setWarrantyRequests(warrantyData);
          setPagination({
            pageNumber: 0,
            pageSize: warrantyData.length,
            totalElements: warrantyData.length,
            totalPages: 1,
            first: true,
            last: true
          });
        }
        
        console.log('✅ Warranty history loaded successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error fetching warranty history:', error);
      console.warn('🔄 Falling back to mock data');
      setMockWarrantyHistory();
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Set mock warranty history data
  const setMockWarrantyHistory = () => {
    const mockData = {
      content: [
        {
          claimId: 1,
          claimNumber: "WC-2024-001",
          vehicleId: 1,
          vehicleName: "Tesla Model 3",
          vehicleModel: "Model 3 Standard Range",
          issueDescription: "Pin sạc không hoạt động, không thể sạc được điện",
          status: "COMPLETED",
          statusText: "Hoàn thành",
          priority: "HIGH",
          priorityText: "Cao",
          createdDate: "2024-08-15T09:30:00Z",
          completedDate: "2024-08-20T14:45:00Z",
          estimatedCompletionDate: "2024-08-22T17:00:00Z",
          serviceCenter: "Trung tâm VinFast Hà Nội",
          technician: "Nguyễn Văn Tâm",
          cost: 0,
          customerName: "John Doe"
        },
        {
          claimId: 2,
          claimNumber: "WC-2024-002",
          vehicleId: 2,
          vehicleName: "VinFast VF8",
          vehicleModel: "VF8 Plus",
          issueDescription: "Hệ thống phanh ABS có tiếng kêu bất thường",
          status: "IN_PROGRESS",
          statusText: "Đang xử lý",
          priority: "MEDIUM",
          priorityText: "Trung bình",
          createdDate: "2024-10-10T11:15:00Z",
          completedDate: null,
          estimatedCompletionDate: "2024-10-25T16:00:00Z",
          serviceCenter: "Trung tâm VinFast TP.HCM",
          technician: "Trần Thị Lan",
          cost: null,
          customerName: "John Doe"
        },
        {
          claimId: 3,
          claimNumber: "WC-2024-003",
          vehicleId: 1,
          vehicleName: "Tesla Model 3",
          vehicleModel: "Model 3 Standard Range",
          issueDescription: "Màn hình trung tâm bị đen, không hiển thị gì",
          status: "PENDING",
          statusText: "Chờ xử lý",
          priority: "LOW",
          priorityText: "Thấp",
          createdDate: "2024-10-16T08:20:00Z",
          completedDate: null,
          estimatedCompletionDate: "2024-10-30T12:00:00Z",
          serviceCenter: "Chưa phân công",
          technician: null,
          cost: null,
          customerName: "John Doe"
        },
        {
          claimId: 4,
          claimNumber: "WC-2024-004",
          vehicleId: 2,
          vehicleName: "VinFast VF8",
          vehicleModel: "VF8 Plus",
          issueDescription: "Cửa xe tự động không đóng mở được",
          status: "REJECTED",
          statusText: "Từ chối",
          priority: "MEDIUM",
          priorityText: "Trung bình",
          createdDate: "2024-09-05T14:30:00Z",
          completedDate: "2024-09-06T10:15:00Z",
          estimatedCompletionDate: null,
          serviceCenter: "Trung tâm VinFast Đà Nẵng",
          technician: "Lê Văn Hùng",
          cost: 0,
          customerName: "John Doe",
          rejectionReason: "Không thuộc phạm vi bảo hành - do tác động bên ngoài"
        }
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 4,
      totalPages: 1,
      first: true,
      last: true
    };
    
    setWarrantyRequests(mockData.content);
    setPagination({
      pageNumber: mockData.pageNumber,
      pageSize: mockData.pageSize,
      totalElements: mockData.totalElements,
      totalPages: mockData.totalPages,
      first: mockData.first,
      last: mockData.last
    });
    
    console.log('🔧 Mock warranty history set:', mockData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#22c55e';
      case 'IN_PROGRESS':
        return '#f59e0b';
      case 'PENDING':
        return '#6b7280';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <FaCheckCircle />;
      case 'IN_PROGRESS':
        return <FaHourglassHalf />;
      case 'PENDING':
        return <FaClock />;
      case 'REJECTED':
        return <FaTimesCircle />;
      default:
        return <FaExclamationCircle />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchWarrantyHistory(newPage, pagination.pageSize);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e6edf3'
        }}>
          <FaSpinner style={{ 
            fontSize: '3rem', 
            color: '#0f172a', 
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <p style={{ margin: 0, color: '#4a5568', fontSize: '1.2rem' }}>
            Đang tải lịch sử bảo hành...
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
            Gọi API GET /api/warranty-claims/my-claims
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px',
      color: '#1f2937'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .warranty-card {
          animation: slideInUp 0.6s ease-out;
          transition: all 0.3s ease;
        }
        .warranty-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .back-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .back-button:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .back-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        .back-button:hover::before {
          left: 100%;
        }
        .page-button {
          transition: all 0.2s ease;
        }
        .page-button:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e6edf3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="back-button"
              onClick={() => navigate('/customer/dashboard')}
              style={{
                background: '#f3f4f6',
                color: '#1f2937',
                border: '2px solid #e5e7eb',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
                fontWeight: '600',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Quay lại Dashboard (ESC)"
            >
              <FaArrowLeft style={{ fontSize: '14px', color: '#1f2937' }} /> 
              <span>Quay lại</span>
            </button>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: 0, 
                color: '#1f2937', 
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                🛡️ Xem trạng thái bảo hành
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: '#4b5563',
                fontSize: '1rem'
              }}>
                Theo dõi tình trạng yêu cầu bảo hành của bạn
              </p>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: '#eef2f6',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                {pagination.totalElements} yêu cầu
              </div>
              
              {pagination.totalPages > 1 && (
                <div style={{
                  background: '#eef2f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '600'
                }}>
                  Trang {pagination.pageNumber + 1}/{pagination.totalPages}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warranty Requests List */}
        {warrantyRequests.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              fontSize: '5rem',
              marginBottom: '20px',
              opacity: '0.5'
            }}>
              🛡️
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#4a5568',
              fontSize: '1.5rem'
            }}>
              Chưa có yêu cầu bảo hành
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#718096',
              fontSize: '1rem'
            }}>
              Bạn chưa có yêu cầu bảo hành nào trong hệ thống
            </p>
            <button
              onClick={() => navigate('/customer/warranty/new-claim')}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <FaPlus /> Tạo yêu cầu bảo hành mới
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '20px'
          }}>
            {warrantyRequests.map((request, index) => (
              <div
                key={request.claimId || index}
                className="warranty-card"
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid #e6edf3',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Request Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '2rem',
                      color: '#fff'
                    }}>
                      🛡️
                    </div>
                    <div>
                      <h3 style={{
                        margin: '0 0 4px 0',
                        color: '#1f2937',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {request.claimNumber || `Yêu cầu #${request.claimId}`}
                      </h3>
                      <p style={{
                        margin: 0,
                        color: '#374151',
                        fontSize: '0.9rem'
                      }}>
                        {request.vehicleName} - {request.vehicleModel}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* Status Badge */}
                    <div style={{
                      background: getStatusColor(request.status),
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {getStatusIcon(request.status)}
                      {request.statusText || request.status}
                    </div>

                    {/* Priority badge removed by request */}
                  </div>
                </div>

                {/* Request Details */}
                <div style={{ padding: '24px' }}>
                  {/* Issue Description */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <FaFileAlt style={{ color: '#4facfe', fontSize: '14px' }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Mô tả vấn đề
                      </span>
                    </div>
                    <p style={{
                      color: '#2d3748',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      {request.issueDescription || 'Không có mô tả'}
                    </p>
                  </div>

                  {/* Key Information Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Dates */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <FaCalendar style={{ color: '#4facfe', fontSize: '14px' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#718096',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Thông tin thời gian
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: '#718096' }}>Ngày tạo: </span>
                          <span style={{ color: '#2d3748', fontWeight: '600' }}>
                            {formatDate(request.createdDate)}
                          </span>
                        </div>
                        {request.completedDate && (
                          <div style={{ marginBottom: '4px' }}>
                            <span style={{ color: '#718096' }}>Hoàn thành: </span>
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>
                              {formatDate(request.completedDate)}
                            </span>
                          </div>
                        )}
                        {request.estimatedCompletionDate && (
                          <div>
                            <span style={{ color: '#718096' }}>Dự kiến: </span>
                            <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                              {formatDate(request.estimatedCompletionDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Info */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <FaWrench style={{ color: '#4facfe', fontSize: '14px' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#718096',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Thông tin xử lý
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: '#718096' }}>Trung tâm: </span>
                          <span style={{ color: '#2d3748', fontWeight: '600' }}>
                            {request.serviceCenter || 'Chưa phân công'}
                          </span>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: '#718096' }}>Kỹ thuật viên: </span>
                          <span style={{ color: '#2d3748', fontWeight: '600' }}>
                            {request.technician || 'Chưa phân công'}
                          </span>
                        </div>
                        {request.cost !== null && (
                          <div>
                            <span style={{ color: '#718096' }}>Chi phí: </span>
                            <span style={{ 
                              color: request.cost === 0 ? '#22c55e' : '#f59e0b', 
                              fontWeight: '600' 
                            }}>
                              {request.cost === 0 ? 'Miễn phí' : `${request.cost?.toLocaleString('vi-VN')} VNĐ`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <FaTimesCircle style={{ color: '#ef4444', fontSize: '14px' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#ef4444',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Lý do từ chối
                        </span>
                      </div>
                      <p style={{
                        color: '#991b1b',
                        fontSize: '14px',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {request.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => navigate(`/customer/warranty/claim/${request.claimId}/details`)}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <FaEye /> Chi tiết
                    </button>
                    
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => navigate(`/customer/warranty/claim/${request.claimId}/edit`)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          background: '#fff',
                          color: '#4facfe',
                          border: '2px solid #4facfe',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        <FaEdit /> Chỉnh sửa
                      </button>
                    )}

                    {(request.status === 'COMPLETED' || request.status === 'REJECTED') && (
                      <button
                        onClick={() => navigate(`/customer/warranty/new-claim?vehicleId=${request.vehicleId}`)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          background: '#f8fafc',
                          color: '#4a5568',
                          border: '2px solid #e2e8f0',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        <FaPlus /> Yêu cầu mới
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '32px',
            padding: '20px'
          }}>
            <button
              className="page-button"
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.first}
              style={{
                background: pagination.first ? '#eef2f6' : '#e6f0fb',
                color: pagination.first ? '#9ca3af' : '#1f2937',
                border: '1px solid #e5e7eb',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: pagination.first ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Trước
            </button>

            <div style={{
              background: '#eef2f6',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#1f2937',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {pagination.pageNumber + 1} / {pagination.totalPages}
            </div>

            <button
              className="page-button"
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={pagination.last}
              style={{
                background: pagination.last ? '#eef2f6' : '#e6f0fb',
                color: pagination.last ? '#9ca3af' : '#1f2937',
                border: '1px solid #e5e7eb',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: pagination.last ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Sau →
            </button>
          </div>
        )}

        {/* Create New Claim Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px'
        }}>
        </div>


      </div>
    </div>
  );
};

export default WarrantyHistory;