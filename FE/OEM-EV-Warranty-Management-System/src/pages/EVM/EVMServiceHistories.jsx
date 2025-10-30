import React, { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../../api/dataApi';
import * as S from './EVMServiceHistories.styles';
import { FaHistory, FaSpinner, FaSearch, FaTimes, FaEye } from 'react-icons/fa';

const ServiceHistoryDetailModal = ({ isOpen, onClose, history }) => {
  if (!isOpen || !history) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>Chi tiết Lịch sử Dịch vụ</h2>
          <S.CloseButton onClick={onClose}><FaTimes /></S.CloseButton>
        </S.ModalHeader>
        <S.DetailGrid>
          <S.DetailItem>
            <S.DetailLabel>ID:</S.DetailLabel>
            <S.DetailValue>{history.serviceHistoryId}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Xe (VIN):</S.DetailLabel>
            <S.DetailValue>{history.vehicleVin || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Tên xe:</S.DetailLabel>
            <S.DetailValue>{history.vehicleName || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>ID Xe:</S.DetailLabel>
            <S.DetailValue>{history.vehicleId || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Loại dịch vụ:</S.DetailLabel>
            <S.DetailValue>{history.serviceType || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Ngày dịch vụ:</S.DetailLabel>
            <S.DetailValue>{history.serviceDate ? new Date(history.serviceDate).toLocaleDateString('vi-VN') : 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Phụ tùng:</S.DetailLabel>
            <S.DetailValue>{history.partName ? `${history.partName} (${history.partId})` : history.partId || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem $fullWidth>
            <S.DetailLabel>Mô tả:</S.DetailLabel>
            <S.DetailValue>{history.description || 'N/A'}</S.DetailValue>
          </S.DetailItem>
        </S.DetailGrid>
        <S.ModalFooter>
          <S.Button onClick={onClose}>Đóng</S.Button>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const EVMServiceHistories = () => {
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchServiceHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
      };
      let response;

      // Check if searching by date range
      if (searchType === 'dateRange' && dateRange.startDate && dateRange.endDate) {
        const dateParams = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: pagination.currentPage,
          size: pagination.pageSize,
        };
        response = await dataApi.getServiceHistoriesByDateRange(dateParams);
      } else if (searchTerm && searchTerm.trim()) {
        // Search by other criteria
        switch (searchType) {
          case 'vehicle':
            // Search by vehicle ID (must be a number)
            const vehicleId = parseInt(searchTerm.trim(), 10);
            if (isNaN(vehicleId)) {
              setError("ID Xe phải là số.");
              setServiceHistories([]);
              setLoading(false);
              return;
            }
            response = await dataApi.getServiceHistoriesByVehicle(vehicleId, params);
            break;
          case 'part':
            // Search by part ID (string)
            response = await dataApi.getServiceHistoriesByPart(searchTerm.trim(), params);
            break;
          default:
            // General search - add search term to params
            params.search = searchTerm.trim();
            response = await dataApi.getAllServiceHistories(params);
            break;
        }
      } else {
        // No search criteria - get all
        response = await dataApi.getAllServiceHistories(params);
      }

      if (response && response.content) {
        setServiceHistories(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setServiceHistories([]);
      }
    } catch (err) {
      console.error("Error fetching service histories:", err);
      setError(err.response?.data?.message || "Không thể tải lịch sử dịch vụ.");
      setServiceHistories([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType, dateRange]);

  useEffect(() => {
    fetchServiceHistories();
  }, [fetchServiceHistories]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchServiceHistories();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('general');
    setDateRange({ startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const openDetailModal = (history) => {
    setSelectedHistory(history);
    setShowDetailModal(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaHistory /> Lịch sử Dịch vụ</S.HeaderTitle>
          </S.HeaderTop>
          <S.SearchContainer>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="general">Tìm chung</option>
              <option value="vehicle">ID Xe</option>
              <option value="part">ID Phụ tùng</option>
              <option value="dateRange">Khoảng thời gian</option>
            </select>
            {searchType === 'dateRange' ? (
              <>
                <S.Input
                  type="date"
                  placeholder="Từ ngày"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <S.Input
                  type="date"
                  placeholder="Đến ngày"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </>
            ) : (
              <S.Input
                type={searchType === 'vehicle' ? 'number' : 'text'}
                placeholder={searchType === 'general' ? 'Tìm kiếm...' : searchType === 'vehicle' ? 'Nhập ID Xe (số)...' : 'Nhập ID Phụ tùng...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            )}
            <S.Button small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
            {(searchTerm || dateRange.startDate || dateRange.endDate) && (
              <S.Button small onClick={handleClearSearch}><FaTimes /> Xóa</S.Button>
            )}
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : serviceHistories.length === 0 ? (
          <S.EmptyState><h3>Không có lịch sử dịch vụ nào.</h3></S.EmptyState>
        ) : (
          <>
            <S.TableContainer>
              <S.Table>
                <thead>
                  <tr>
                    <S.Th>ID</S.Th>
                    <S.Th>Xe (VIN)</S.Th>
                    <S.Th>Tên xe</S.Th>
                    <S.Th>Loại dịch vụ</S.Th>
                    <S.Th>Phụ tùng</S.Th>
                    <S.Th>Mô tả</S.Th>
                    <S.Th>Ngày dịch vụ</S.Th>
                    <S.Th>Thao tác</S.Th>
                  </tr>
                </thead>
                <tbody>
                  {serviceHistories.map(history => (
                    <tr key={history.serviceHistoryId}>
                      <S.Td>{history.serviceHistoryId}</S.Td>
                      <S.Td>{history.vehicleVin || 'N/A'}</S.Td>
                      <S.Td>{history.vehicleName || 'N/A'}</S.Td>
                      <S.Td>{history.serviceType || 'N/A'}</S.Td>
                      <S.Td>{history.partName ? `${history.partName} (${history.partId})` : history.partId || 'N/A'}</S.Td>
                      <S.Td>{history.description}</S.Td>
                      <S.Td>{new Date(history.serviceDate).toLocaleDateString('vi-VN')}</S.Td>
                      <S.Td>
                        <S.Button small onClick={() => openDetailModal(history)}>
                          <FaEye /> Chi tiết
                        </S.Button>
                      </S.Td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            </S.TableContainer>
            {pagination.totalPages > 1 && (
              <S.PaginationContainer>
                <S.Button
                  small
                  disabled={pagination.currentPage === 0}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Trước
                </S.Button>
                <S.PageInfo>
                  Trang {pagination.currentPage + 1} / {pagination.totalPages}
                  ({pagination.totalElements} bản ghi)
                </S.PageInfo>
                <S.Button
                  small
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Sau
                </S.Button>
              </S.PaginationContainer>
            )}
          </>
        )}

        <ServiceHistoryDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          history={selectedHistory}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default EVMServiceHistories;
