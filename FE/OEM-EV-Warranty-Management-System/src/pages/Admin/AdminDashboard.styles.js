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

export const Banner = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 40px;
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

export const BannerTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
`;

export const BannerSubtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 20px 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const BannerButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const BannerButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

export const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
`;

export const StatCardTitle = styled.h3`
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const StatCardValue = styled.p`
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
`;

export const StatCardIcon = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 48px;
  opacity: 0.7;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
  color: ${({ $color }) => $color || '#ffffff'};
`;

export const RecentActivityContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
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

export const RecentActivityTitle = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }
`;

export const ActivityIcon = styled.div`
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

export const ActivityText = styled.div`
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

export const ActivityTime = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
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

export const EmptyState = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 40px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
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
