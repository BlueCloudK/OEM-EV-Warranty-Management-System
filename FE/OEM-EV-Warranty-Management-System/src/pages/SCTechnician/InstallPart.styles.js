import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 20px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

export const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

export const Header = styled.div`
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

export const Select = styled.select`
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

export const Button = styled.button`
  padding: 12px 20px;
  background-color: ${({ disabled }) => (disabled ? '#9ca3af' : '#2563eb')};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#9ca3af' : '#1d4ed8')};
  }
`;

export const Alert = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  ${({ variant }) => {
        switch (variant) {
            case 'error':
                return `
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        `;
            case 'warning':
                return `
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        `;
            case 'success':
                return `
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        `;
            default:
                return `
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        `;
        }
    }}
`;

export const PartInfo = styled.div`
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 4px;
  font-size: 13px;
  color: #475569;
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-size: 1.2rem;
  color: #2563eb;
`;
