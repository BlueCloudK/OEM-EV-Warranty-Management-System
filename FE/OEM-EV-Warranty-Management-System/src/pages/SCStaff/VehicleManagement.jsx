import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleManagement } from '../../hooks/useVehicleManagement';
import * as S from './VehicleManagement.styles';
import { FaCar, FaPlus, FaEdit, FaSearch, FaSpinner, FaTrash, FaClipboardCheck, FaWrench, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
            <S.Button primary type="submit">{vehicle ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Install Part Modal Component
const InstallPartFormModal = ({ isOpen, onClose, onSubmit, vehicle, parts }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: vehicle?.vehicleId,
        partId: '',
        installationDate: new Date().toISOString().slice(0, 10),
        warrantyExpirationDate: '',
        mileageAtInstallation: vehicle?.mileage || 0
      });
      setErrors({});
    }
  }, [vehicle, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.partId) newErrors.partId = 'Phụ tùng là bắt buộc.';
    if (!formData.installationDate) newErrors.installationDate = 'Ngày lắp đặt là bắt buộc.';
    if (!formData.warrantyExpirationDate) newErrors.warrantyExpirationDate = 'Ngày hết hạn bảo hành là bắt buộc.';
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Convert IDs to numbers (Long type) before sending
    // installedPartId sẽ được backend tự động generate
    const payload = {
      vehicleId: parseInt(formData.vehicleId, 10),
      partId: parseInt(formData.partId, 10), // Part ID phải là Long
      installationDate: formData.installationDate,
      warrantyExpirationDate: formData.warrantyExpirationDate,
      mileageAtInstallation: parseInt(formData.mileageAtInstallation, 10) || 0
    };
    const { success, message } = await onSubmit(payload);
    if (success) {
      onClose();
    } else {
      setErrors({ general: message });
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>Lắp đặt Phụ tùng cho xe {vehicle?.vehicleName}</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}
          <S.FormGroup>
            <S.Label>Phụ tùng *</S.Label>
            <S.Select name="partId" value={formData.partId || ''} onChange={handleInputChange} required hasError={!!errors.partId}>
              <option value="">Chọn phụ tùng</option>
              {parts.map(p => <option key={p.partId} value={p.partId}>{p.partName}</option>)}
            </S.Select>
            {errors.partId && <S.ErrorText>{errors.partId}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Ngày lắp đặt *</S.Label>
            <S.Input name="installationDate" type="date" value={formData.installationDate || ''} onChange={handleInputChange} required hasError={!!errors.installationDate} />
            {errors.installationDate && <S.ErrorText>{errors.installationDate}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Ngày hết hạn bảo hành *</S.Label>
            <S.Input name="warrantyExpirationDate" type="date" value={formData.warrantyExpirationDate || ''} onChange={handleInputChange} required hasError={!!errors.warrantyExpirationDate} />
            {errors.warrantyExpirationDate && <S.ErrorText>{errors.warrantyExpirationDate}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Số km tại thời điểm lắp đặt *</S.Label>
            <S.Input
              name="mileageAtInstallation"
              type="number"
              min="0"
              value={formData.mileageAtInstallation || 0}
              onChange={handleInputChange}
              required
              hasError={!!errors.mileageAtInstallation}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Số km hiện tại của xe: {vehicle?.mileage?.toLocaleString() || 'N/A'} km
            </small>
            {errors.mileageAtInstallation && <S.ErrorText>{errors.mileageAtInstallation}</S.ErrorText>}
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button primary type="submit">Lắp đặt</S.Button>
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
    vehicles, customers, parts, installedParts, loading, error, searchTerm, setSearchTerm,
    searchType, setSearchType, handleSearch, handleCreateOrUpdate, handleDelete, handleInstallPart, fetchInstalledPartsForVehicle, clearInstalledParts
  } = useVehicleManagement();

  const [showForm, setShowForm] = useState(false);
  const [showInstallPartForm, setShowInstallPartForm] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const openCreateForm = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const openInstallPartForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowInstallPartForm(true);
  };

  const toggleInstalledParts = (vehicleId) => {
    if (expandedVehicleId === vehicleId) {
      setExpandedVehicleId(null);
      clearInstalledParts();
    } else {
      setExpandedVehicleId(vehicleId);
      fetchInstalledPartsForVehicle(vehicleId);
    }
  };

  const createWarrantyClaim = (vehicle) => {
    navigate('/scstaff/warranty-claims', { state: { prefilledVehicle: vehicle, openCreateForm: true } });
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'id':
        return 'Nhập Mã Xe (ID)...';
      case 'vin':
        return 'Nhập Số VIN...';
      case 'customer':
        return 'Nhập ID Khách hàng...';
      case 'model':
        return 'Nhập Model Xe...';
      case 'general':
      default:
        return 'Nhập từ khóa bất kỳ...';
    }
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
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="general">Tìm kiếm chung</option>
              <option value="id">Mã Xe (ID)</option>
              <option value="vin">Số VIN</option>
              <option value="customer">ID Khách hàng</option>
              <option value="model">Model Xe</option>
            </select>
            <S.Input placeholder={getSearchPlaceholder()} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
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
              <thead><tr><S.Th>ID Xe</S.Th><S.Th>Tên xe</S.Th><S.Th>Model</S.Th><S.Th>VIN</S.Th><S.Th>Năm</S.Th><S.Th>Chủ sở hữu</S.Th><S.Th>ID Khách hàng</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <React.Fragment key={vehicle.vehicleId}>
                    <tr className={expandedVehicleId === vehicle.vehicleId ? 'expanded-row' : ''}>
                      <S.Td>{vehicle.vehicleId}</S.Td>
                      <S.Td>{vehicle.vehicleName}</S.Td>
                      <S.Td>{vehicle.vehicleModel}</S.Td>
                      <S.Td mono>{vehicle.vehicleVin}</S.Td>
                      <S.Td>{vehicle.vehicleYear}</S.Td>
                      <S.Td>{vehicle.customerName || 'N/A'}</S.Td>
                      <S.Td>{vehicle.customerId}</S.Td>
                      <S.Td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <S.Button small onClick={() => openEditForm(vehicle)}><FaEdit /></S.Button>
                          <S.Button small danger onClick={() => handleDelete(vehicle.vehicleId)}><FaTrash /></S.Button>
                          <S.Button small onClick={() => openInstallPartForm(vehicle)}><FaWrench /></S.Button>
                          <S.Button small primary onClick={() => createWarrantyClaim(vehicle)}><FaClipboardCheck /></S.Button>
                          <S.Button small onClick={() => toggleInstalledParts(vehicle.vehicleId)}>
                            {expandedVehicleId === vehicle.vehicleId ? <FaChevronUp /> : <FaChevronDown />}
                          </S.Button>
                        </div>
                      </S.Td>
                    </tr>
                    {expandedVehicleId === vehicle.vehicleId && (
                      <tr className="child-row">
                        <td colSpan="8" style={{ padding: '0', border: 'none' }}>
                          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderLeft: '3px solid #3b82f6' }}>
                            {installedParts.length > 0 ? (
                              <S.Table>
                                <thead>
                                  <tr>
                                    <S.Th>ID Lắp đặt</S.Th>
                                    <S.Th>ID Phụ tùng</S.Th>
                                    <S.Th>Ngày lắp đặt</S.Th>
                                    <S.Th>Ngày hết hạn BH</S.Th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {installedParts.map(part => (
                                    <tr key={part.installedPartId}>
                                      <S.Td>{part.installedPartId}</S.Td>
                                      <S.Td>{part.partId}</S.Td>
                                      <S.Td>{part.installationDate}</S.Td>
                                      <S.Td>{part.warrantyExpirationDate}</S.Td>
                                    </tr>
                                  ))}
                                </tbody>
                              </S.Table>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px' }}>Chưa có phụ tùng nào được lắp đặt.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

        <InstallPartFormModal 
          isOpen={showInstallPartForm} 
          onClose={() => setShowInstallPartForm(false)} 
          onSubmit={handleInstallPart} 
          vehicle={selectedVehicle} 
          parts={parts}
        />

      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default VehicleManagement;
