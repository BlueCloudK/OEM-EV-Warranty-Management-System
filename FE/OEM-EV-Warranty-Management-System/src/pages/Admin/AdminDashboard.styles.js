import styled from 'styled-components';

export const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

export const StatCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 24px 58px rgba(2, 44, 40, 0.14);
  transition: all 0.25s ease;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  /* color accent border */
  &::before{
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: ${({ $color }) => $color || '#3b82f6'};
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 32px 70px rgba(2, 44, 40, 0.16);
  }
`;

export const StatCardTitle = styled.h3`
  margin: 0 0 5px 0;
  color: #374151;
  font-size: 14px;
`;

export const StatCardValue = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: ${({ $color }) => $color || '#3b82f6'};
`;

export const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 26px 58px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(226, 232, 240, 0.85);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ChartContainer = styled(SectionCard)`
  h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const SectionIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
`;

export const SectionMeta = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #0f766e;
`;

export const ProgressShell = styled.div`
  width: 100%;
  height: 40px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

export const ProgressSegment = styled.div`
  width: ${({ $percent }) => `${$percent}%`};
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: width 0.3s ease;
`;

export const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 13px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
`;

export const LegendSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

export const LegendText = styled.span`
  strong {
    color: #0f172a;
  }
`;

export const RecentActivityContainer = styled(SectionCard)`
  gap: 18px;
  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: #0f172a;
  }
`;

export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
`;

export const ActivityIcon = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(11, 107, 97, 0.12);
  color: #0b6b61;
  font-size: 18px;
`;

export const ActivityContent = styled.div`
  flex: 1;
  color: #0f172a;
`;

export const ActivityTime = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;
