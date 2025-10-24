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
  max-width: 1400px;
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
    color: #10b981;
  }
`;

export const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

export const StatisticsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const StatIcon = styled.div`
  font-size: 32px;
  opacity: 0.8;
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
`;

export const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FilterLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const FilterButton = styled.button`
  background: ${({ $active }) => $active ? '#10b981' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 2px solid ${({ $active }) => $active ? '#10b981' : '#d1d5db'};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f3f4f6'};
    border-color: ${({ $active }) => $active ? '#059669' : '#9ca3af'};
  }
`;

export const FeedbacksGrid = styled.div`
  display: grid;
  gap: 20px;
  animation: ${fadeIn} 0.5s ease;
`;

export const FeedbackCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #10b981;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

export const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FeedbackInfo = styled.div`
  flex: 1;
  min-width: 250px;
`;

export const FeedbackTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FeedbackMeta = styled.div`
  font-size: 13px;
  color: #6b7280;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const FeedbackContent = styled.div`
  margin-bottom: 16px;
`;

export const FeedbackText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #10b981;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    animation: ${spin} 1s linear infinite;
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  svg {
    font-size: 80px;
    opacity: 0.5;
    margin-bottom: 20px;
    color: #10b981;
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

export const ErrorState = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const PaginationButton = styled.button`
  background: ${({ disabled }) => disabled ? '#e5e7eb' : '#10b981'};
  color: ${({ disabled }) => disabled ? '#9ca3af' : 'white'};
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;
