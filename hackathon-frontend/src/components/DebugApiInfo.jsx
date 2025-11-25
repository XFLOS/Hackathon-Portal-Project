import React from 'react';
import api from '../services/api';

export default function DebugApiInfo() {
  const base = api?.defaults?.baseURL || 'N/A';
  let tokenPresent = false;
  try {
    tokenPresent = !!localStorage.getItem('token');
  } catch (_) {}
  return (
    <div style={{marginTop:'8px', padding:'8px', fontSize:'12px', border:'1px dashed #0099cc', borderRadius:'6px', background:'rgba(0,153,204,0.1)'}}>
      <strong>Debug API:</strong><br />
      baseURL: <code>{base}</code><br />
      auth token stored: <code>{tokenPresent ? 'yes' : 'no'}</code><br />
      window.location.origin: <code>{window.location.origin}</code><br />
    </div>
  );
}
