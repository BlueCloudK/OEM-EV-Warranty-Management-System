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

export const SearchBar = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e8ed;

  svg {
    color: #7f8c8d;
    font-size: 18px;
  }

  input {
    flex: 1;
    border: none;
    background: none;
    font-size: 15px;
    outline: none;

    &::placeholder {
      color: #95a5a6;
    }
  }
`;

export const ResultsInfo = styled.div`
  margin-bottom: 20px;
  color: #7f8c8d;
  font-size: 14px;

  strong {
    color: #2c3e50;
  }
`;

export const MapSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

export const MapHint = styled.p`
  text-align: center;
  margin-bottom: 16px;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
`;

export const MapLabel = styled.div`
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
`;

export const CenterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
`;

export const CenterCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: ${props => props.$isSelected
    ? "0 8px 16px rgba(16, 185, 129, 0.3)"
    : "0 4px 6px rgba(0, 0, 0, 0.1)"};
  border-left: 4px solid ${props => props.$isSelected ? "#059669" : "#10b981"};
  transition: all 0.3s ease;
  cursor: pointer;
  transform: ${props => props.$isSelected ? "translateY(-4px)" : "none"};
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const CenterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0fdf4;

  h3 {
    margin: 0;
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
  }
`;

export const CenterInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6b7280;

  svg {
    flex-shrink: 0;
    font-size: 16px;
  }

  a {
    color: #10b981;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const RatingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 6px;
  margin-top: 8px;
  width: fit-content;

  svg {
    font-size: 16px;
  }

  span {
    color: #92400e;
    font-size: 14px;
    font-weight: 600;
  }
`;

export const SelectedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #059669;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
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
