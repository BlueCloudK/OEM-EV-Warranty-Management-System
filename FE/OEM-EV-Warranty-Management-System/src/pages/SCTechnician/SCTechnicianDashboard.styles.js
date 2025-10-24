import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 24px;
`;

export const HeaderTitle = styled.h1`
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ManagementCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

export const Card = styled.div`
  background: ${({ $bgGradient }) => $bgGradient || '#fff'};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;
