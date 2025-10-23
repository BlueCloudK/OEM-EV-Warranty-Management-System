import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
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
  flex-wrap: wrap;
  gap: 16px;
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Button = styled.button`
  background: ${({ $primary, $danger }) => ($primary ? '#1d4ed8' : $danger ? '#ef4444' : '#6b7280')};
  color: white;
  border: none;
  padding: ${({ $small }) => ($small ? '8px 16px' : '12px 20px')};
  border-radius: 8px;
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
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
`;

export const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const LoadingState = styled(EmptyState)`
  svg {
    font-size: 24px;
    color: #1d4ed8;
    animation: ${spin} 1s linear infinite;
  }
  p {
    margin-top: 12px;
    color: #6b7280;
  }
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
  padding: 24px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ hasError }) => (hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 6px;
  box-sizing: border-box;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ hasError }) => (hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 80px;
  resize: vertical;
`;

export const ErrorText = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #ef4444;
`;
