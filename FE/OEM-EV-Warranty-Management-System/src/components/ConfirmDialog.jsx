import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Dialog = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: ${props => {
    switch (props.$type) {
      case 'warning': return '#fef3c7';
      case 'danger': return '#fee2e2';
      case 'success': return '#d1fae5';
      case 'info': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const Message = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  white-space: pre-line;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
  }
`;

const ConfirmButton = styled(Button)`
  background: ${props => {
    switch (props.$type) {
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#3b82f6';
    }
  }};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const getIcon = (type) => {
  switch (type) {
    case 'warning': return <FaExclamationTriangle />;
    case 'danger': return <FaTimesCircle />;
    case 'success': return <FaCheckCircle />;
    case 'info': return <FaInfoCircle />;
    default: return <FaInfoCircle />;
  }
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning' // 'warning', 'danger', 'success', 'info'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Header>
          <IconWrapper $type={type}>
            {getIcon(type)}
          </IconWrapper>
          <Title>{title}</Title>
        </Header>
        <Message>{message}</Message>
        <ButtonGroup>
          <CancelButton onClick={onClose}>{cancelText}</CancelButton>
          <ConfirmButton $type={type} onClick={handleConfirm}>
            {confirmText}
          </ConfirmButton>
        </ButtonGroup>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmDialog;

