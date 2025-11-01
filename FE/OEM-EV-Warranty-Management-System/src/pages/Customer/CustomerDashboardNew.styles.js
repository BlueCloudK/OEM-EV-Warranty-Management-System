import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 0;
  position: relative;
  max-width: 1600px;
  margin: 0 auto;
`;

export const HeaderTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 48px;
  display: flex;
  align-items: center;
  gap: 20px;
  text-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(255, 255, 255, 0.1);
  letter-spacing: -0.5px;
  position: relative;
  padding-bottom: 24px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 120px;
    height: 4px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, transparent 100%);
    border-radius: 2px;
  }

  svg {
    font-size: 40px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
`;

export const WelcomeSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  h1 {
    font-size: 36px;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 12px 0;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.5px;
  }

  p {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $bgGradient }) => $bgGradient || 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
    opacity: 0.4;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  ${({ $clickable }) => $clickable && `
    &:hover {
      transform: translateY(-8px) scale(1.03);
      box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.15);

      &::before {
        opacity: 0.6;
      }
    }
  `}
`;

export const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-bottom: 20px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 0 24px ${({ $color }) => $color || '#3b82f6'}40;
  
  svg {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
  }
`;

export const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
`;

export const StatLabel = styled.div`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #ffffff;

  .spinner {
    font-size: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  }

  p {
    font-size: 18px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 16px;
  padding: 20px;
  color: #ffffff;
  margin-bottom: 24px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const ManagementCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  padding-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  gap: 24px;
  }
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $bgGradient }) => $bgGradient || 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
    opacity: 0.3;
    transition: opacity 0.4s ease;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: rotate(45deg);
    transition: transform 0.6s ease;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 
      0 24px 48px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);

    &::before {
      opacity: 0.5;
    }

    &::after {
      transform: rotate(45deg) translate(20%, 20%);
    }
  }

  &:active {
    transform: translateY(-8px) scale(1);
  }
`;
