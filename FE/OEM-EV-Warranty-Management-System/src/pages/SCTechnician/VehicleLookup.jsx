import React, { useState } from 'react';
import * as S from './VehicleLookup.styles';
import {
  FaCar, FaSearch, FaSpinner, FaInfoCircle, FaCalendar,
  FaBarcode, FaIndustry, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const VehicleLookup = () => {
  const [searchType, setSearchType] = useState('vin'); // 'vin' or 'name'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
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
      setVehicle(null);
      setNotFound(false);

      let response;
      if (searchType === 'vin') {
        // Search by VIN
        response = await apiClient(`/api/vehicles/by-vin?vin=${encodeURIComponent(searchValue.trim())}`);
      } else {
        // Search by name
        const searchResponse = await apiClient(`/api/vehicles/search?name=${encodeURIComponent(searchValue.trim())}&page=0&size=1`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          response = searchResponse.content[0];
        } else {
          setNotFound(true);
          return;
        }
      }

      console.log('🚗 Vehicle found:', response);
      setVehicle(response);
    } catch (err) {
      console.error('❌ Error searching vehicle:', err);
      if (err.message.includes('404') || err.message.includes('not found')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Không thể tìm kiếm xe');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setVehicle(null);
    setError(null);
    setNotFound(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWarrantyStatus = (endDate) => {
    if (!endDate) return { text: 'Không xác định', color: '#6b7280', icon: <FaInfoCircle /> };

    const today = new Date();
    const warranty = new Date(endDate);

    if (warranty < today) {
      return { text: 'Hết hạn', color: '#ef4444', icon: <FaTimesCircle /> };
    }

    const daysLeft = Math.ceil((warranty - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 30) {
      return { text: `Còn ${daysLeft} ngày`, color: '#f59e0b', icon: <FaInfoCircle /> };
    }

    return { text: 'Còn hạn', color: '#10b981', icon: <FaCheckCircle /> };
  };

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaCar /> Tra cứu Xe
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Tìm kiếm thông tin xe theo VIN hoặc tên xe
        </S.HeaderSubtitle>
      </S.Header>

      {/* Search Form */}
      <S.SearchCard>
        <form onSubmit={handleSearch}>
          <S.SearchTypeSelector>
            <S.RadioLabel $active={searchType === 'vin'}>
              <input
                type="radio"
                name="searchType"
                value="vin"
                checked={searchType === 'vin'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo VIN
            </S.RadioLabel>
            <S.RadioLabel $active={searchType === 'name'}>
              <input
                type="radio"
                name="searchType"
                value="name"
                checked={searchType === 'name'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Tìm theo Tên xe
            </S.RadioLabel>
          </S.SearchTypeSelector>

          <S.SearchInputGroup>
            <S.SearchInput
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'vin' ? 'Nhập VIN (ví dụ: 87-MĐ-892.34)' : 'Nhập tên xe (ví dụ: VF5)'}
            />
            <S.SearchButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </S.SearchButton>
            {(vehicle || notFound || error) && (
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
          <FaCar />
          <h3>Không tìm thấy xe</h3>
          <p>Không có xe nào với {searchType === 'vin' ? 'VIN' : 'tên'}: <strong>{searchValue}</strong></p>
        </S.NotFoundMessage>
      )}

      {/* Vehicle Details */}
      {vehicle && (
        <S.VehicleCard>
          <S.VehicleHeader>
            <S.VehicleTitle>
              <FaCar /> {vehicle.vehicleName || vehicle.name || 'N/A'}
            </S.VehicleTitle>
            <S.WarrantyBadge $color={getWarrantyStatus(vehicle.warrantyEndDate).color}>
              {getWarrantyStatus(vehicle.warrantyEndDate).icon}
              {getWarrantyStatus(vehicle.warrantyEndDate).text}
            </S.WarrantyBadge>
          </S.VehicleHeader>

          <S.VehicleGrid>
            <S.InfoItem>
              <S.InfoLabel><FaBarcode /> VIN</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleVin || vehicle.vin || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaIndustry /> Hãng sản xuất</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleBrand || vehicle.brand || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCar /> Model</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleModel || vehicle.model || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCalendar /> Năm sản xuất</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleYear || vehicle.year || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCalendar /> Ngày bắt đầu BH</S.InfoLabel>
              <S.InfoValue>{formatDate(vehicle.warrantyStartDate)}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCalendar /> Ngày kết thúc BH</S.InfoLabel>
              <S.InfoValue>{formatDate(vehicle.warrantyEndDate)}</S.InfoValue>
            </S.InfoItem>

            {vehicle.customer && (
              <>
                <S.InfoItem $fullWidth>
                  <S.InfoLabel><FaInfoCircle /> Chủ sở hữu</S.InfoLabel>
                  <S.InfoValue>
                    {vehicle.customer.customerName || vehicle.customer.name || 'N/A'}
                    {vehicle.customer.customerPhone && ` - ${vehicle.customer.customerPhone}`}
                  </S.InfoValue>
                </S.InfoItem>
              </>
            )}
          </S.VehicleGrid>
        </S.VehicleCard>
      )}
    </S.PageContainer>
  );
};

export default VehicleLookup;
