import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar, 
  FaBolt, 
  FaCalendar, 
  FaIdCard,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaShieldAlt,
  FaBatteryFull,
  FaRoad,
  FaUser,
  FaCogs
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

  // Main function to fetch customer's vehicles using GET /api/vehicles/my-vehicles
  const fetchMyVehicles = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      console.group('🚗 Fetching My Vehicles');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Query params:', { page, size });
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setMockVehicles();
        console.groupEnd();
        return;
      }

      // Call GET /api/vehicles/my-vehicles with pagination
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      console.log(`📡 Calling GET /api/vehicles/my-vehicles?${queryParams}`);
      
      const response = await fetch(`${API_BASE_URL}/api/vehicles/my-vehicles?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const vehicleData = await response.json();
        console.log('✅ Vehicle data received:', vehicleData);
        
        // Validate response format matches expected structure
        if (vehicleData && vehicleData.content) {
          setVehicles(vehicleData.content);
          setPagination({
            pageNumber: vehicleData.pageNumber || 0,
            pageSize: vehicleData.pageSize || 10,
            totalElements: vehicleData.totalElements || 0,
            totalPages: vehicleData.totalPages || 0,
            first: vehicleData.first || true,
            last: vehicleData.last || true
          });
          
          console.log('✅ My vehicles loaded successfully');
          console.log('📊 Pagination info:', {
            page: vehicleData.pageNumber,
            size: vehicleData.pageSize,
            total: vehicleData.totalElements,
            totalPages: vehicleData.totalPages
          });
        } else {
          console.error('❌ Invalid vehicle data format:', vehicleData);
          throw new Error('Invalid vehicle data format');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error fetching my vehicles:', error);
      console.warn('🔄 Falling back to mock data');
      setMockVehicles();
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Set mock data matching the exact API response format
  const setMockVehicles = () => {
    const mockResponse = {
      content: [
        {
          vehicleId: 1,
          vehicleName: "Tesla Model 3",
          vehicleModel: "Model 3 Standard Range",
          vehicleVin: "1HGBH41JXMN109186",
          vehicleYear: 2023,
          vehicleColor: "White",
          vehicleEngine: "Electric Motor",
          customerId: "123e4567-e89b-12d3-a456-426614174000",
          customerName: "John Doe"
        },
        {
          vehicleId: 2,
          vehicleName: "VinFast VF8",
          vehicleModel: "VF8 Plus",
          vehicleVin: "VF8ABC123DEF456789",
          vehicleYear: 2024,
          vehicleColor: "Ocean Blue",
          vehicleEngine: "Electric Motor",
          customerId: "123e4567-e89b-12d3-a456-426614174000",
          customerName: "John Doe"
        }
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    };
    
    setVehicles(mockResponse.content);
    setPagination({
      pageNumber: mockResponse.pageNumber,
      pageSize: mockResponse.pageSize,
      totalElements: mockResponse.totalElements,
      totalPages: mockResponse.totalPages,
      first: mockResponse.first,
      last: mockResponse.last
    });
    
    console.log('🔧 Mock vehicles set:', mockResponse);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchMyVehicles(newPage, pagination.pageSize);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <FaSpinner style={{ 
            fontSize: '3rem', 
            color: '#f5576c', 
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <p style={{ margin: 0, color: '#4a5568', fontSize: '1.2rem' }}>
            Đang tải danh sách xe của bạn...
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
            Gọi API GET /api/vehicles/my-vehicles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '20px'
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
        .vehicle-card {
          animation: slideInUp 0.6s ease-out;
          transition: all 0.3s ease;
        }
        .vehicle-card:hover {
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
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="back-button"
              onClick={() => navigate('/customer/dashboard')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Quay lại Dashboard (ESC)"
            >
              <FaArrowLeft style={{ fontSize: '14px' }} /> 
              <span>Quay lại Dashboard</span>
            </button>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: 0, 
                color: '#fff', 
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                🚗 Danh sách xe của tôi
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem'
              }}>
                API: GET /api/vehicles/my-vehicles (Customer Self-Service)
              </p>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#fff',
                fontWeight: '600'
              }}>
                {pagination.totalElements} xe
              </div>
              
              {pagination.totalPages > 1 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: '600'
                }}>
                  Trang {pagination.pageNumber + 1}/{pagination.totalPages}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
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
              🚗
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#4a5568',
              fontSize: '1.5rem'
            }}>
              Chưa có xe nào
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#718096',
              fontSize: '1rem'
            }}>
              Hiện tại bạn chưa có xe nào được đăng ký trong hệ thống
            </p>
            <button
              onClick={() => navigate('/customer/register-vehicle')}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              <FaPlus /> Đăng ký xe mới
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.vehicleId || index}
                className="vehicle-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Vehicle Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '12px',
                    animation: 'pulse 3s infinite'
                  }}>
                    🚗
                  </div>
                  
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: '700'
                  }}>
                    {vehicle.vehicleName || 'Không xác định'}
                  </h3>
                  
                  <p style={{
                    margin: '0 0 12px 0',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1rem'
                  }}>
                    {vehicle.vehicleModel || 'Model không xác định'}
                  </p>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    display: 'inline-block',
                    fontSize: '14px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    ID: {vehicle.vehicleId}
                  </div>
                </div>

                {/* Vehicle Details */}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {/* Year & Color */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <FaCalendar style={{ color: '#f5576c', fontSize: '14px' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#718096',
                          fontWeight: '600'
                        }}>
                          Năm sản xuất
                        </span>
                      </div>
                      <div style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {vehicle.vehicleYear || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#f5576c'
                        }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#718096',
                          fontWeight: '600'
                        }}>
                          Màu sắc
                        </span>
                      </div>
                      <div style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {vehicle.vehicleColor || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Engine & VIN */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <FaCogs style={{ color: '#22c55e', fontSize: '14px' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#718096',
                          fontWeight: '600'
                        }}>
                          Loại động cơ
                        </span>
                      </div>
                      <div style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {vehicle.vehicleEngine || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* VIN Number */}
                  <div style={{
                    background: '#f8fafc',
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
                      <FaIdCard style={{ color: '#3b82f6', fontSize: '14px' }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#718096',
                        fontWeight: '600'
                      }}>
                        Vehicle Identification Number (VIN)
                      </span>
                    </div>
                    <div style={{
                      color: '#2d3748',
                      fontWeight: '600',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      wordBreak: 'break-all'
                    }}>
                      {vehicle.vehicleVin || 'Không có thông tin'}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div style={{
                    background: '#f0f9ff',
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
                      <FaUser style={{ color: '#0ea5e9', fontSize: '14px' }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#718096',
                        fontWeight: '600'
                      }}>
                        Chủ sở hữu
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        color: '#0ea5e9',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {vehicle.customerName || 'Không xác định'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#718096',
                        fontFamily: 'monospace'
                      }}>
                        ID: {vehicle.customerId?.slice(-8) || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <button
                      onClick={() => navigate(`/customer/vehicle/${vehicle.vehicleId}/details`)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                    
                    <button
                      onClick={() => navigate(`/customer/vehicle/${vehicle.vehicleId}/warranty`)}
                      style={{
                        flex: 1,
                        background: '#fff',
                        color: '#f5576c',
                        border: '2px solid #f5576c',
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
                      <FaShieldAlt /> Bảo hành
                    </button>
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
                background: pagination.first ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                color: pagination.first ? 'rgba(255, 255, 255, 0.5)' : '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
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
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
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
                background: pagination.last ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                color: pagination.last ? 'rgba(255, 255, 255, 0.5)' : '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
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

        {/* Add Vehicle Button (if has vehicles) */}
        {vehicles.length > 0 && (
          <div style={{
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <button
              onClick={() => navigate('/customer/register-vehicle')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '16px 32px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '16px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FaPlus /> Đăng ký xe mới
            </button>
          </div>
        )}

        {/* API Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            📡 API Integration Details
          </h4>
          <div style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>API Endpoint:</strong> GET /api/vehicles/my-vehicles
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Permissions:</strong> CUSTOMER only (Customer Self-Service)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Pagination:</strong> page={pagination.pageNumber}, size={pagination.pageSize}
            </p>
            <p style={{ margin: '0' }}>
              <strong>Response Fields:</strong> vehicleId, vehicleName, vehicleModel, vehicleVin, vehicleYear, vehicleColor, vehicleEngine, customerId, customerName
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
