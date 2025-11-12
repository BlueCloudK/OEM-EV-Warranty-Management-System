import React, { useState } from 'react';
import * as S from './PartsLookup.styles';
import {
  FaCog, FaSearch, FaSpinner, FaInfoCircle, FaBarcode,
  FaIndustry, FaDollarSign, FaClock, FaLayerGroup
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const PartsLookup = () => {
  const [searchType, setSearchType] = useState('all'); // 'all', 'id', 'name', or 'manufacturer'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [part, setPart] = useState(null);
  const [parts, setParts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleSearch = async (e, page = 0) => {
    if (e) e.preventDefault();

    // For 'all' and 'id' types, search can be empty
    if (searchType !== 'all' && searchType !== 'id' && !searchValue.trim()) {
      setError('Vui lòng nhập thông tin tìm kiếm');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPart(null);
      setParts([]);
      setNotFound(false);
      setCurrentPage(page);

      let response;
      if (searchType === 'all') {
        // Get all parts with pagination - Backend: GET /api/parts?page={page}&size={size}
        response = await apiClient(`/api/parts?page=${page}&size=${pageSize}&sortBy=partId&sortDir=ASC`);
        console.log('🔧 All parts loaded:', response);
        if (response.content && response.content.length > 0) {
          setParts(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        } else {
          setNotFound(true);
        }
      } else if (searchType === 'id') {
        if (!searchValue.trim()) {
          // If no ID entered, load all parts
          response = await apiClient(`/api/parts?page=${page}&size=${pageSize}&sortBy=partId&sortDir=ASC`);
          if (response.content && response.content.length > 0) {
            setParts(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
          } else {
            setNotFound(true);
          }
        } else {
          // Search by Part ID - Backend: GET /api/parts/{id}
          response = await apiClient(`/api/parts/${encodeURIComponent(searchValue.trim())}`);
          console.log('🔧 Part found:', response);
          setPart(response);
        }
      } else if (searchType === 'name') {
        // Search by part name - Backend: GET /api/parts?search={keyword}&page={page}&size={size}
        const searchResponse = await apiClient(`/api/parts?search=${encodeURIComponent(searchValue.trim())}&page=${page}&size=${pageSize}`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          console.log('🔧 Parts found:', searchResponse.content);
          setParts(searchResponse.content);
          setTotalPages(searchResponse.totalPages);
          setTotalElements(searchResponse.totalElements);
        } else {
          setNotFound(true);
          return;
        }
      } else {
        // Search by manufacturer - Backend: GET /api/parts/by-manufacturer?manufacturer={name}&page={page}&size={size}
        const searchResponse = await apiClient(`/api/parts/by-manufacturer?manufacturer=${encodeURIComponent(searchValue.trim())}&page=${page}&size=${pageSize}`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          console.log('🔧 Parts found:', searchResponse.content);
          setParts(searchResponse.content);
          setTotalPages(searchResponse.totalPages);
          setTotalElements(searchResponse.totalElements);
        } else {
          setNotFound(true);
          return;
        }
      }
    } catch (err) {
      console.error('❌ Error searching part:', err);
      if (err.message.includes('404') || err.message.includes('not found')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Không thể tìm kiếm phụ tùng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setPart(null);
    setParts([]);
    setError(null);
    setNotFound(false);
    setCurrentPage(0);
    setTotalPages(0);
    setTotalElements(0);
  };

  const handlePageChange = (newPage) => {
    handleSearch(null, newPage);
  };

  // Load all parts on mount
  React.useEffect(() => {
    handleSearch(null, 0);
    // eslint-disable-next-line
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };


  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaCog /> Danh sách Phụ tùng
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Xem tất cả phụ tùng hoặc tìm kiếm theo Part ID, Tên phụ tùng, Nhà sản xuất
        </S.HeaderSubtitle>
      </S.Header>

      {/* Search Form */}
      <S.SearchCard>
        <form onSubmit={handleSearch}>
          <S.SearchTypeSelector>
            <S.RadioLabel $active={searchType === 'all'}>
              <input
                type="radio"
                name="searchType"
                value="all"
                checked={searchType === 'all'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Xem tất cả
            </S.RadioLabel>
            <S.RadioLabel $active={searchType === 'id'}>
              <input
                type="radio"
                name="searchType"
                value="id"
                checked={searchType === 'id'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo Part ID
            </S.RadioLabel>
            <S.RadioLabel $active={searchType === 'name'}>
              <input
                type="radio"
                name="searchType"
                value="name"
                checked={searchType === 'name'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo Tên phụ tùng
            </S.RadioLabel>
            <S.RadioLabel $active={searchType === 'manufacturer'}>
              <input
                type="radio"
                name="searchType"
                value="manufacturer"
                checked={searchType === 'manufacturer'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo Nhà sản xuất
            </S.RadioLabel>
          </S.SearchTypeSelector>

          <S.SearchInputGroup>
            <S.SearchInput
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'all'
                  ? 'Nhấn "Tìm kiếm" để xem tất cả phụ tùng'
                  : searchType === 'id'
                  ? 'Nhập Part ID (ví dụ: 1, 2, 3...)'
                  : searchType === 'name'
                  ? 'Nhập tên phụ tùng (ví dụ: Pin, Động cơ...)'
                  : 'Nhập tên nhà sản xuất (ví dụ: VinFast)'
              }
              disabled={searchType === 'all'}
            />
            <S.SearchButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? 'Đang tải...' : searchType === 'all' ? 'Xem tất cả' : 'Tìm kiếm'}
            </S.SearchButton>
            {(part || parts.length > 0 || notFound || error) && (
              <S.ResetButton type="button" onClick={handleReset}>
                Làm mới
              </S.ResetButton>
            )}
          </S.SearchInputGroup>
        </form>
      </S.SearchCard>

      {/* Error Message */}
      {error && (
        <S.ErrorMessage>
          <FaInfoCircle />
          {error}
        </S.ErrorMessage>
      )}

      {/* Not Found Message */}
      {notFound && (
        <S.NotFoundMessage>
          <FaCog />
          <h3>Không tìm thấy phụ tùng</h3>
          <p>Không có phụ tùng nào với {searchType === 'id' ? 'Part ID' : searchType === 'name' ? 'tên' : 'nhà sản xuất'}: <strong>{searchValue}</strong></p>
        </S.NotFoundMessage>
      )}

      {/* Single Part Details (by ID) */}
      {part && (
        <S.PartCard>
          <S.PartHeader>
            <S.PartTitle>
              <FaCog /> {part.partName || 'N/A'}
            </S.PartTitle>
          </S.PartHeader>

          <S.PartGrid>
            <S.InfoItem>
              <S.InfoLabel><FaBarcode /> Part ID</S.InfoLabel>
              <S.InfoValue>{part.partId || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaBarcode /> Part Number</S.InfoLabel>
              <S.InfoValue>{part.partNumber || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaIndustry /> Nhà sản xuất</S.InfoLabel>
              <S.InfoValue>{part.manufacturer || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaLayerGroup /> Loại phụ tùng</S.InfoLabel>
              <S.InfoValue>{part.partCategory || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaClock /> Thời hạn bảo hành</S.InfoLabel>
              <S.InfoValue>
                {part.warrantyDurationMonths ? `${part.warrantyDurationMonths} tháng` : 'N/A'}
              </S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaDollarSign /> Giá</S.InfoLabel>
              <S.InfoValue>{formatCurrency(part.price)}</S.InfoValue>
            </S.InfoItem>
          </S.PartGrid>
        </S.PartCard>
      )}

      {/* Multiple Parts List (by manufacturer) */}
      {parts.length > 0 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '16px 0'
          }}>
            <h3 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              {searchType === 'all' ? 'Danh sách phụ tùng' : `Tìm thấy ${totalElements || parts.length} phụ tùng`}
            </h3>
            {totalElements > 0 && (
              <div style={{ color: '#6c757d', fontSize: '14px' }}>
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements}
              </div>
            )}
          </div>
          {parts.map((p, index) => (
            <S.PartCard key={index}>
              <S.PartHeader>
                <S.PartTitle>
                  <FaCog /> {p.partName || 'N/A'}
                </S.PartTitle>
              </S.PartHeader>

              <S.PartGrid>
                <S.InfoItem>
                  <S.InfoLabel><FaBarcode /> Part ID</S.InfoLabel>
                  <S.InfoValue>{p.partId || 'N/A'}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel><FaBarcode /> Part Number</S.InfoLabel>
                  <S.InfoValue>{p.partNumber || 'N/A'}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel><FaIndustry /> Nhà sản xuất</S.InfoLabel>
                  <S.InfoValue>{p.manufacturer || 'N/A'}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel><FaLayerGroup /> Loại phụ tùng</S.InfoLabel>
                  <S.InfoValue>{p.partCategory || 'N/A'}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel><FaClock /> Thời hạn bảo hành</S.InfoLabel>
                  <S.InfoValue>
                    {p.warrantyDurationMonths ? `${p.warrantyDurationMonths} tháng` : 'N/A'}
                  </S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel><FaDollarSign /> Giá</S.InfoLabel>
                  <S.InfoValue>{formatCurrency(p.price)}</S.InfoValue>
                </S.InfoItem>
              </S.PartGrid>
            </S.PartCard>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              margin: '24px 0',
              padding: '16px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Đầu
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Trước
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        background: currentPage === pageNum ? '#007bff' : 'white',
                        color: currentPage === pageNum ? 'white' : '#007bff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPage === pageNum ? '600' : '500',
                        minWidth: '40px'
                      }}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage >= totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage >= totalPages - 1 ? '#6c757d' : '#007bff',
                  cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sau →
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage >= totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage >= totalPages - 1 ? '#6c757d' : '#007bff',
                  cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cuối
              </button>
            </div>
          )}
        </div>
      )}
    </S.PageContainer>
  );
};

export default PartsLookup;
