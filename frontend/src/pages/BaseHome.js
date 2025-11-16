import React, { useEffect, useState } from 'react';
import api from '../services/api';

function BaseHome() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    let mounted = true;
    api.get('/')
      .then(res => {
        if (mounted) setMessage(res.data || 'API responded');
      })
      .catch(err => {
        if (mounted) setMessage('Could not reach API: ' + (err.message || ''));
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1>Hackathon Portal — Base Frontend</h1>
      <p>{message}</p>
      <p>This is a minimal starter UI. Use the Login and Register pages to authenticate against the backend.</p>
    </div>
  );
}

export default BaseHome;
