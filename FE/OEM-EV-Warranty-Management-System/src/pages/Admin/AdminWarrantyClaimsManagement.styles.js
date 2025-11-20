import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const PageContainer = styled.div`
  padding: 24px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const HeaderTitle = styled.h1`
  font-size: 28px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FilterContainer = styled.div``;

export const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
`;

export const TableContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
`;

export const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
`;

export const Button = styled.button`
  background: ${({ $success, $danger }) => ($success ? '#16a34a' : $danger ? '#dc2626' : '#64748b')};
  color: white;
  border: none;
  padding: ${({ $small }) => ($small ? '6px 12px' : '10px 16px')};
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover { opacity: 0.9; }
`;

export const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  min-width: 110px;
  text-align: center;
  display: inline-block;
  white-space: nowrap;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'SUBMITTED': return '#f59e0b';
      case 'PENDING_PAYMENT': return '#f97316';
      case 'PAYMENT_CONFIRMED': return '#06b6d4';
      case 'MANAGER_REVIEW': return '#8b5cf6';
      case 'PROCESSING': return '#3b82f6';
      case 'COMPLETED': return '#16a34a';
      case 'REJECTED': return '#dc2626';
      default: return '#64748b';
    }
  }};
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #64748b;
`;

export const EmptyState = styled(LoadingState)``;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 500px;
  max-width: 90vw;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 100px;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;
