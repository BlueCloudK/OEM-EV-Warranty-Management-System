import React, { useState } from 'react';
import * as S from './PartsLookup.styles';
import {
  FaCog, FaSearch, FaSpinner, FaInfoCircle, FaBarcode,
  FaIndustry, FaDollarSign, FaClock, FaLayerGroup
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const PartsLookup = () => {
  const [searchType, setSearchType] = useState('id'); // 'id', 'name', or 'manufacturer'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [part, setPart] = useState(null);
  const [parts, setParts] = useState([]);
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
      setParts([]);
      setNotFound(false);

      let response;
      if (searchType === 'id') {
        // Search by Part ID - Backend: GET /api/parts/{id}
        response = await apiClient(`/api/parts/${encodeURIComponent(searchValue.trim())}`);
        console.log('🔧 Part found:', response);
        setPart(response);
      } else if (searchType === 'name') {
        // Search by part name - Backend: GET /api/parts?search={keyword}&page=0&size=10
        const searchResponse = await apiClient(`/api/parts?search=${encodeURIComponent(searchValue.trim())}&page=0&size=10`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          console.log('🔧 Parts found:', searchResponse.content);
          setParts(searchResponse.content);
        } else {
          setNotFound(true);
          return;
        }
      } else {
        // Search by manufacturer - Backend: GET /api/parts/by-manufacturer?manufacturer={name}&page=0&size=10
        const searchResponse = await apiClient(`/api/parts/by-manufacturer?manufacturer=${encodeURIComponent(searchValue.trim())}&page=0&size=10`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          console.log('🔧 Parts found:', searchResponse.content);
          setParts(searchResponse.content);
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
  };

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
          <FaCog /> Tra cứu Phụ tùng
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Tìm kiếm phụ tùng theo Part ID, Tên phụ tùng, hoặc Nhà sản xuất
        </S.HeaderSubtitle>
      </S.Header>

      {/* Search Form */}
      <S.SearchCard>
        <form onSubmit={handleSearch}>
          <S.SearchTypeSelector>
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
                searchType === 'id'
                  ? 'Nhập Part ID (ví dụ: 1, 2, 3...)'
                  : searchType === 'name'
                  ? 'Nhập tên phụ tùng (ví dụ: Pin, Động cơ...)'
                  : 'Nhập tên nhà sản xuất (ví dụ: VinFast)'
              }
            />
            <S.SearchButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
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
          <h3 style={{ margin: '16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
            Tìm thấy {parts.length} phụ tùng
          </h3>
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
        </div>
      )}
    </S.PageContainer>
  );
};

export default PartsLookup;
