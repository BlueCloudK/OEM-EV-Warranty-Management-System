import React, { useState, useEffect } from 'react';
import * as S from './ServiceHistory.styles';
import {
  FaHistory, FaSearch, FaSpinner, FaInfoCircle, FaCalendar,
  FaCar, FaCog, FaPlus, FaEdit, FaFilter, FaSort, FaSortUp, FaSortDown
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
  const [sortConfig, setSortConfig] = useState({ key: 'serviceDate', direction: 'DESC' });

  useEffect(() => {
    fetchServiceHistories();
  }, [page, sortConfig]);

  const fetchServiceHistories = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = `/api/service-histories?page=${page}&size=10&sortBy=${sortConfig.key}&sortDir=${sortConfig.direction}`;
      if (searchValue.trim()) {
        endpoint += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient(endpoint);
      console.log('📋 Service histories:', response);

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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
    if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
    return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
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
                  <S.Th onClick={() => handleSort('serviceHistoryId')} style={{ cursor: 'pointer' }}>
                    ID {renderSortIcon('serviceHistoryId')}
                  </S.Th>
                  <S.Th onClick={() => handleSort('serviceDate')} style={{ cursor: 'pointer' }}>
                    Ngày sửa chữa {renderSortIcon('serviceDate')}
                  </S.Th>
                  <S.Th>Loại dịch vụ</S.Th>
                  <S.Th onClick={() => handleSort('vehicleName')} style={{ cursor: 'pointer' }}>
                    Xe {renderSortIcon('vehicleName')}
                  </S.Th>
                  <S.Th onClick={() => handleSort('vehicleVin')} style={{ cursor: 'pointer' }}>
                    VIN {renderSortIcon('vehicleVin')}
                  </S.Th>
                  <S.Th>Phụ tùng</S.Th>
                  <S.Th>Mô tả</S.Th>
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
    </S.PageContainer>
  );
};

export default ServiceHistory;
