import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleManagement } from '../../hooks/useVehicleManagement';
import * as S from './VehicleManagement.styles';
import { FaCar, FaPlus, FaEdit, FaSearch, FaArrowLeft, FaSpinner, FaTrash, FaClipboardCheck } from 'react-icons/fa';

// Form Modal Component
const VehicleFormModal = ({ isOpen, onClose, onSubmit, vehicle, customers }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(vehicle ? { ...vehicle } : { vehicleName: '', vehicleModel: '', vehicleVin: '', vehicleYear: new Date().getFullYear(), customerId: '' });
    }
  }, [vehicle, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await onSubmit(formData, vehicle?.vehicleId);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>{vehicle ? 'Chỉnh sửa xe' : 'Tạo xe mới'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Tên xe *</S.Label>
            <S.Input name="vehicleName" value={formData.vehicleName || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Model xe *</S.Label>
            <S.Input name="vehicleModel" value={formData.vehicleModel || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>VIN *</S.Label>
            <S.Input name="vehicleVin" value={formData.vehicleVin || ''} onChange={handleInputChange} required maxLength={17} />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Năm sản xuất *</S.Label>
            <S.Input name="vehicleYear" type="number" value={formData.vehicleYear || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Khách hàng *</S.Label>
            <S.Select name="customerId" value={formData.customerId || ''} onChange={handleInputChange} required>
              <option value="">Chọn khách hàng</option>
              {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
            </S.Select>
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button primary type="submit">{vehicle ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const VehicleManagement = () => {
  const navigate = useNavigate();
  const {
    vehicles, customers, loading, error, pagination, searchTerm, setSearchTerm,
    searchType, setSearchType, handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useVehicleManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const openCreateForm = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const createWarrantyClaim = (vehicle) => {
    navigate('/scstaff/warranty-claims', { state: { prefilledVehicle: vehicle, openCreateForm: true } });
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaCar /> Quản lý Xe</S.HeaderTitle>
            <S.Button primary onClick={openCreateForm}><FaPlus /> Tạo xe mới</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}><option value="general">Tìm chung</option><option value="vin">VIN</option><option value="customer">Customer ID</option></select>
            <S.Input placeholder={`Tìm theo ${searchType}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : vehicles.length === 0 ? (
          <S.EmptyState><h3>Không tìm thấy xe</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>Tên xe</S.Th><S.Th>Model</S.Th><S.Th>VIN</S.Th><S.Th>Năm</S.Th><S.Th>Chủ sở hữu</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.vehicleId}>
                    <S.Td>{vehicle.vehicleName}</S.Td>
                    <S.Td>{vehicle.vehicleModel}</S.Td>
                    <S.Td mono>{vehicle.vehicleVin}</S.Td>
                    <S.Td>{vehicle.vehicleYear}</S.Td>
                    <S.Td>{vehicle.customer?.name || 'N/A'}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button small onClick={() => openEditForm(vehicle)}><FaEdit /></S.Button>
                        <S.Button small danger onClick={() => handleDelete(vehicle.vehicleId)}><FaTrash /></S.Button>
                        <S.Button small primary onClick={() => createWarrantyClaim(vehicle)}><FaClipboardCheck /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <VehicleFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          vehicle={selectedVehicle} 
          customers={customers}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default VehicleManagement;
