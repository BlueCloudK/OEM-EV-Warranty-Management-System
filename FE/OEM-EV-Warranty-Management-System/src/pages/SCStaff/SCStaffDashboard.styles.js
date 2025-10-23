import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  font-family: 'Inter', 'Segoe UI', sans-serif;
`;

export const Sidebar = styled.div`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '70px' : '260px')};
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  border-right: 1px solid #475569;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
`;

export const SidebarHeader = styled.div`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '16px' : '20px')};
  border-bottom: 1px solid #475569;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SidebarToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '12px' : '12px 16px')};
  margin-bottom: 4px;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.15)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#60a5fa' : '#cbd5e1')};
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.3)' : 'transparent')};

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.1)')};
    color: ${({ $active }) => ($active ? '#60a5fa' : '#f1f5f9')};
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.2)')};
  }
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;
`;

export const DashboardHeader = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(16, 24, 40, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
`;

export const ManagementCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const Card = styled.div`
  background: ${({ $bgGradient }) => $bgGradient || '#fff'};
  border-radius: 16px;
  border: 2px solid transparent;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${({ $color }) => $color || '#3b82f6'};
    box-shadow: 0 20px 40px ${({ $color }) => $color || '#000'}20;
  }
`;

export const StatsContainer = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 24px rgba(16, 24, 40, 0.04);
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;
