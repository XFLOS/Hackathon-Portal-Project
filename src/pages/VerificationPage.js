import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './VerificationPage.css';

export default function VerificationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    setMessage('');
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password to resend the verification email.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      await signOut(auth);

      setMessage('Verification email sent! Check your inbox.');
      setCooldown(60);

      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="verification-container">

      <h2>Verify Your Email</h2>

      <p className="instruction-text">
        A verification email was sent to you. Please check your inbox (and spam folder) before resending.
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br />

      <button onClick={handleResend} disabled={cooldown > 0}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
      </button>

      {message && <p className="message">{message}</p>}
      {error && <p className="message">{error}</p>}

      <div className="already-verified-section">
        <h2>Already verified?</h2>
        <button className="login-button" onClick={() => navigate('/login')}>
          Log in
        </button>
      </div>

    </div>
  );
}