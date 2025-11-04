import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 48 }) {
  return (
    <div className="hp-spinner-wrapper" data-testid="loading-spinner">
      <div className="hp-spinner" style={{ width: size, height: size }} />
    </div>
  );
}
