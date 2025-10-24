import styled from 'styled-components';

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 6px 24px rgba(2, 44, 40, 0.08);
  transition: all 0.25s ease;
  border: 1px solid #e5e7eb;
  border-left: 4px solid ${({ $color }) => $color || '#3b82f6'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(2, 44, 40, 0.12);
  }
`;

export const StatCardTitle = styled.h3`
  margin: 0 0 5px 0;
  color: #374151;
  font-size: 14px;
`;

export const StatCardValue = styled.p`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: ${({ $color }) => $color || '#3b82f6'};
`;

export const RecentActivityContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;
