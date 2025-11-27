import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  padding: 24px;
  min-height: 100vh;
  background: #f9fafb;
`;

export const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: auto;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.3);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

export const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

export const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

export const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const PerformanceCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

export const PerformanceIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;

export const PerformanceContent = styled.div`
  flex: 1;
`;

export const PerformanceLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
`;

export const PerformanceValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
`;

export const UrgentSection = styled.div`
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 2px solid #fca5a5;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
`;

export const UrgentHeader = styled.div`
  margin-bottom: 20px;
`;

export const UrgentTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

export const UrgentSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #7f1d1d;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${({ $color }) => $color};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

export const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatTitle = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
`;

export const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
`;

export const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  svg {
    color: #6b7280;
  }
`;

export const FilterButton = styled.button`
  background: ${({ $active }) => $active ? '#14b8a6' : '#f3f4f6'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 1px solid ${({ $active }) => $active ? '#14b8a6' : '#d1d5db'};
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? '#0d9488' : '#e5e7eb'};
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #f3f4f6;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Button = styled.button`
  background: ${({ primary, danger, small }) =>
    primary ? '#14b8a6' : danger ? '#ef4444' : '#6b7280'};
  color: white;
  border: none;
  padding: ${({ small }) => (small ? '6px 12px' : '10px 16px')};
  border-radius: 6px;
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
    opacity: 0.6;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

export const PageInfo = styled.span`
  color: #374151;
  font-size: 14px;
  font-weight: 500;
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
  z-index: 9999;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 700px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 20px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 24px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 24px;
`;

export const DetailItem = styled.div`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

export const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

export const DetailValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-word;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #14b8a6;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
`;

export const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #14b8a6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #0d9488;
  }
`;

export const ClaimsList = styled.div`
  display: grid;
  gap: 16px;
`;

export const ClaimCard = styled.div`
  background: ${({ $urgent }) => $urgent ? '#ffffff' : '#f9fafb'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${({ $urgent }) => $urgent ? '#fca5a5' : 'transparent'};

  &:hover {
    background: white;
    border-color: ${({ $urgent }) => $urgent ? '#ef4444' : '#14b8a6'};
    box-shadow: ${({ $urgent }) => $urgent ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(20, 184, 166, 0.15)'};
  }
`;

export const ClaimHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const ClaimId = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) => {
    switch ($status) {
      case 'MANAGER_REVIEW': return '#fef3c7';
      case 'PROCESSING': return '#dbeafe';
      case 'COMPLETED': return '#d1fae5';
      case 'REJECTED': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'MANAGER_REVIEW': return '#92400e';
      case 'PROCESSING': return '#1e40af';
      case 'COMPLETED': return '#065f46';
      case 'REJECTED': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

export const ClaimInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

export const ClaimInfoRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const ClaimLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

export const ClaimValue = styled.span`
  font-size: 13px;
  color: #1f2937;
  font-weight: 600;
`;

export const ClaimDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const QuickActions = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

export const ActionButton = styled.button`
  background: ${({ $color }) => $color};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    opacity: 0.95;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;

  h3 {
    margin: 16px 0 8px 0;
    color: #1f2937;
    font-size: 24px;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
`;

export const LoadingState = styled(EmptyState)`
  svg {
    font-size: 48px;
    color: #14b8a6;
    animation: ${spin} 1s linear infinite;
  }
  p {
    margin-top: 16px;
    color: #6b7280;
    font-size: 16px;
  }
`;

/* Daily Claim Limit Card Styles */
export const DailyLimitCard = styled.div`
  background: ${({ $limitReached, $nearLimit }) =>
    $limitReached ? '#fef2f2' : $nearLimit ? '#fffbeb' : '#f0fdfa'};
  border: 2px solid ${({ $limitReached, $nearLimit }) =>
    $limitReached ? '#fca5a5' : $nearLimit ? '#fcd34d' : '#99f6e4'};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
`;

export const DailyLimitHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const DailyLimitTitle = styled.h3`
  margin: 0;
  color: #0f766e;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const LimitBadge = styled.div`
  background: ${({ $error }) => $error ? '#fca5a5' : '#fcd34d'};
  color: ${({ $error }) => $error ? '#991b1b' : '#92400e'};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DailyLimitContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
`;

export const DailyLimitNumbers = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

export const DailyLimitBig = styled.div`
  font-size: 56px;
  font-weight: 800;
  color: #0f766e;
  line-height: 1;
`;

export const DailyLimitLabel = styled.div`
  font-size: 20px;
  color: #6b7280;
  font-weight: 600;
`;

export const DailyLimitInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
  color: #374151;

  strong {
    color: #0f766e;
    font-weight: 700;
    font-size: 16px;
  }
`;

export const DailyProgressBar = styled.div`
  width: 100%;
  height: 16px;
  background: #e0f2f1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

export const DailyProgressFill = styled.div`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $limitReached, $nearLimit }) =>
    $limitReached
      ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
      : $nearLimit
        ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)'};
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const DailyWarningMessage = styled.div`
  background: ${({ $error }) => $error ? '#fee2e2' : '#fef3c7'};
  color: ${({ $error }) => $error ? '#991b1b' : '#92400e'};
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid ${({ $error }) => $error ? '#fca5a5' : '#fcd34d'};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  svg {
    flex-shrink: 0;
    font-size: 18px;
  }
`;
