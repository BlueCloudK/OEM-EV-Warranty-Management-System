import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPartsManagement } from '../../hooks/useAdminPartsManagement';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import * as S from './AdminPartsManagement.styles';
import { FaCogs, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner, FaSort, FaSortUp, FaSortDown, FaSyncAlt } from 'react-icons/fa';

// Form Modal Component
const PartFormModal = ({ isOpen, onClose, onSubmit, part, categories }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(part ? { ...part } : {
        partName: '',
        partNumber: '',
        manufacturer: '',
        price: 0,
        categoryId: '',
        hasExtendedWarranty: false,
        defaultWarrantyMonths: '',
        defaultWarrantyMileage: '',
        gracePeriodDays: '',
        paidWarrantyFeePercentageMin: '',
        paidWarrantyFeePercentageMax: ''
      });
      setErrors({});
    }
  }, [part, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.partName) newErrors.partName = 'Tên phụ tùng là bắt buộc.';
    if (!formData.partNumber) newErrors.partNumber = 'Mã phụ tùng là bắt buộc.';
    if (!formData.manufacturer) newErrors.manufacturer = 'Nhà sản xuất là bắt buộc.';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0.';
    if (!formData.categoryId) newErrors.categoryId = 'Loại phụ tùng là bắt buộc.';

    if (formData.hasExtendedWarranty) {
      if (!formData.defaultWarrantyMonths || formData.defaultWarrantyMonths <= 0) {
        newErrors.defaultWarrantyMonths = 'Thời hạn bảo hành phải lớn hơn 0.';
      }
      if (!formData.defaultWarrantyMileage || formData.defaultWarrantyMileage <= 0) {
        newErrors.defaultWarrantyMileage = 'Giới hạn km phải lớn hơn 0.';
      }
      if (formData.gracePeriodDays && formData.gracePeriodDays < 0) {
        newErrors.gracePeriodDays = 'Grace period không được âm.';
      }
      if (formData.paidWarrantyFeePercentageMin) {
        const min = parseFloat(formData.paidWarrantyFeePercentageMin);
        if (min < 0 || min > 1) newErrors.paidWarrantyFeePercentageMin = 'Phải từ 0 đến 1 (0-100%).';
      }
      if (formData.paidWarrantyFeePercentageMax) {
        const max = parseFloat(formData.paidWarrantyFeePercentageMax);
        if (max < 0 || max > 1) newErrors.paidWarrantyFeePercentageMax = 'Phải từ 0 đến 1 (0-100%).';
      }
      if (formData.paidWarrantyFeePercentageMin && formData.paidWarrantyFeePercentageMax) {
        if (parseFloat(formData.paidWarrantyFeePercentageMin) > parseFloat(formData.paidWarrantyFeePercentageMax)) {
          newErrors.paidWarrantyFeePercentageMax = 'Phí tối đa phải >= phí tối thiểu.';
        }
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleExtendedWarrantyChange = (e) => {
    const checked = e.target.checked;
    setFormData(prev => {
      if (checked && !prev.defaultWarrantyMonths) {
        return {
          ...prev,
          hasExtendedWarranty: checked,
          defaultWarrantyMonths: 96,
          defaultWarrantyMileage: 192000,
          gracePeriodDays: 365,
          paidWarrantyFeePercentageMin: 0.20,
          paidWarrantyFeePercentageMax: 0.50
        };
      } else if (!checked) {
        return {
          ...prev,
          hasExtendedWarranty: false,
          defaultWarrantyMonths: '',
          defaultWarrantyMileage: '',
          gracePeriodDays: '',
          paidWarrantyFeePercentageMin: '',
          paidWarrantyFeePercentageMax: ''
        };
      }
      return { ...prev, hasExtendedWarranty: checked };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      hasExtendedWarranty: formData.hasExtendedWarranty,
      defaultWarrantyMonths: formData.hasExtendedWarranty ? parseInt(formData.defaultWarrantyMonths) : null,
      defaultWarrantyMileage: formData.hasExtendedWarranty ? parseInt(formData.defaultWarrantyMileage) : null,
      gracePeriodDays: formData.hasExtendedWarranty && formData.gracePeriodDays ? parseInt(formData.gracePeriodDays) : null,
      paidWarrantyFeePercentageMin: formData.hasExtendedWarranty && formData.paidWarrantyFeePercentageMin ? parseFloat(formData.paidWarrantyFeePercentageMin) : null,
      paidWarrantyFeePercentageMax: formData.hasExtendedWarranty && formData.paidWarrantyFeePercentageMax ? parseFloat(formData.paidWarrantyFeePercentageMax) : null
    };

    const { success, message } = await onSubmit(submitData, part?.partId);
    if (success) {
      onClose();
    } else {
      setErrors({ general: message });
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{part ? 'Chỉnh sửa Phụ tùng' : 'Tạo Phụ tùng mới'}</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}

          {part && (
            <S.FormGroup>
              <S.Label>ID Phụ tùng (Tự động)</S.Label>
              <S.Input value={part.partId} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
            </S.FormGroup>
          )}

          <div style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1f2937' }}>Thông tin cơ bản</h3>

            <S.FormGroup>
              <S.Label>Tên phụ tùng *</S.Label>
              <S.Input name="partName" value={formData.partName || ''} onChange={handleInputChange} required hasError={!!errors.partName} placeholder="VD: Pin Lithium-ion 75kWh" />
              {errors.partName && <S.ErrorText>{errors.partName}</S.ErrorText>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Mã phụ tùng (Part Number) *</S.Label>
              <S.Input name="partNumber" value={formData.partNumber || ''} onChange={handleInputChange} required hasError={!!errors.partNumber} placeholder="VD: BAT-75KWH-001" />
              {errors.partNumber && <S.ErrorText>{errors.partNumber}</S.ErrorText>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Nhà sản xuất *</S.Label>
              <S.Input name="manufacturer" value={formData.manufacturer || ''} onChange={handleInputChange} required hasError={!!errors.manufacturer} placeholder="VD: CATL" />
              {errors.manufacturer && <S.ErrorText>{errors.manufacturer}</S.ErrorText>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Giá (VNĐ) *</S.Label>
              <S.Input name="price" type="number" step="0.01" value={formData.price || 0} onChange={handleInputChange} required hasError={!!errors.price} placeholder="VD: 150000000" />
              {errors.price && <S.ErrorText>{errors.price}</S.ErrorText>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Loại phụ tùng *</S.Label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: errors.categoryId ? '1px solid #ef4444' : '1px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="">-- Chọn loại phụ tùng --</option>
                {categories && categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId && <S.ErrorText>{errors.categoryId}</S.ErrorText>}
            </S.FormGroup>
          </div>

          <div style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1f2937' }}>Cấu hình bảo hành</h3>

            <S.FormGroup>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="hasExtendedWarranty"
                  name="hasExtendedWarranty"
                  checked={formData.hasExtendedWarranty || false}
                  onChange={handleExtendedWarrantyChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <S.Label htmlFor="hasExtendedWarranty" style={{ margin: 0, cursor: 'pointer' }}>
                  Phụ tùng có bảo hành mở rộng riêng
                </S.Label>
              </div>
              <small style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginTop: '4px' }}>
                ✓ Chọn cho phụ tùng quan trọng (Pin, Motor, Động cơ) → Tự động điền giá trị mẫu<br />
                ✗ Không chọn cho phụ tùng thường (Đèn, Nội thất) → Dùng bảo hành xe
              </small>
            </S.FormGroup>

            {formData.hasExtendedWarranty && (
              <>
                <S.FormGroup>
                  <S.Label>Thời gian bảo hành mặc định (tháng)</S.Label>
                  <S.Input
                    name="defaultWarrantyMonths"
                    type="number"
                    min="1"
                    value={formData.defaultWarrantyMonths || ''}
                    onChange={handleInputChange}
                    hasError={!!errors.defaultWarrantyMonths}
                    placeholder="VD: 96"
                  />
                  {errors.defaultWarrantyMonths && <S.ErrorText>{errors.defaultWarrantyMonths}</S.ErrorText>}
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Giới hạn km (km)</S.Label>
                  <S.Input
                    name="defaultWarrantyMileage"
                    type="number"
                    min="1"
                    value={formData.defaultWarrantyMileage || ''}
                    onChange={handleInputChange}
                    hasError={!!errors.defaultWarrantyMileage}
                    placeholder="VD: 192000"
                  />
                  {errors.defaultWarrantyMileage && <S.ErrorText>{errors.defaultWarrantyMileage}</S.ErrorText>}
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Grace Period (ngày)</S.Label>
                  <S.Input
                    name="gracePeriodDays"
                    type="number"
                    min="0"
                    value={formData.gracePeriodDays || ''}
                    onChange={handleInputChange}
                    hasError={!!errors.gracePeriodDays}
                    placeholder="VD: 365"
                  />
                  {errors.gracePeriodDays && <S.ErrorText>{errors.gracePeriodDays}</S.ErrorText>}
                </S.FormGroup>

                <S.FormGroup style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <S.Label>Phí bảo hành trả phí tối thiểu (%)</S.Label>
                    <S.Input
                      name="paidWarrantyFeePercentageMin"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={formData.paidWarrantyFeePercentageMin || ''}
                      onChange={handleInputChange}
                      hasError={!!errors.paidWarrantyFeePercentageMin}
                      placeholder="VD: 0.20"
                    />
                    {errors.paidWarrantyFeePercentageMin && <S.ErrorText>{errors.paidWarrantyFeePercentageMin}</S.ErrorText>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <S.Label>Phí bảo hành trả phí tối đa (%)</S.Label>
                    <S.Input
                      name="paidWarrantyFeePercentageMax"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={formData.paidWarrantyFeePercentageMax || ''}
                      onChange={handleInputChange}
                      hasError={!!errors.paidWarrantyFeePercentageMax}
                      placeholder="VD: 0.50"
                    />
                    {errors.paidWarrantyFeePercentageMax && <S.ErrorText>{errors.paidWarrantyFeePercentageMax}</S.ErrorText>}
                  </div>
                </S.FormGroup>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button primary type="submit">{part ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const AdminPartsManagement = () => {
  const {
    parts,
    categories,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
    refreshParts,
    sortConfig,
    handleSort
  } = useAdminPartsManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Auto-refresh logic
  const { lastUpdated, isRefreshing } = useAutoRefresh({
    fetchData: (silent) => refreshParts(silent),
    shouldPoll: true,
    pollInterval: 30000
  });

  const openCreateForm = () => {
    setSelectedPart(null);
    setShowForm(true);
  };

  const openEditForm = (part) => {
    setSelectedPart(part);
    setShowForm(true);
  };

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
              <FaCogs /> Quản lý Phụ tùng
              {lastUpdated && (
                <small style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRefreshing && <FaSpinner className="spinner" />}
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                </small>
              )}
            </S.HeaderTitle>
            <div style={{ display: 'flex', gap: '12px' }}>
              <S.Button onClick={() => refreshParts()} disabled={loading}>
                <FaSyncAlt style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Làm mới
              </S.Button>
              <S.Button primary onClick={openCreateForm}><FaPlus /> Thêm phụ tùng</S.Button>
            </div>
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
        </S.Header >

        {
          loading ? (
            <S.LoadingState ><FaSpinner /> <p>Đang tải...</p></S.LoadingState >
          ) : error ? (
            <S.EmptyState > {error}</S.EmptyState >
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
                    <th>Hành động</th>
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
                      <S.Td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <S.Button $small onClick={() => openEditForm(part)}><FaEdit /></S.Button>
                          <S.Button $small $danger onClick={() => handleDelete(part.partId)}><FaTrash /></S.Button>
                        </div>
                      </S.Td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            </S.TableContainer>
          )
        }

        {/* Pagination Controls */}
        {
          !loading && !error && parts.length > 0 && pagination.totalPages > 0 && (
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
          )
        }

        <PartFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateOrUpdate}
          part={selectedPart}
          categories={categories}
        />

      </S.ContentWrapper >
    </S.PageContainer >
  );
};

export default AdminPartsManagement;