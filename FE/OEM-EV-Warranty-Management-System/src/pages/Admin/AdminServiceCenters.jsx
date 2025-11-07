import React, { useState, useEffect } from 'react';
import * as S from './AdminServiceCenters.styles';
import {
  FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaPhone, FaClock,
  FaSearch, FaSpinner, FaInfoCircle, FaUsers, FaClipboardList,
  FaStar, FaTimes, FaSave
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';
import GoongMap from '../../components/GoongMap';

const AdminServiceCenters = () => {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    openingHours: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchServiceCenters();
  }, [page]);

  const fetchServiceCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/service-centers?page=${page}&size=10&sortBy=serviceCenterId&sortDir=DESC`);
      console.log('📍 Service Centers:', response);

      if (response.content) {
        setServiceCenters(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching service centers:', err);
      setError(err.message || 'Không thể tải danh sách trung tâm dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      fetchServiceCenters();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/service-centers/search?keyword=${searchKeyword}&page=0&size=100`);
      console.log('🔍 Search results:', response);

      if (response.content) {
        setServiceCenters(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message || 'Không thể tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setFormData({
      name: '',
      address: '',
      phone: '',
      openingHours: '8:00 - 17:00',
      latitude: '10.76', // Tp Hồ Chí Mình - giá trị mặc định
      longitude: '106.66'
    });
    setShowModal(true);
  };

  const handleEditClick = (center) => {
    setModalMode('edit');
    setSelectedCenter(center);
    setFormData({
      name: center.serviceCenterName,
      address: center.address,
      phone: center.phone,
      openingHours: center.openingHours,
      latitude: center.latitude,
      longitude: center.longitude
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (centerId) => {
    if (!await window.confirm('Bạn có chắc chắn muốn xóa trung tâm dịch vụ này?')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient(`/api/service-centers/${centerId}`, { method: 'DELETE' });
      alert('Đã xóa trung tâm dịch vụ thành công!');
      fetchServiceCenters();
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert(err.message || 'Không thể xóa trung tâm dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const requestData = {
        serviceCenterName: formData.name,
        address: formData.address,
        phone: formData.phone,
        openingHours: formData.openingHours,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (modalMode === 'create') {
        await apiClient('/api/service-centers', {
          method: 'POST',
          body: JSON.stringify(requestData)
        });
        alert('Tạo trung tâm dịch vụ thành công!');
      } else {
        await apiClient(`/api/service-centers/${selectedCenter.serviceCenterId}`, {
          method: 'PUT',
          body: JSON.stringify(requestData)
        });
        alert('Cập nhật trung tâm dịch vụ thành công!');
      }

      setShowModal(false);
      fetchServiceCenters();
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.PageContainer>
      <S.Header>
        <div>
          <S.HeaderTitle>
            <FaMapMarkerAlt /> Quản lý Trung tâm Dịch vụ
          </S.HeaderTitle>
          <S.HeaderSubtitle>
            Quản lý thông tin các trung tâm bảo hành và sửa chữa xe điện
          </S.HeaderSubtitle>
        </div>
        <S.CreateButton onClick={handleCreateClick}>
          <FaPlus /> Tạo mới
        </S.CreateButton>
      </S.Header>

      {/* Search Bar */}
      <S.SearchCard onSubmit={handleSearch}>
        <S.SearchInput
          type="text"
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <S.SearchButton type="submit">
          <FaSearch /> Tìm kiếm
        </S.SearchButton>
        {searchKeyword && (
          <S.ResetButton type="button" onClick={() => { setSearchKeyword(''); fetchServiceCenters(); }}>
            Làm mới
          </S.ResetButton>
        )}
      </S.SearchCard>

      {/* Stats */}
      <S.StatsCard>
        <S.StatItem>
          <S.StatLabel>Tổng số trung tâm</S.StatLabel>
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
          <p>Đang tải...</p>
        </S.LoadingContainer>
      )}

      {/* Empty State */}
      {!loading && serviceCenters.length === 0 && (
        <S.EmptyState>
          <FaMapMarkerAlt style={{ fontSize: '64px', opacity: 0.3 }} />
          <h3>Chưa có trung tâm dịch vụ nào</h3>
          <p>Bấm nút "Tạo mới" để thêm trung tâm dịch vụ</p>
        </S.EmptyState>
      )}

      {/* Service Centers Grid */}
      {!loading && serviceCenters.length > 0 && (
        <>
          <S.GridContainer>
            {serviceCenters.map((center) => (
              <S.Card key={center.serviceCenterId}>
                <S.CardHeader>
                  <S.CenterName>
                    <FaMapMarkerAlt /> {center.serviceCenterName}
                  </S.CenterName>
                  <S.Actions>
                    <S.ActionButton onClick={() => handleEditClick(center)}>
                      <FaEdit />
                    </S.ActionButton>
                    <S.ActionButton $danger onClick={() => handleDeleteClick(center.serviceCenterId)}>
                      <FaTrash />
                    </S.ActionButton>
                  </S.Actions>
                </S.CardHeader>

                <S.CardBody>
                  <S.InfoRow>
                    <S.InfoLabel><FaMapMarkerAlt /> Địa chỉ</S.InfoLabel>
                    <S.InfoValue>{center.address}</S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel><FaPhone /> Điện thoại</S.InfoLabel>
                    <S.InfoValue>{center.phone}</S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel><FaClock /> Giờ mở cửa</S.InfoLabel>
                    <S.InfoValue>{center.openingHours}</S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel>📍 Tọa độ</S.InfoLabel>
                    <S.InfoValue>
                      {center.latitude}, {center.longitude}
                    </S.InfoValue>
                  </S.InfoRow>

                  {/* Statistics */}
                  <S.StatsRow>
                    <S.StatBadge>
                      <FaUsers /> {center.totalStaff || 0} nhân viên
                    </S.StatBadge>
                    <S.StatBadge>
                      <FaClipboardList /> {center.totalClaims || 0} claims
                    </S.StatBadge>
                    {center.averageRating && (
                      <S.StatBadge>
                        <FaStar /> {center.averageRating.toFixed(1)}
                      </S.StatBadge>
                    )}
                  </S.StatsRow>
                </S.CardBody>
              </S.Card>
            ))}
          </S.GridContainer>

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

      {/* Create/Edit Modal */}
      {showModal && (
        <S.Modal>
          <S.ModalOverlay onClick={() => setShowModal(false)} />
          <S.ModalContent>
            <S.ModalHeader>
              <h2>{modalMode === 'create' ? 'Tạo mới trung tâm dịch vụ' : 'Cập nhật trung tâm dịch vụ'}</h2>
              <S.CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
              </S.CloseButton>
            </S.ModalHeader>

            <S.ModalForm onSubmit={handleSubmit}>
              <S.FormGroup>
                <S.Label>Tên trung tâm *</S.Label>
                <S.Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="VD: Trung tâm bảo hành Tp Hồ Chí Mình"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Địa chỉ *</S.Label>
                <S.Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="VD: 123 Nguyễn Trãi, Thanh Xuân, Tp Hồ Chí Mình"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Số điện thoại *</S.Label>
                <S.Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="VD: 024-1234567"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Giờ mở cửa *</S.Label>
                <S.Input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  required
                  placeholder="VD: 8:00 - 17:00"
                />
              </S.FormGroup>

              <S.FormRow>
                <S.FormGroup>
                  <S.Label>Vĩ độ (Latitude) *</S.Label>
                  <S.Input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                    placeholder="VD: 10.76"
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Kinh độ (Longitude) *</S.Label>
                  <S.Input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                    placeholder="VD: 106.66"
                  />
                </S.FormGroup>
              </S.FormRow>

              {/* Goong Map */}
              <S.FormGroup>
                <S.Label>
                  <FaMapMarkerAlt /> Chọn vị trí trên bản đồ
                </S.Label>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  💡 Click vào bản đồ hoặc kéo marker để chọn vị trí. Tọa độ sẽ tự động cập nhật.
                </p>
                <GoongMap
                  latitude={parseFloat(formData.latitude) || 10.76}
                  longitude={parseFloat(formData.longitude) || 106.66}
                  height="350px"
                  editable={true}
                  onLocationChange={({ latitude, longitude }) => {
                    setFormData({
                      ...formData,
                      latitude: latitude.toFixed(6),
                      longitude: longitude.toFixed(6)
                    });
                  }}
                />
              </S.FormGroup>

              <S.FormActions>
                <S.CancelButton type="button" onClick={() => setShowModal(false)}>
                  <FaTimes /> Hủy
                </S.CancelButton>
                <S.SubmitButton type="submit">
                  <FaSave /> {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                </S.SubmitButton>
              </S.FormActions>
            </S.ModalForm>
          </S.ModalContent>
        </S.Modal>
      )}
    </S.PageContainer>
  );
};

export default AdminServiceCenters;
