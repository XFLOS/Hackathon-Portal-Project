import React from 'react';
import { firebaseEnabled } from '../firebase/config';

export default function DevAuthIndicator() {
  if (process.env.NODE_ENV !== 'development') return null;

  const mode = firebaseEnabled ? 'Firebase' : 'Backend API';
  const api = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const styles = {
    position: 'fixed', bottom: 10, right: 10, zIndex: 2000,
    padding: '8px 12px', borderRadius: 8, fontSize: 12,
    color: '#0b0f17', background: '#aee9ff', border: '1px solid rgba(101,197,232,0.6)',
    boxShadow: '0 6px 18px rgba(101,197,232,0.25)'
  };

  return (
    <div style={styles} aria-label="Development auth mode indicator">
      <strong>Auth:</strong> {mode}
      {!firebaseEnabled && <span> · API: {api}</span>}
    </div>
  );
}

