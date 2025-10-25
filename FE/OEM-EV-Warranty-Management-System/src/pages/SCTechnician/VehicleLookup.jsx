import React, { useState } from 'react';
import * as S from './VehicleLookup.styles';
import {
  FaCar, FaSearch, FaSpinner, FaInfoCircle, FaCalendar, FaBarcode, FaCog
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const VehicleLookup = () => {
  const [searchType, setSearchType] = useState('vin'); // 'vin' or 'name'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [installedParts, setInstalledParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

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
        // Search by VIN - Backend: GET /api/vehicles/by-vin?vin={vin}
        response = await apiClient(`/api/vehicles/by-vin?vin=${encodeURIComponent(searchValue.trim())}`);
      } else {
        // Search by name - Backend: GET /api/vehicles?search={keyword}&page=0&size=10
        const searchResponse = await apiClient(`/api/vehicles?search=${encodeURIComponent(searchValue.trim())}&page=0&size=1`);
        if (searchResponse.content && searchResponse.content.length > 0) {
          response = searchResponse.content[0];
        } else {
          setNotFound(true);
          return;
        }
      }

      console.log('🚗 Vehicle found:', response);
      setVehicle(response);

      // Fetch installed parts for this vehicle
      if (response.vehicleId) {
        fetchInstalledParts(response.vehicleId);
      }
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

  const fetchInstalledParts = async (vehicleId) => {
    try {
      setLoadingParts(true);
      const response = await apiClient(`/api/installed-parts/by-vehicle/${vehicleId}?page=0&size=100`);
      console.log('🔧 Installed parts:', response);
      if (response.content && Array.isArray(response.content)) {
        setInstalledParts(response.content);
      }
    } catch (err) {
      console.error('❌ Error fetching installed parts:', err);
    } finally {
      setLoadingParts(false);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setVehicle(null);
    setError(null);
    setNotFound(false);
    setInstalledParts([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <FaCar /> {vehicle.vehicleName || 'N/A'}
            </S.VehicleTitle>
          </S.VehicleHeader>

          <S.VehicleGrid>
            <S.InfoItem>
              <S.InfoLabel><FaBarcode /> VIN</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleVin || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCar /> Model</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleModel || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            <S.InfoItem>
              <S.InfoLabel><FaCalendar /> Năm sản xuất</S.InfoLabel>
              <S.InfoValue>{vehicle.vehicleYear || 'N/A'}</S.InfoValue>
            </S.InfoItem>

            {vehicle.customerId && (
              <S.InfoItem>
                <S.InfoLabel><FaInfoCircle /> ID Khách hàng</S.InfoLabel>
                <S.InfoValue>{vehicle.customerId}</S.InfoValue>
              </S.InfoItem>
            )}

            {vehicle.customerName && (
              <S.InfoItem $fullWidth>
                <S.InfoLabel><FaInfoCircle /> Chủ sở hữu</S.InfoLabel>
                <S.InfoValue>{vehicle.customerName}</S.InfoValue>
              </S.InfoItem>
            )}
          </S.VehicleGrid>
        </S.VehicleCard>
      )}

      {/* Installed Parts Section */}
      {vehicle && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCog style={{ color: '#f59e0b' }} />
            Phụ tùng đã lắp đặt
          </h3>

          {loadingParts && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <FaSpinner className="spin" style={{ fontSize: '32px', marginBottom: '16px' }} />
              <p>Đang tải danh sách phụ tùng...</p>
            </div>
          )}

          {!loadingParts && installedParts.length === 0 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <FaCog style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }} />
              <p>Chưa có phụ tùng nào được lắp đặt trên xe này</p>
            </div>
          )}

          {!loadingParts && installedParts.length > 0 && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {installedParts.map((installed, index) => (
                <S.VehicleCard key={index} style={{ borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <S.InfoItem>
                      <S.InfoLabel><FaCog /> Tên phụ tùng</S.InfoLabel>
                      <S.InfoValue>{installed.partName || installed.part?.partName || 'N/A'}</S.InfoValue>
                    </S.InfoItem>

                    <S.InfoItem>
                      <S.InfoLabel><FaBarcode /> Part ID</S.InfoLabel>
                      <S.InfoValue>{installed.partId || installed.part?.partId || 'N/A'}</S.InfoValue>
                    </S.InfoItem>

                    <S.InfoItem>
                      <S.InfoLabel><FaBarcode /> ID Lắp đặt</S.InfoLabel>
                      <S.InfoValue>{installed.installedPartId || 'N/A'}</S.InfoValue>
                    </S.InfoItem>

                    <S.InfoItem>
                      <S.InfoLabel><FaCalendar /> Ngày lắp đặt</S.InfoLabel>
                      <S.InfoValue>{formatDate(installed.installationDate)}</S.InfoValue>
                    </S.InfoItem>

                    <S.InfoItem>
                      <S.InfoLabel><FaCalendar /> Bảo hành đến</S.InfoLabel>
                      <S.InfoValue>{formatDate(installed.warrantyExpirationDate)}</S.InfoValue>
                    </S.InfoItem>
                  </div>
                </S.VehicleCard>
              ))}
            </div>
          )}
        </div>
      )}
    </S.PageContainer>
  );
};

export default VehicleLookup;
