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
  max-width: 900px;
  margin: auto;
  animation: ${fadeIn} 0.5s ease;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
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

export const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
`;

export const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
`;

export const ProfileInfo = styled.div`
  flex: 1;
`;

export const ProfileName = styled.h2`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
`;

export const ProfileEmail = styled.p`
  margin: 0;
  font-size: 16px;
  color: #6b7280;
`;

export const FormSection = styled.div`
  display: ${({ $hidden }) => $hidden ? 'none' : 'block'};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    color: #6b7280;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    color: #6b7280;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const Button = styled.button`
  background: ${({ $primary, $danger }) => $primary ? '#ef4444' : $danger ? '#6b7280' : '#e5e7eb'};
  color: ${({ $primary, $danger }) => $primary || $danger ? 'white' : '#374151'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const InfoSection = styled.div`
  display: ${({ $hidden }) => $hidden ? 'none' : 'block'};
`;

export const InfoGrid = styled.div`
  display: grid;
  gap: 20px;
`;

export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border-left: 4px solid #ef4444;
`;

export const InfoLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const InfoValue = styled.span`
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #ef4444;

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

export const SuccessMessage = styled.div`
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #065f46;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  svg {
    font-size: 20px;
  }
`;
