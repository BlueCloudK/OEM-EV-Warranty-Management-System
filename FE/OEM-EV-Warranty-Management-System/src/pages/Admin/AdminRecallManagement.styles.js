import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

export const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  p {
    margin: 8px 0 0 0;
    color: #7f8c8d;
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  ${props => props.primary && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
  `}

  ${props => props.danger && `
    background: #e74c3c;
    color: white;

    &:hover {
      background: #c0392b;
    }
  `}

  ${props => !props.primary && !props.danger && `
    background: #ecf0f1;
    color: #2c3e50;

    &:hover {
      background: #bdc3c7;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    animation: ${spin} 1s linear infinite;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid ${props => props.color || '#667eea'};
  transition: transform 0.2s;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const StatIcon = styled.div`
  font-size: 32px;
  color: ${props => props.color || '#667eea'};
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
`;

export const FilterBar = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
`;

export const SearchBox = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e8ed;

  svg {
    color: #7f8c8d;
  }

  input {
    flex: 1;
    border: none;
    background: none;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: #95a5a6;
    }
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FilterLabel = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const ResultsInfo = styled.div`
  margin-bottom: 16px;
  color: #7f8c8d;
  font-size: 14px;

  strong {
    color: #2c3e50;
  }
`;

export const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid #e1e8ed;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

export const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`;

export const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #2c3e50;

  small {
    display: block;
    margin-top: 4px;
    color: #7f8c8d;
  }
`;

export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color || '#667eea'};
  color: white;
  white-space: nowrap;
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    margin-bottom: 20px;
    opacity: 0.5;
  }

  p {
    font-size: 18px;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #667eea;

  .spinner {
    font-size: 48px;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #7f8c8d;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: ${props => props.large ? '1000px' : '700px'};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

export const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h2 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const Form = styled.form`
  padding: 24px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const ModalFooter = styled.div`
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

export const DetailGrid = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

export const DetailSection = styled.div`
  ${props => props.fullWidth && 'grid-column: 1 / -1;'}
`;

export const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #667eea;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
`;

export const DetailItem = styled.div`
  margin-bottom: 12px;
`;

export const DetailLabel = styled.div`
  font-weight: 500;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 4px;
`;

export const DetailValue = styled.div`
  color: #2c3e50;
  font-size: 14px;
`;

export const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #d4edda;
  border: 1px solid #28a745;
  border-radius: 8px;
  margin-top: 12px;

  svg {
    color: #28a745;
    font-size: 20px;
    flex-shrink: 0;
  }

  div {
    color: #155724;
    font-size: 14px;
    line-height: 1.5;
  }
`;
