import styled from 'styled-components';

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

export const Button = styled.button`
  background: ${({ $primary, $danger, $small }) => ($primary ? '#1d4ed8' : $danger ? '#ef4444' : '#6b7280')};
  color: white;
  border: none;
  padding: ${({ $small }) => ($small ? '6px 12px' : '10px 16px')};
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover { opacity: 0.9; }
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
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
`;

export const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #f3f4f6;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

export const LoadingState = styled(EmptyState)``;

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

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
`;

export const ErrorText = styled.p`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
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
