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
  background: ${({ $primary, $danger }) => 
    $primary 
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      : $danger 
      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      : 'rgba(107, 114, 128, 0.8)'};
  color: white;
  border: none;
  padding: ${({ $small }) => ($small ? '8px 14px' : '12px 24px')};
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    ${({ $primary, $danger }) => 
      $primary 
        ? 'background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);'
        : $danger 
        ? 'background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);'
        : 'background: rgba(107, 114, 128, 1);'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
    margin-top: 16px;
    color: #6b7280;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow-y: auto;
  padding: 20px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

export const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  margin: auto;

  h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    text-align: center;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;

  svg {
    font-size: 16px;
    color: #6366f1;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : 'rgba(0, 0, 0, 0.1)')};
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? '#ef4444' : '#6366f1')};
    box-shadow: 0 0 0 3px ${({ $hasError }) => ($hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)')};
    background: rgba(255, 255, 255, 1);
  }

  &:hover {
    border-color: ${({ $hasError }) => ($hasError ? '#ef4444' : 'rgba(0, 0, 0, 0.2)')};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : 'rgba(0, 0, 0, 0.1)')};
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? '#ef4444' : '#6366f1')};
    box-shadow: 0 0 0 3px ${({ $hasError }) => ($hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)')};
    background: rgba(255, 255, 255, 1);
  }

  &:hover {
    border-color: ${({ $hasError }) => ($hasError ? '#ef4444' : 'rgba(0, 0, 0, 0.2)')};
  }
`;

export const ErrorText = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #ef4444;
`;
