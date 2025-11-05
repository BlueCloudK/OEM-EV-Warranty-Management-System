import { useState, useCallback } from 'react';

/**
 * Custom hook to replace window.confirm with a beautiful dialog
 * Usage:
 * const { confirmDialog, showConfirm } = useConfirm();
 *
 * // In your component JSX:
 * {confirmDialog}
 *
 * // To show confirmation:
 * const confirmed = await showConfirm({
 *   title: 'Xác nhận xóa',
 *   message: 'Bạn có chắc chắn muốn xóa mục này?',
 *   type: 'danger'
 * });
 * if (confirmed) { ... }
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning',
    resolver: null
  });

  const showConfirm = useCallback(({
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning'
  } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolver: resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState(prev => {
      if (prev.resolver) {
        prev.resolver(true);
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState(prev => {
      if (prev.resolver) {
        prev.resolver(false);
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  // Render confirm dialog directly
  const confirmDialog = !confirmState.isOpen ? null : (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-in-out'
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              background: confirmState.type === 'danger' ? '#fee2e2' : confirmState.type === 'success' ? '#d1fae5' : '#fef3c7',
              color: confirmState.type === 'danger' ? '#ef4444' : confirmState.type === 'success' ? '#10b981' : '#f59e0b'
            }}
          >
            {confirmState.type === 'danger' ? '⚠️' : confirmState.type === 'success' ? '✓' : '⚠️'}
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
            {confirmState.title}
          </h3>
        </div>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {confirmState.message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {confirmState.cancelText && (
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: '#f3f4f6',
                color: '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {confirmState.cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: confirmState.type === 'danger' ? '#ef4444' : confirmState.type === 'success' ? '#10b981' : '#f59e0b',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            {confirmState.confirmText}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );

  return {
    showConfirm,
    confirmDialog
  };
};

