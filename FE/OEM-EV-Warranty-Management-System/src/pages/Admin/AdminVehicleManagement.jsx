import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import the master auth hook
import { useAdminVehicleManagement } from '../../hooks/useAdminVehicleManagement';
import * as S from './AdminVehicleManagement.styles';
import { FaCar, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner } from 'react-icons/fa';

// Form Modal Component with ALL required fields
const VehicleFormModal = ({ isOpen, onClose, onSubmit, vehicle, customers }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const warrantyEnd = oneYearLater.toISOString().split('T')[0];

      setFormData(vehicle ? { ...vehicle } : {
        vehicleName: '',
        vehicleModel: '',
        vehicleVin: '', // Biển số định dạng: XX-MĐ-YYY.ZZ
        vehicleYear: new Date().getFullYear(),
        purchaseDate: today,
        warrantyStartDate: today,
        warrantyEndDate: warrantyEnd,
        mileage: 0,
        customerId: ''
      });
    }
  }, [vehicle, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert mileage to number
    const submitData = {
      ...formData,
      mileage: parseInt(formData.mileage) || 0,
      vehicleYear: parseInt(formData.vehicleYear) || new Date().getFullYear()
    };
    const { success } = await onSubmit(submitData, vehicle?.vehicleId);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{vehicle ? 'Chỉnh sửa xe' : 'Tạo xe mới'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Tên xe *</S.Label>
            <S.Input
              name="vehicleName"
              value={formData.vehicleName || ''}
              onChange={handleInputChange}
              placeholder="VD: VinFast VF e34"
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Model xe *</S.Label>
            <S.Input
              name="vehicleModel"
              value={formData.vehicleModel || ''}
              onChange={handleInputChange}
              placeholder="VD: VF e34"
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Biển số xe điện * (Định dạng: XX-MĐ-YYY.ZZ)</S.Label>
            <S.Input
              name="vehicleVin"
              value={formData.vehicleVin || ''}
              onChange={handleInputChange}
              placeholder="VD: 29-MĐ-123.45"
              pattern="^[0-9]{2}-MĐ-[0-9]{3}\.[0-9]{2}$"
              title="Định dạng: XX-MĐ-YYY.ZZ (VD: 29-MĐ-123.45)"
              required
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Định dạng biển số xe điện: XX-MĐ-YYY.ZZ
            </small>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Năm sản xuất *</S.Label>
            <S.Input
              name="vehicleYear"
              type="number"
              min="1900"
              max="2030"
              value={formData.vehicleYear || ''}
              onChange={handleInputChange}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Số km đã đi *</S.Label>
            <S.Input
              name="mileage"
              type="number"
              min="0"
              value={formData.mileage || ''}
              onChange={handleInputChange}
              placeholder="VD: 5000"
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Ngày mua xe *</S.Label>
            <S.Input
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={handleInputChange}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Ngày bắt đầu bảo hành *</S.Label>
            <S.Input
              name="warrantyStartDate"
              type="date"
              value={formData.warrantyStartDate || ''}
              onChange={handleInputChange}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Ngày kết thúc bảo hành *</S.Label>
            <S.Input
              name="warrantyEndDate"
              type="date"
              value={formData.warrantyEndDate || ''}
              onChange={handleInputChange}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Khách hàng *</S.Label>
            <S.Select name="customerId" value={formData.customerId || ''} onChange={handleInputChange} required>
              <option value="">Chọn khách hàng</option>
              {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
            </S.Select>
          </S.FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button $primary type="submit">{vehicle ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component with new Authentication Flow
const AdminVehicleManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    vehicles, customers, loading: dataLoading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useAdminVehicleManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const openCreateForm = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  if (authLoading || dataLoading) {
    return <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>;
  }

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaCar /> Quản lý Xe (Admin)</S.HeaderTitle>
            <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo xe mới</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input placeholder="Tìm theo tên, model, VIN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {error ? (
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
                    <S.Td $mono>{vehicle.vehicleVin}</S.Td>
                    <S.Td>{vehicle.vehicleYear}</S.Td>
                    <S.Td>{vehicle.customer?.name || 'N/A'}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button $small onClick={() => openEditForm(vehicle)}><FaEdit /></S.Button>
                        <S.Button $small $danger onClick={() => handleDelete(vehicle.vehicleId)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableContainer>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
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
                (Tổng: {pagination.totalElements} xe)
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

export default AdminVehicleManagement;
