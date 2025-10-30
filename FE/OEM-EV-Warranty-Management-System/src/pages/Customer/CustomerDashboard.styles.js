import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

export const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px;
  border-radius: 16px;
  color: white;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.95;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  background: ${props => props.$bgGradient || 'white'};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-4px)' : 'none'};
    box-shadow: ${props => props.$clickable ? '0 8px 16px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  }
`;

export const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#10b981'};
    font-size: 24px;
    box-shadow: 0 4px 8px ${props => props.$color || '#10b981'}20;
  }
`;

export const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.$color || '#10b981'};
  margin-bottom: 4px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const ActionCard = styled.div`
  background: ${props => props.$bgGradient || 'white'};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
`;

export const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#10b981'};
    font-size: 24px;
    box-shadow: 0 8px 16px ${props => props.$color || '#10b981'}20;
  }
`;

export const ActionTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const ActionDescription = styled.div`
  font-size: 14px;
  color: #64748b;
  line-height: 1.4;
`;

export const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .arrow {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$color || '#10b981'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #10b981;
  }
`;

export const AlertsContainer = styled.div`
  margin-bottom: 32px;
`;

export const AlertCard = styled.div`
  background: ${props => {
    if (props.$type === 'warning') return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    if (props.$type === 'danger') return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
    if (props.$type === 'info') return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
    return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
  }};
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .icon {
    font-size: 24px;
    color: ${props => {
      if (props.$type === 'warning') return '#f59e0b';
      if (props.$type === 'danger') return '#ef4444';
      if (props.$type === 'info') return '#3b82f6';
      return '#10b981';
    }};
  }

  .content {
    flex: 1;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .message {
    font-size: 14px;
    color: #64748b;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;

  .spinner {
    font-size: 48px;
    color: #10b981;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;

  svg {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 16px;
    margin: 8px 0;
  }
`;
