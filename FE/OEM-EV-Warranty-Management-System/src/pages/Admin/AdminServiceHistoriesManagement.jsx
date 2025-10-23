import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminServiceHistoriesManagement } from '../../hooks/useAdminServiceHistoriesManagement';
import * as S from './AdminServiceHistoriesManagement.styles';
import { FaHistory, FaSearch, FaTrash, FaSpinner } from 'react-icons/fa';

// Main Page Component
const AdminServiceHistoriesManagement = () => {
  const navigate = useNavigate();
  const {
    histories, loading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleDelete, handlePageChange
  } = useAdminServiceHistoriesManagement();

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaHistory /> Quản lý Lịch sử Dịch vụ (Admin)</S.HeaderTitle>
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : histories.length === 0 ? (
          <S.EmptyState><h3>Không có lịch sử dịch vụ nào</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.Th>ID</S.Th>
                  <S.Th>Ngày</S.Th>
                  <S.Th>Loại DV</S.Th>
                  <S.Th>Mô tả</S.Th>
                  <S.Th>Xe (VIN)</S.Th>
                  <S.Th>Linh kiện</S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {histories.map(history => (
                  <tr key={history.id}>
                    <S.Td>{history.id}</S.Td>
                    <S.Td>{new Date(history.serviceDate).toLocaleDateString('vi-VN')}</S.Td>
                    <S.Td>{history.serviceType}</S.Td>
                    <S.Td>{history.description}</S.Td>
                    <S.Td>{history.vehicle?.vin || 'N/A'}</S.Td>
                    <S.Td>{history.part?.name || 'N/A'}</S.Td>
                    <S.Td>
                      <S.Button $small $danger onClick={() => handleDelete(history.id)}><FaTrash /></S.Button>
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

export default AdminServiceHistoriesManagement;
