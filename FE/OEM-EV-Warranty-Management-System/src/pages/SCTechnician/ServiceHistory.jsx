import React, { useState, useEffect } from 'react';
import * as S from './ServiceHistory.styles';
import {
  FaHistory, FaSearch, FaSpinner, FaInfoCircle, FaCalendar,
  FaCar, FaCog, FaPlus, FaEdit, FaFilter, FaEye, FaTimes
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const ServiceHistory = () => {
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'vehicle', 'dateRange'
  const [vehicleId, setVehicleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    fetchServiceHistories();
  }, [page]);

  const fetchServiceHistories = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = `/api/service-histories?page=${page}&size=10`;
      if (searchValue.trim()) {
        endpoint += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient(endpoint);
      console.log('📋 Service histories:', response);
      console.log('📋 Sample structure:', response.content?.[0]); // Log cấu trúc dữ liệu

      if (response.content) {
        setServiceHistories(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching service histories:', err);
      setError(err.message || 'Không thể tải lịch sử sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const fetchByVehicle = async (vehicleIdParam) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/service-histories/by-vehicle/${vehicleIdParam}?page=0&size=100`);
      console.log('📋 Service histories by vehicle:', response);

      if (response.content) {
        setServiceHistories(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching service histories by vehicle:', err);
      setError(err.message || 'Không thể tải lịch sử sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const fetchByDateRange = async (start, end) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(
        `/api/service-histories/by-date-range?startDate=${start}&endDate=${end}&page=0&size=100`
      );
      console.log('📋 Service histories by date range:', response);

      if (response.content) {
        setServiceHistories(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching service histories by date:', err);
      setError(err.message || 'Không thể tải lịch sử sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchServiceHistories();
  };

  const handleFilterApply = (e) => {
    e.preventDefault();

    if (filterType === 'vehicle' && vehicleId.trim()) {
      fetchByVehicle(vehicleId.trim());
    } else if (filterType === 'dateRange' && startDate && endDate) {
      fetchByDateRange(startDate, endDate);
    } else {
      fetchServiceHistories();
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setVehicleId('');
    setStartDate('');
    setEndDate('');
    setFilterType('all');
    setPage(0);
    fetchServiceHistories();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',  
      month: '2-digit',
      day: '2-digit'
    });
  };

  const openDetailModal = (history) => {
    console.log('📋 Full data object:', history);
    console.log('📋 All available keys:', Object.keys(history));
    setSelectedHistory(history);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedHistory(null);
    setShowDetailModal(false);
  };

  // Function to translate field names to Vietnamese
  const translateFieldName = (fieldName) => {
    const translations = {
      // Service History fields
      'serviceHistoryId': 'ID Lịch sử',
      'serviceDate': 'Ngày sửa chữa',
      'serviceType': 'Loại dịch vụ',
      'description': 'Mô tả',
      'cost': 'Chi phí',
      'status': 'Trạng thái',
      'notes': 'Ghi chú',
      'createdDate': 'Ngày tạo',
      'updatedDate': 'Ngày cập nhật',
      'createdBy': 'Người tạo',
      'updatedBy': 'Người cập nhật',
      
      // Vehicle fields
      'vehicleId': 'ID Xe',
      'vehicleName': 'Tên xe',
      'vehicleVin': 'VIN',
      'vehicleModel': 'Model xe',
      'vehicleYear': 'Năm sản xuất',
      'vin': 'VIN',
      'model': 'Model',
      'year': 'Năm',
      'manufacturingYear': 'Năm sản xuất',
      'licensePlate': 'Biển số',
      'color': 'Màu sắc',
      'engine': 'Động cơ',
      'transmission': 'Hộp số',
      'fuelType': 'Loại nhiên liệu',
      'mileage': 'Số km đã đi',
      
      // Part fields  
      'partId': 'ID Phụ tùng',
      'partName': 'Tên phụ tùng',
      'partNumber': 'Mã phụ tùng',
      'partCategory': 'Loại phụ tùng',
      'partManufacturer': 'Nhà sản xuất PT',
      'manufacturer': 'Nhà sản xuất',
      'category': 'Loại',
      'price': 'Giá',
      'quantity': 'Số lượng',
      'warrantyPeriod': 'Thời gian bảo hành',
      'installationDate': 'Ngày lắp đặt',
      'warrantyExpirationDate': 'Ngày hết bảo hành',
      
      // Customer fields
      'customerId': 'ID Khách hàng',
      'customerName': 'Tên khách hàng',
      'customerEmail': 'Email KH',
      'customerPhone': 'SĐT KH',
      'customerAddress': 'Địa chỉ KH',
      
      // Technician fields
      'technicianId': 'ID Kỹ thuật viên',
      'technicianName': 'Tên kỹ thuật viên',
      
      // Service Center fields
      'serviceCenterId': 'ID Trung tâm',
      'serviceCenterName': 'Tên trung tâm',
      'serviceCenterAddress': 'Địa chỉ trung tâm',
      
      // Common fields
      'id': 'ID',
      'name': 'Tên',
      'email': 'Email', 
      'phone': 'Số điện thoại',
      'address': 'Địa chỉ',
      'fullName': 'Họ tên đầy đủ',
      'username': 'Tên đăng nhập',
      'role': 'Vai trò',
      'active': 'Trạng thái hoạt động',
      'enabled': 'Đã kích hoạt',
      
      // Nested object names
      'vehicle': 'Thông tin xe',
      'part': 'Thông tin phụ tùng',
      'customer': 'Thông tin khách hàng',
      'technician': 'Thông tin kỹ thuật viên',
      'serviceCenter': 'Trung tâm bảo hành',
      'installedPart': 'Phụ tùng đã lắp',
      'user': 'Thông tin người dùng'
    };
    
    return translations[fieldName] || fieldName;
  };

  // Function to translate values
  const translateValue = (key, value) => {
    if (typeof value !== 'string') return value;
    
    // Service type translations
    if (key.toLowerCase().includes('servicetype') || key.toLowerCase().includes('type')) {
      const serviceTypes = {
        'REPAIR': 'Sửa chữa',
        'MAINTENANCE': 'Bảo dưỡng', 
        'INSPECTION': 'Kiểm tra',
        'REPLACEMENT': 'Thay thế'
      };
      return serviceTypes[value] || value;
    }
    
    // Status translations
    if (key.toLowerCase().includes('status')) {
      const statuses = {
        'ACTIVE': 'Hoạt động',
        'INACTIVE': 'Không hoạt động',
        'PENDING': 'Chờ xử lý',
        'COMPLETED': 'Hoàn thành',
        'IN_PROGRESS': 'Đang xử lý',
        'CANCELLED': 'Đã hủy',
        'APPROVED': 'Đã duyệt',
        'REJECTED': 'Từ chối'
      };
      return statuses[value] || value;
    }
    
    // Boolean translations
    if (value === 'true' || value === true) return 'Có';
    if (value === 'false' || value === false) return 'Không';
    
    return value;
  };

  // Function to render all available data
  const renderAllData = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.keys(obj).map(key => {
      const value = obj[key];
      const displayKey = prefix ? `${prefix}.${key}` : key;
      const translatedKey = translateFieldName(key);
      const displayLabel = prefix ? `${prefix} > ${translatedKey}` : translatedKey;
      
      if (value === null || value === undefined) {
        return null;
      }
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={displayKey} style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#2563eb', fontSize: '15px' }}>📁 {displayLabel}:</strong>
            <div style={{ 
              marginLeft: '20px', 
              border: '2px solid #dbeafe', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: '#f0f9ff',
              marginTop: '8px'
            }}>
              {renderAllData(value, translatedKey)}
            </div>
          </div>
        );
      }
      
      if (Array.isArray(value)) {
        return (
          <div key={displayKey} style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#2563eb', fontSize: '15px' }}>📋 {displayLabel} ({value.length} mục):</strong>
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              {value.map((item, index) => (
                <div key={index} style={{ 
                  border: '2px solid #fbbf24', 
                  padding: '10px', 
                  margin: '6px 0', 
                  borderRadius: '6px', 
                  backgroundColor: '#fffbeb'
                }}>
                  <strong style={{ color: '#d97706' }}>#{index + 1}:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {typeof item === 'object' ? renderAllData(item, `${translatedKey}[${index + 1}]`) : 
                     <span style={{ color: '#1f2937', fontWeight: '500' }}>{translateValue(key, String(item))}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      const translatedValue = translateValue(key, value);
      
      return (
        <div key={displayKey} style={{ 
          marginBottom: '10px', 
          display: 'flex', 
          gap: '12px',
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb'
        }}>
          <strong style={{ 
            color: '#374151', 
            minWidth: '180px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {translatedKey}:
          </strong>
          <span style={{ 
            color: '#1f2937', 
            wordBreak: 'break-word',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {typeof value === 'string' && value.includes('T') && value.includes('Z') 
              ? `📅 ${new Date(value).toLocaleString('vi-VN')}` 
              : (translatedValue || 'Không có')}
          </span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaHistory /> Lịch sử Sửa chữa
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Quản lý và theo dõi lịch sử sửa chữa xe
        </S.HeaderSubtitle>
      </S.Header>

      {/* Search and Filter */}
      <S.SearchCard>
        <form onSubmit={handleSearch}>
          <S.SearchInputGroup>
            <S.SearchInput
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm theo từ khóa..."
            />
            <S.SearchButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              Tìm kiếm
            </S.SearchButton>
            <S.ResetButton type="button" onClick={handleReset}>
              Làm mới
            </S.ResetButton>
          </S.SearchInputGroup>
        </form>

        {/* Filter Options */}
        <S.FilterSection>
          <S.FilterLabel><FaFilter /> Lọc theo:</S.FilterLabel>
          <S.FilterOptions>
            <S.RadioLabel $active={filterType === 'all'}>
              <input
                type="radio"
                name="filterType"
                value="all"
                checked={filterType === 'all'}
                onChange={(e) => setFilterType(e.target.value)}
              />
              Tất cả
            </S.RadioLabel>
            <S.RadioLabel $active={filterType === 'vehicle'}>
              <input
                type="radio"
                name="filterType"
                value="vehicle"
                checked={filterType === 'vehicle'}
                onChange={(e) => setFilterType(e.target.value)}
              />
              Theo xe
            </S.RadioLabel>
            <S.RadioLabel $active={filterType === 'dateRange'}>
              <input
                type="radio"
                name="filterType"
                value="dateRange"
                checked={filterType === 'dateRange'}
                onChange={(e) => setFilterType(e.target.value)}
              />
              Theo ngày
            </S.RadioLabel>
          </S.FilterOptions>

          {filterType === 'vehicle' && (
            <S.FilterInputGroup>
              <S.FilterInput
                type="number"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="Nhập Vehicle ID"
              />
              <S.ApplyButton onClick={handleFilterApply}>Áp dụng</S.ApplyButton>
            </S.FilterInputGroup>
          )}

          {filterType === 'dateRange' && (
            <S.FilterInputGroup>
              <S.FilterInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ margin: '0 8px' }}>-</span>
              <S.FilterInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <S.ApplyButton onClick={handleFilterApply}>Áp dụng</S.ApplyButton>
            </S.FilterInputGroup>
          )}
        </S.FilterSection>
      </S.SearchCard>

      {/* Stats */}
      <S.StatsCard>
        <S.StatItem>
          <S.StatLabel>Tổng số bản ghi</S.StatLabel>
          <S.StatValue>{totalElements}</S.StatValue>
        </S.StatItem>
        <S.StatItem>
          <S.StatLabel>Trang hiện tại</S.StatLabel>
          <S.StatValue>{page + 1} / {totalPages || 1}</S.StatValue>
        </S.StatItem>
      </S.StatsCard>

      {/* Error Message */}
      {error && (
        <S.ErrorMessage>
          <FaInfoCircle />
          {error}
        </S.ErrorMessage>
      )}

      {/* Loading State */}
      {loading && (
        <S.LoadingContainer>
          <FaSpinner className="spin" style={{ fontSize: '48px' }} />
          <p>Đang tải dữ liệu...</p>
        </S.LoadingContainer>
      )}

      {/* Service Histories List */}
      {!loading && serviceHistories.length === 0 && (
        <S.EmptyState>
          <FaHistory style={{ fontSize: '64px', opacity: 0.3 }} />
          <h3>Chưa có lịch sử sửa chữa</h3>
          <p>Không tìm thấy bản ghi nào</p>
        </S.EmptyState>
      )}

      {!loading && serviceHistories.length > 0 && (
        <>
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.Th>ID</S.Th>
                  <S.Th>Ngày sửa chữa</S.Th>
                  <S.Th>Loại dịch vụ</S.Th>
                  <S.Th>Xe</S.Th>
                  <S.Th>VIN</S.Th>
                  <S.Th>Phụ tùng</S.Th>
                  <S.Th>Mô tả</S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {serviceHistories.map((history) => (
                  <S.Tr key={history.serviceHistoryId}>
                    <S.Td>{history.serviceHistoryId}</S.Td>
                    <S.Td>
                      <S.DateBadge>
                        <FaCalendar />
                        {formatDate(history.serviceDate)}
                      </S.DateBadge>
                    </S.Td>
                    <S.Td>
                      <S.TypeBadge>{history.serviceType || 'N/A'}</S.TypeBadge>
                    </S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCar style={{ color: '#6b7280' }} />
                        {history.vehicleName || 'N/A'}
                      </div>
                    </S.Td>
                    <S.Td>{history.vehicleVin || 'N/A'}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCog style={{ color: '#6b7280' }} />
                        {history.partName || 'N/A'}
                      </div>
                    </S.Td>
                    <S.Td>
                      <S.Description>{history.description || 'N/A'}</S.Description>
                    </S.Td>
                    <S.Td>
                      <button 
                        onClick={() => openDetailModal(history)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px'
                        }}
                      >
                        <FaEye /> Chi tiết
                      </button>
                    </S.Td>
                  </S.Tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <S.Pagination>
              <S.PaginationButton
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Trước
              </S.PaginationButton>
              <S.PageInfo>
                Trang {page + 1} / {totalPages}
              </S.PageInfo>
              <S.PaginationButton
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </S.PaginationButton>
            </S.Pagination>
          )}
        </>
      )}

      {/* Detail Modal - Hiển thị toàn bộ thông tin */}
      {showDetailModal && selectedHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '1000px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Header */}
            <div style={{
              background: '#f9fafb',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                � Toàn bộ thông tin Lịch sử Sửa chữa #{selectedHistory.serviceHistoryId}
              </h2>
              <button
                onClick={closeDetailModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px',
              maxHeight: '70vh',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>� Tất cả dữ liệu có sẵn:</h3>
                {renderAllData(selectedHistory)}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              background: '#f9fafb',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeDetailModal}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </S.PageContainer>
  );
};

export default ServiceHistory;
