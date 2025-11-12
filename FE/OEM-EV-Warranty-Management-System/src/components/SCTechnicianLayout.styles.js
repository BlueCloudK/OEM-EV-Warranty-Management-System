import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

export const Sidebar = styled.aside`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  color: white;
  transition: width 0.3s ease, box-shadow .2s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
  position: fixed;
  left: 0;
  top: 62px; /* Start below navbar */
  height: calc(100vh - 62px); /* Full height minus navbar */
  overflow-y: auto;
  z-index: 1000;

  /* Beautiful scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
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
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform .15s ease, box-shadow .2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0,0,0,.18);
  }
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '12px' : '12px 16px')};
  margin-bottom: 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'rgba(16, 185, 129, 0.2)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#6ee7b7' : '#cbd5e1')};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  font-size: 14px;
  font-weight: 500;

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
    box-shadow: inset 0 0 0 1px rgba(16,185,129,.25);
  }
`;

export const MainContent = styled.main`
  flex: 1;
  margin-left: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  padding: 28px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  background: #f4f6fb;
  min-height: calc(100vh - 62px);
`;
