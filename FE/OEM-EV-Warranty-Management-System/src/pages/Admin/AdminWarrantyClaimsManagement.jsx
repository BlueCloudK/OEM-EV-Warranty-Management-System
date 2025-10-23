import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminWarrantyClaimsManagement } from '../../hooks/useAdminWarrantyClaimsManagement';
import * as S from './AdminWarrantyClaimsManagement.styles';
import { FaClipboardList, FaSearch, FaTrash, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

// Main Page Component
const AdminWarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const {
    claims, loading, error, pagination, filters,
    handleFilterChange, applyFilters, handleUpdateStatus, handleDelete, handlePageChange
  } = useAdminWarrantyClaimsManagement();

  const handleApprove = (claimId) => {
    handleUpdateStatus(claimId, 'APPROVED');
  };

  const handleReject = (claimId) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (reason) {
      handleUpdateStatus(claimId, 'REJECTED', reason);
    }
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaClipboardList /> Quản lý Yêu cầu Bảo hành (Admin)</S.HeaderTitle>
          </S.HeaderTop>
          <S.FilterContainer>
            <input placeholder="Tìm kiếm..." value={filters.searchTerm} onChange={(e) => handleFilterChange('searchTerm', e.target.value)} />
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="all">Tất cả Trạng thái</option>
              <option value="SUBMITTED">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="REJECTED">Từ chối</option>
            </select>
            <S.Button $small onClick={applyFilters}><FaSearch /> Lọc</S.Button>
          </S.FilterContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : claims.length === 0 ? (
          <S.EmptyState><h3>Không có yêu cầu bảo hành nào</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.Th>ID</S.Th>
                  <S.Th>Mô tả</S.Th>
                  <S.Th>Xe (VIN)</S.Th>
                  <S.Th>Linh kiện</S.Th>
                  <S.Th>Trạng thái</S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <S.Td>{claim.id}</S.Td>
                    <S.Td>{claim.description}</S.Td>
                    <S.Td>{claim.vehicle?.vin || 'N/A'}</S.Td>
                    <S.Td>{claim.part?.name || 'N/A'}</S.Td>
                    <S.Td>{claim.status}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {claim.status === 'SUBMITTED' && (
                          <>
                            <S.Button $small $success onClick={() => handleApprove(claim.id)}><FaCheck /></S.Button>
                            <S.Button $small $danger onClick={() => handleReject(claim.id)}><FaTimes /></S.Button>
                          </>
                        )}
                        <S.Button $small $danger onClick={() => handleDelete(claim.id)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default AdminWarrantyClaimsManagement;
