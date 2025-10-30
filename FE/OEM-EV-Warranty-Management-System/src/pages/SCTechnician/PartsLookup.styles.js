import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Header = styled.div`
  margin-bottom: 32px;
`;

export const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #f59e0b;
  }
`;

export const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

export const SearchCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease;
`;

export const SearchTypeSelector = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid ${({ $active }) => $active ? '#f59e0b' : '#d1d5db'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#f59e0b' : '#6b7280'};
  background: ${({ $active }) => $active ? '#fef3c7' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #f59e0b;
  }

  input {
    cursor: pointer;
  }
`;

export const SearchInputGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

export const SearchButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

export const ResetButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;

export const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;

  svg {
    font-size: 20px;
  }
`;

export const NotFoundMessage = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.3s ease;

  svg {
    font-size: 80px;
    opacity: 0.5;
    margin-bottom: 20px;
    color: #f59e0b;
  }

  h3 {
    margin: 16px 0 8px 0;
    color: #1f2937;
    font-size: 24px;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }
`;

export const PartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #f59e0b;
  animation: ${fadeIn} 0.3s ease;
`;

export const PartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 16px;
`;

export const PartTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #f59e0b;
  }
`;

export const StockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  border: 2px solid ${({ $color }) => $color};
`;

export const PartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

export const InfoItem = styled.div`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

export const InfoLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

export const InfoValue = styled.div`
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
`;
