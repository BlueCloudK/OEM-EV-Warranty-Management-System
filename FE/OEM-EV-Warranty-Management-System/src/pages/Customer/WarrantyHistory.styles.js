import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  padding: 20px;
  color: #1f2937;
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const Header = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e6edf3;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const BackButton = styled.button`
  background: #f3f4f6;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
`;

export const HeaderSubtitle = styled.p`
  margin: 4px 0 0 0;
  color: #4b5563;
  font-size: 1rem;
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const StatBadge = styled.div`
  background: #eef2f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

export const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);

  h3 {
    margin: 0 0 12px 0;
    color: #4a5568;
    font-size: 1.5rem;
  }
  p {
    margin: 0 0 24px 0;
    color: #718096;
    font-size: 1rem;
  }
`;

export const LoadingState = styled.div`
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  div {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    border: 1px solid #e6edf3;
  }
  svg {
    font-size: 3rem;
    color: #0f172a;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 20px;
  }
  p {
    margin: 0;
    color: #4a5568;
    font-size: 1.2rem;
  }
`;

export const ClaimsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

export const ClaimCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e6edf3;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  animation: slideInUp 0.6s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

export const ClaimHeader = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

export const ClaimTitle = styled.h3`
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 700;
`;

export const ClaimSubtitle = styled.p`
  margin: 0;
  color: #374151;
  font-size: 0.9rem;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $bgColor }) => $bgColor};
`;

export const ClaimDetails = styled.div`
  padding: 24px;
`;

export const DetailSection = styled.div`
  margin-bottom: 20px;
`;

export const DetailTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;

  svg {
    color: #4facfe;
    font-size: 14px;
  }
`;

export const DetailText = styled.p`
  color: #2d3748;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

export const InfoItem = styled.div`
  div {
    font-size: 14px;
    line-height: 1.6;
  }
  span {
    color: #718096;
  }
  strong {
    color: #2d3748;
    font-weight: 600;
  }
`;

export const RejectionReasonContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  svg {
    color: #ef4444;
    font-size: 14px;
  }
  span {
    font-size: 12px;
    color: #ef4444;
    font-weight: 600;
    text-transform: uppercase;
  }
  p {
    color: #991b1b;
    font-size: 14px;
    margin: 0;
    font-weight: 500;
  }
`;

export const ActionButton = styled.button`
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  width: 100%;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
`;

export const PageButton = styled.button`
  background: ${({ $disabled }) => ($disabled ? '#eef2f6' : '#e6f0fb')};
  color: ${({ $disabled }) => ($disabled ? '#9ca3af' : '#1f2937')};
  border: 1px solid #e5e7eb;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const PageInfo = styled.div`
  background: #eef2f6;
  border-radius: 8px;
  padding: 10px 16px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
`;
