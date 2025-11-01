import styled from 'styled-components';

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
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-color: ${({ status }) => {
    switch (status) {
      case 'SUBMITTED': return '#f59e0b';
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
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow-y: auto;
  padding: 20px;

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

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: rgba(255, 255, 255, 1);
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
  }
`;
