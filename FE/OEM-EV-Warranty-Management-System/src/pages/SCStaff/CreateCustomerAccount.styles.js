import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
`;

export const ContentWrapper = styled.div`
  max-width: 800px;
  margin: auto;
`;

export const Header = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const FormContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;

export const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ primary, disabled }) => (disabled ? '#9ca3af' : primary ? '#ef4444' : '#6b7280')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

export const BackButton = styled(Button)`
    background: #f3f4f6;
    color: #374151;
    padding: 8px 12px;
`;

export const Notification = styled.div`
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  background: ${({ type }) => (type === 'success' ? '#d1fae5' : '#fee2e2')};
  border: 1px solid ${({ type }) => (type === 'success' ? '#10b981' : '#ef4444')};
  color: ${({ type }) => (type === 'success' ? '#065f46' : '#dc2626')};
`;

export const Spinner = styled.span`
  animation: ${spin} 1s linear infinite;
`;
