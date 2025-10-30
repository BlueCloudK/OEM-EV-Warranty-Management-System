import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  padding: 24px;
`;

export const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: auto;
`;

export const Header = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  svg {
    color: #6b7280;
  }

  span {
    font-weight: 500;
    color: #374151;
  }
`;

export const FilterButton = styled.button`
  background: ${({ $active }) => $active ? '#14b8a6' : '#f3f4f6'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 1px solid ${({ $active }) => $active ? '#14b8a6' : '#d1d5db'};
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? '#0d9488' : '#e5e7eb'};
  }
`;

export const Button = styled.button`
  background: ${({ primary, danger, small }) =>
    primary ? '#14b8a6' : danger ? '#ef4444' : '#6b7280'};
  color: white;
  border: none;
  padding: ${({ small }) => (small ? '6px 12px' : '10px 16px')};
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const TableContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #f3f4f6;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) => {
    switch ($status) {
      case 'MANAGER_REVIEW': return '#fef3c7';
      case 'PROCESSING': return '#dbeafe';
      case 'COMPLETED': return '#d1fae5';
      case 'REJECTED': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'MANAGER_REVIEW': return '#92400e';
      case 'PROCESSING': return '#1e40af';
      case 'COMPLETED': return '#065f46';
      case 'REJECTED': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  color: #6b7280;
`;

export const LoadingState = styled(EmptyState)`
  svg {
    font-size: 24px;
    color: #14b8a6;
    animation: ${spin} 1s linear infinite;
  }
  p {
    margin-top: 16px;
    color: #6b7280;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const PageInfo = styled.span`
  color: #374151;
  font-size: 14px;
  font-weight: 500;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 700px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 20px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 24px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 24px;
`;

export const DetailItem = styled.div`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

export const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

export const DetailValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-word;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #14b8a6;
  }
`;
