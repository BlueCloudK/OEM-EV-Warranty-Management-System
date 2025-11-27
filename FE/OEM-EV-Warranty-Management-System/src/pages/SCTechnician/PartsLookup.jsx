import React, { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../../api/dataApi';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import * as S from './PartsLookup.styles';
import { FaCogs, FaSearch, FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * @description Custom Hook for Parts Management logic (Inline for SC Technician - Read Only).
 */
const usePartsManagement = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'partId', direction: 'DESC' });

  const fetchParts = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction
      };

      if (effectiveSearchTerm) {
        params.search = effectiveSearchTerm;
      }

      console.log('🔍 Fetching parts with params:', params);

      const response = await dataApi.getAllParts(params);

      if (response && response.content) {
        setParts(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setParts([]);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
      if (!silent) {
        setError("Không thể tải danh sách phụ tùng.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, sortConfig]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSearch = () => {
    setEffectiveSearchTerm(searchTerm);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  return {
    parts,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    handleSearch,
    handlePageChange,
    refreshParts: fetchParts,
    sortConfig,
    handleSort,
  };
};

// Main Page Component
const PartsLookup = () => {
  const {
    parts,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    handleSearch,
    handlePageChange,
    refreshParts,
    sortConfig,
    handleSort
  } = usePartsManagement();

  // Auto-refresh logic
  const { lastUpdated, isRefreshing } = useAutoRefresh({
    fetchData: (silent) => refreshParts(silent),
    shouldPoll: true,
    pollInterval: 30000
  });

  // Helper to render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
    if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
    return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle>
              <FaCogs /> Tra cứu Phụ tùng
              {lastUpdated && (
                <small style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRefreshing && <FaSpinner className="spinner" />}
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                </small>
              )}
            </S.HeaderTitle>
            {/* Removed Add Button */}
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input
              placeholder="Tìm kiếm phụ tùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <S.Button small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : parts.length === 0 ? (
          <S.EmptyState><h3>Không tìm thấy phụ tùng</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('partId')} style={{ cursor: 'pointer' }}>
                    ID {renderSortIcon('partId')}
                  </th>
                  <th onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                    Tên Phụ tùng {renderSortIcon('partName')}
                  </th>
                  <th onClick={() => handleSort('partNumber')} style={{ cursor: 'pointer' }}>
                    Mã Phụ tùng {renderSortIcon('partNumber')}
                  </th>
                  <th>
                    Loại
                  </th>
                  <th onClick={() => handleSort('manufacturer')} style={{ cursor: 'pointer' }}>
                    Nhà sản xuất {renderSortIcon('manufacturer')}
                  </th>
                  <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                    Giá (VNĐ) {renderSortIcon('price')}
                  </th>
                  {/* Removed Actions Column */}
                </tr>
              </thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.partId}>
                    <S.Td>{part.partId}</S.Td>
                    <S.Td style={{ fontWeight: '500' }}>{part.partName}</S.Td>
                    <S.Td style={{ fontFamily: 'monospace' }}>{part.partNumber}</S.Td>
                    <S.Td>{part.categoryName || '-'}</S.Td>
                    <S.Td>{part.manufacturer}</S.Td>
                    <S.Td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price)}</S.Td>
                    {/* Removed Actions Cell */}
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableContainer>
        )}

        {/* Pagination Controls */}
        {!loading && !error && parts.length > 0 && pagination.totalPages > 0 && (
          <S.PaginationContainer>
            <S.Button
              $small
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
            >
              Trước
            </S.Button>
            <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
              Trang {pagination.currentPage + 1} / {pagination.totalPages}
              <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                (Tổng: {pagination.totalElements} phụ tùng)
              </span>
            </span>
            <S.Button
              $small
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
            >
              Tiếp
            </S.Button>
          </S.PaginationContainer>
        )}

      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default PartsLookup;
