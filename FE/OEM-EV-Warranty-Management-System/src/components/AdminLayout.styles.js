import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow-x: hidden;
  padding: 24px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(79, 172, 254, 0.3) 0%, transparent 50%);
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
`;

export const Container = styled.div`
  min-height: 100vh;
  background: transparent;
  padding: 0;
`;

export const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0.3;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

export const HeaderTitle = styled.h1`
  font-size: 32px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-weight: 800;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
`;

export const HeaderSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const Layout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  position: relative;
  z-index: 1;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
`;

export const Sidebar = styled.aside`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  min-width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  max-width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0.3;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px 12px 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
`;

export const SidebarToggleButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)')};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: 15px;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
      : 'transparent'};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: 8px;
  text-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none')};
  border-left: ${({ $active }) => ($active ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid transparent')};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $active }) => 
      $active 
        ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
        : 'transparent'};
    border-radius: 14px;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.3s ease;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  svg {
    font-size: 20px;
    filter: ${({ $active }) => ($active ? 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))' : 'none')};
  }
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
        : 'rgba(255, 255, 255, 0.1)'};
    transform: translateX(4px);
    color: #ffffff;
  }

  &:active {
    transform: translateX(2px);
  }
`;

export const MainContent = styled.main`
  flex: 1;
  position: relative;
  z-index: 1;
  min-width: 0;
  width: 100%;
  overflow-x: hidden;
`;
