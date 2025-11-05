// Global confirm dialog override
// This replaces the default window.confirm with a beautiful custom dialog

let globalConfirmResolver = null;
let confirmResult = false;
let isWaiting = false;

// Create and inject the confirm dialog element
const createConfirmDialog = () => {
  const overlay = document.createElement('div');
  overlay.id = 'global-confirm-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.2s ease-in-out;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div id="global-confirm-dialog" style="
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: #fef3c7;
          color: #f59e0b;
        ">⚠️</div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">Xác nhận</h3>
      </div>
      <p id="global-confirm-message" style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6; white-space: pre-line;"></p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="global-confirm-cancel" style="
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: #f3f4f6;
          color: #6b7280;
          transition: all 0.2s;
        ">Hủy</button>
        <button id="global-confirm-ok" style="
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: #f59e0b;
          color: white;
          transition: all 0.2s;
        ">Xác nhận</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners
  const cancelBtn = document.getElementById('global-confirm-cancel');
  const okBtn = document.getElementById('global-confirm-ok');

  const handleCancel = () => {
    hideConfirmDialog();
    confirmResult = false;
    isWaiting = false;
    if (globalConfirmResolver) {
      globalConfirmResolver(false);
      globalConfirmResolver = null;
    }
  };

  const handleOk = () => {
    hideConfirmDialog();
    confirmResult = true;
    isWaiting = false;
    if (globalConfirmResolver) {
      globalConfirmResolver(true);
      globalConfirmResolver = null;
    }
  };

  cancelBtn.addEventListener('click', handleCancel);
  okBtn.addEventListener('click', handleOk);

  // Click overlay to cancel
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  });

  // Prevent clicks on dialog from closing
  const dialog = document.getElementById('global-confirm-dialog');
  dialog.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // ESC key to cancel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isWaiting) {
      handleCancel();
    }
  });
};

const showConfirmDialog = (message) => {
  const overlay = document.getElementById('global-confirm-overlay');
  const messageEl = document.getElementById('global-confirm-message');

  if (overlay && messageEl) {
    messageEl.textContent = message;
    overlay.style.display = 'flex';
    isWaiting = true;
    confirmResult = false;
  }
};

const hideConfirmDialog = () => {
  const overlay = document.getElementById('global-confirm-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

// Override window.confirm to return a Promise for async/await
const originalConfirm = window.confirm;

window.confirm = function(message) {
  // Check if we're in a browser environment and dialog is ready
  if (typeof document !== 'undefined') {
    // Create dialog if it doesn't exist
    if (!document.getElementById('global-confirm-overlay')) {
      createConfirmDialog();
    }

    // Return a Promise that resolves when user clicks a button
    return new Promise((resolve) => {
      globalConfirmResolver = resolve;
      showConfirmDialog(message || 'Bạn có chắc chắn muốn thực hiện hành động này?');
    });
  }

  // Fallback to original confirm if not in browser
  return originalConfirm.call(window, message);
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createConfirmDialog);
} else {
  createConfirmDialog();
}

export default window.confirm;

