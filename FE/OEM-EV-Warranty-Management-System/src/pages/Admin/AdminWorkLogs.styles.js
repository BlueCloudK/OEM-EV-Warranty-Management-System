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
  margin-bottom: 24px;
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
    color: #8b5cf6;
  }
`;

export const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

export const NoticeBanner = styled.div`
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-left: 6px solid #f59e0b;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  color: #78350f;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 14px;
  line-height: 1.6;
  animation: ${fadeIn} 0.3s ease;
  box-shadow: 0 4px 6px rgba(251, 191, 36, 0.1);

  svg {
    font-size: 24px;
    margin-top: 2px;
    flex-shrink: 0;
    color: #f59e0b;
  }

  strong {
    font-weight: 700;
    color: #92400e;
  }

  ul {
    list-style-type: disc;
  }

  li {
    margin: 4px 0;
  }
`;

export const FilterCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease;
`;

export const FilterLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #8b5cf6;
  }
`;

export const FilterOptions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid ${({ $active }) => $active ? '#8b5cf6' : '#d1d5db'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#8b5cf6' : '#6b7280'};
  background: ${({ $active }) => $active ? '#f3e8ff' : 'white'};
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #8b5cf6;
  }

  input {
    cursor: pointer;
  }
`;

export const FilterInputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

export const FilterInput = styled.input`
  padding: 10px 14px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ApplyButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

export const ResetButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;

export const StatsCard = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 200px;
  border-left: 4px solid #8b5cf6;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
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

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  svg {
    color: #8b5cf6;
    margin-bottom: 16px;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.3s ease;

  svg {
    color: #8b5cf6;
    margin-bottom: 20px;
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

export const HintText = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  display: inline-block;
`;

export const WorkLogsGrid = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease;
`;

export const WorkLogCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #8b5cf6;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const WorkLogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
`;

export const WorkLogId = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #8b5cf6;
  }
`;

export const ClaimBadge = styled.div`
  display: inline-flex;
  padding: 6px 14px;
  background: #f3e8ff;
  color: #6b21a8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid #8b5cf6;
`;

export const WorkLogBody = styled.div`
  display: grid;
  gap: 16px;
`;

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const InfoLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #8b5cf6;
  }
`;

export const InfoValue = styled.div`
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
`;

export const EmailText = styled.span`
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
`;

export const DurationBadge = styled.div`
  display: inline-flex;
  padding: 6px 12px;
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #10b981;
`;

export const DescriptionSection = styled.div`
  margin-top: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

export const DescriptionLabel = styled.div`
  font-size: 14px;
  color: #374151;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #8b5cf6;
  }
`;

export const DescriptionText = styled.div`
  font-size: 15px;
  color: #1f2937;
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const PaginationButton = styled.button`
  padding: 10px 20px;
  background: ${({ disabled }) => disabled ? '#e5e7eb' : '#8b5cf6'};
  color: ${({ disabled }) => disabled ? '#9ca3af' : 'white'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #7c3aed;
    transform: translateY(-1px);
  }
`;

export const PageInfo = styled.div`
  font-weight: 600;
  color: #374151;
`;
