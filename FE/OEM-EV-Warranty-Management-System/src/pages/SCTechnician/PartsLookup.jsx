import React, { useState } from 'react';
import * as S from './PartsLookup.styles';
import {
  FaCog, FaSearch, FaSpinner, FaInfoCircle, FaBarcode,
  FaIndustry, FaBox, FaDollarSign, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const PartsLookup = () => {
  const [searchType, setSearchType] = useState('partNumber'); // 'partNumber' or 'name'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [part, setPart] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      setError('Vui lòng nhập thông tin tìm kiếm');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPart(null);
      setNotFound(false);

      let response;
      if (searchType === 'partNumber') {
        // Search by part number
        response = await apiClient(`/api/parts/by-part-number?partNumber=${encodeURIComponent(searchValue.trim())}`);
      } else {
        // Search by name
        const searchResponse = await apiClient(`/api/parts/search?name=${encodeURIComponent(searchValue.trim())}&page=0&size=1`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          response = searchResponse.content[0];
        } else {
          setNotFound(true);
          return;
        }
      }

      console.log('🔧 Part found:', response);
      setPart(response);
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
    setError(null);
    setNotFound(false);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStockStatus = (quantity) => {
    if (quantity === null || quantity === undefined) {
      return { text: 'Không xác định', color: '#6b7280', icon: <FaInfoCircle /> };
    }

    if (quantity === 0) {
      return { text: 'Hết hàng', color: '#ef4444', icon: <FaTimesCircle /> };
    }

    if (quantity < 10) {
      return { text: `Sắp hết (${quantity})`, color: '#f59e0b', icon: <FaInfoCircle /> };
    }

    return { text: `Còn hàng (${quantity})`, color: '#10b981', icon: <FaCheckCircle /> };
  };

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaCog /> Tra cứu Phụ tùng
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Tìm kiếm thông tin phụ tùng theo mã hoặc tên
        </S.HeaderSubtitle>
      </S.Header>

      {/* Search Form */}
      <S.SearchCard>
        <form onSubmit={handleSearch}>
          <S.SearchTypeSelector>
            <S.RadioLabel $active={searchType === 'partNumber'}>
              <input
                type="radio"
                name="searchType"
                value="partNumber"
                checked={searchType === 'partNumber'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo Mã phụ tùng
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
          </S.SearchTypeSelector>

          <S.SearchInputGroup>
            <S.SearchInput
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'partNumber' ? 'Nhập mã phụ tùng (ví dụ: PT-001)' : 'Nhập tên phụ tùng (ví dụ: Pin Lithium)'}
            />
            <S.SearchButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </S.SearchButton>
            {(part || notFound || error) && (
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
          <p>Không có phụ tùng nào với {searchType === 'partNumber' ? 'mã' : 'tên'}: <strong>{searchValue}</strong></p>
        </S.NotFoundMessage>
      )}

      {/* Part Details */}
      {part && (
        <S.PartCard>
          <S.PartHeader>
            <S.PartTitle>
              <FaCog /> {part.partName || part.name || 'N/A'}
            </S.PartTitle>
            <S.StockBadge $color={getStockStatus(part.stockQuantity || part.quantity).color}>
              {getStockStatus(part.stockQuantity || part.quantity).icon}
              {getStockStatus(part.stockQuantity || part.quantity).text}
            </S.StockBadge>
          </S.PartHeader>

          <S.PartGrid>
            <S.InfoItem>
              <S.InfoLabel><FaBarcode /> Mã phụ tùng</S.InfoLabel>
              <S.InfoValue>{part.partNumber || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaIndustry /> Nhà sản xuất</S.InfoLabel>
              <S.InfoValue>{part.manufacturer || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaBox /> Danh mục</S.InfoLabel>
              <S.InfoValue>{part.category || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaDollarSign /> Giá</S.InfoLabel>
              <S.InfoValue>{formatCurrency(part.price || part.partPrice)}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaBox /> Số lượng tồn kho</S.InfoLabel>
              <S.InfoValue>{part.stockQuantity ?? part.quantity ?? 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCheckCircle /> Được bảo hành</S.InfoLabel>
              <S.InfoValue>
                {part.warrantyCoverage !== undefined
                  ? (part.warrantyCoverage ? 'Có' : 'Không')
                  : 'N/A'}
              </S.InfoValue>
            </S.InfoItem>

            {part.description && (
              <S.InfoItem $fullWidth>
                <S.InfoLabel><FaInfoCircle /> Mô tả</S.InfoLabel>
                <S.InfoValue>{part.description}</S.InfoValue>
              </S.InfoItem>
            )}

            {part.supplier && (
              <S.InfoItem $fullWidth>
                <S.InfoLabel><FaIndustry /> Nhà cung cấp</S.InfoLabel>
                <S.InfoValue>
                  {part.supplier.supplierName || part.supplier.name || 'N/A'}
                  {part.supplier.supplierPhone && ` - ${part.supplier.supplierPhone}`}
                  {part.supplier.supplierEmail && ` - ${part.supplier.supplierEmail}`}
                </S.InfoValue>
              </S.InfoItem>
            )}
          </S.PartGrid>
        </S.PartCard>
      )}
    </S.PageContainer>
  );
};

export default PartsLookup;
