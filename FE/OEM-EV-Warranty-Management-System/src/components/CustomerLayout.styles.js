import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

export const Sidebar = styled.aside`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  background: linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%);
  color: white;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
`;

export const SidebarHeader = styled.div`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '20px 10px' : '24px 20px')};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
`;

export const SidebarToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

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
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'rgba(168, 85, 247, 0.2)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#e9d5ff' : '#cbd5e1')};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  font-size: 14px;
  font-weight: 500;

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(168, 85, 247, 0.15);
    color: #e9d5ff;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`;
