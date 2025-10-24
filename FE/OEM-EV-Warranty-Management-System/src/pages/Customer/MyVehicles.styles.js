import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const PageContainer = styled.div`
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

export const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: auto;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  color: white;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

export const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const VehiclesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.5s ease;
`;

export const VehicleCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

export const VehicleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
`;

export const VehicleIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

export const VehicleTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

export const VehicleSubtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
`;

export const VehicleDetails = styled.div`
  display: grid;
  gap: 12px;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

export const DetailLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DetailValue = styled.span`
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
`;

export const WarrantyBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $valid }) => $valid ? '#d1fae5' : '#fee2e2'};
  color: ${({ $valid }) => $valid ? '#065f46' : '#991b1b'};
`;

export const ActionButton = styled.button`
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #3b82f6;

  div {
    text-align: center;
  }

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    animation: ${spin} 1s linear infinite;
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

export const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  svg {
    font-size: 80px;
    opacity: 0.5;
    margin-bottom: 20px;
  }

  h3 {
    margin: 16px 0 8px 0;
    color: #1f2937;
    font-size: 24px;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }
`;

export const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  svg {
    font-size: 20px;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 800px;
  max-width: 95vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 16px 16px 0 0;

  h2 {
    margin: 0;
    font-size: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 28px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
`;

export const DetailItem = styled.div`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

export const DetailItemLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const DetailItemValue = styled.div`
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
`;

export const SectionTitle = styled.h3`
  margin: 24px 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
`;

export const InfoCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${({ $color }) => $color || '#3b82f6'};
`;

export const InfoCardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

export const InfoCardContent = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
`;
