import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow-x: hidden;
  align-items: stretch;

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

export const Sidebar = styled.aside`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '90px' : '320px')};
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 
    8px 0 32px rgba(0, 0, 0, 0.12),
    inset -1px 0 0 rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

export const SidebarHeader = styled.div`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '28px 16px' : '32px 24px')};
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  position: relative;
  backdrop-filter: blur(10px);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

export const SidebarToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '16px' : '16px 20px')};
  margin: 0 12px 8px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
      : 'transparent'
  };
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.75)')};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  position: relative;
  backdrop-filter: ${({ $active }) => ($active ? 'blur(10px)' : 'none')};
  box-shadow: ${({ $active }) => 
    $active 
      ? '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
      : 'none'
  };

  svg {
    font-size: 20px;
    flex-shrink: 0;
    filter: ${({ $active }) => ($active ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none')};
    transition: all 0.3s ease;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 4px;
    height: ${({ $active }) => ($active ? '60%' : '0%')};
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
    border-radius: 0 4px 4px 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  }

  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)' 
        : 'rgba(255, 255, 255, 0.1)'
    };
    color: #ffffff;
    transform: translateX(${({ $active, $isCollapsed }) => ($active || $isCollapsed ? '0' : '8px')});
    
    svg {
      transform: scale(1.1);
      filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.4));
    }
  }

  span {
    white-space: nowrap;
    text-shadow: ${({ $active }) => 
      $active 
        ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
        : 'none'
    };
  }
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  position: relative;
  z-index: 1;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;
