import React, { useState } from 'react';
import { auth, firebaseEnabled } from '../firebase/config';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

export default function VerifyEmail() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const resend = async () => {
    setError('');
    try {
      if (!firebaseEnabled) {
        setError('Email verification is only available when Firebase is configured.');
        return;
      }
      const user = auth.currentUser;
      if (!user) {
        setError('No authenticated user found. Please log in first.');
        return;
      }
      await sendEmailVerification(user);
      setSent(true);
      // start cooldown (disable button for 30s)
      setCooldown(30);
      const t = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('sendEmailVerification error', err);
      setError(err.message || 'Failed to send verification');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    navigate('/login');
  };

  const checkVerification = async () => {
    setMessage('');
    setError('');
    if (!firebaseEnabled) {
      setError('Email verification is only available when Firebase is configured.');
      return;
    }
    const user = auth.currentUser;
    if (!user) { setError('No authenticated user found. Please log in first.'); return; }
    try {
      setChecking(true);
      await user.reload();
      if (user.emailVerified) {
        setMessage('Email verified — redirecting...');
        // give UI a moment
        setTimeout(() => navigate('/team-selection'), 800);
      } else {
        setMessage('Email not yet verified. Please click the link in your inbox.');
      }
    } catch (err) {
      setError(err.message || 'Failed to check verification status');
    } finally { setChecking(false); }
  };

  return (
    <div className="register-container">
      <h2>Verify your email</h2>
      <p>We've sent a verification email. Please check your inbox and click the verification link to continue.</p>
      {sent ? <p className="message">Verification email sent — check your inbox.</p> : null}
      {error ? <p className="message">{error}</p> : null}
      {message ? <p className="message">{message}</p> : null}
      <div style={{ marginTop: 12 }}>
        <button onClick={resend} disabled={cooldown > 0}>{cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend verification email'}</button>
        <button onClick={checkVerification} style={{ marginLeft: 8 }} disabled={checking}>{checking ? 'Checking…' : 'I clicked the verification link'}</button>
        <button onClick={logout} style={{ marginLeft: 8 }}>Log out</button>
      </div>
    </div>
  );
}
