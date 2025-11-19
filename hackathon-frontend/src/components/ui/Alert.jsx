import React from 'react';
import './Alert.css';

/**
 * Reusable Alert component
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onClose - Optional close handler
 */
export default function Alert({ type = 'info', title, message, onClose, children }) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon">{icons[type]}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close" aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
