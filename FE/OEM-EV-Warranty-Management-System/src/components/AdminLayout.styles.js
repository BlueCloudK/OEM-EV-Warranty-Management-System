import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0b6b61 0%, #0f766e 40%, #1e293b 100%);
  padding: 28px;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  color: white;
  padding: 30px 40px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 14px 40px rgba(2, 44, 40, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

export const HeaderTitle = styled.h1`
  font-size: 32px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const HeaderSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin: 0;
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.3s;
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const Layout = styled.div`
  display: flex;
  gap: 18px;
`;

export const Sidebar = styled.aside`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '72px' : '260px')};
  min-width: ${({ $isCollapsed }) => ($isCollapsed ? '72px' : '240px')};
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 16px;
  height: fit-content;
  position: sticky;
  top: 16px;
  align-self: flex-start;
  transition: all 0.3s ease;
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #1f2937;
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')}; /* Added this line */
  
  &:hover {
    background: ${({ $active }) => ($active ? '#eef2ff' : '#f8fafc')};
  }
`;

export const MainContent = styled.main`
  flex: 1;
`;
