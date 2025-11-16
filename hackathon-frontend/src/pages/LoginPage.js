import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseEnabled } from '../firebase/config';
import { loginWithFirebase } from '../services/auth';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState(""); // email input
  const [password, setPassword] = useState(""); // password input
  const [message, setMessage] = useState(""); // error / info message
  const navigate = useNavigate();
  const [demoInfo, setDemoInfo] = useState(null);

  // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      if (firebaseEnabled) {
        // Firebase login using helper
        const fbUser = await loginWithFirebase(email, password);
        try {
          localStorage.setItem('user', JSON.stringify({ id: fbUser.id, email: fbUser.email, name: fbUser.name }));
        } catch (err) {
          console.warn('Failed to persist user to localStorage:', err.message || err);
        }
        navigate('/team-selection');
      } else {
        // Backend JWT login
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        // store token and user for api wrapper and UI
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/team-selection');
      }

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || 'Login failed'); // show error
    }
  };

  // Demo sign-in that uses backend demo-login endpoint to bypass Firebase
  const handleDemoSignIn = async () => {
    setMessage('');
    try {
      const res = await api.post('/auth/demo-login');
      const { token, user } = res.data;
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      navigate('/team-selection');
    } catch (err) {
      console.error('Demo login failed', err);
      setMessage(err.response?.data?.error || err.message || 'Demo login failed');
    }
  };

  // Google sign-in removed (disabled in this build)

  // Load demo availability
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/auth/demo-info');
        if (!mounted) return;
        setDemoInfo(res.data);
      } catch (err) {
        // ignore — absence of endpoint simply means demo not available
        if (mounted) setDemoInfo({ enabled: false });
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="login-container">
      <h2>log in</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <button type="submit">Log in</button>
      </form>

      <p><Link to="/reset-password" className="forgot-password-link">Forgot your password?</Link></p>

      <p className="message">{message}</p>

      <div style={{ marginTop: '1rem' }}>
        {demoInfo && demoInfo.enabled ? (
          <>
            <div style={{ marginBottom: '0.5rem' }} className="muted">Demo account: <strong>{demoInfo.email}</strong></div>
            <button type="button" onClick={handleDemoSignIn} className="demo-btn">Sign in as Demo</button>
          </>
        ) : (
          <button type="button" onClick={handleDemoSignIn} className="demo-btn">Demo sign in</button>
        )}
      </div>

      {/* Google sign-in removed */}

      <p className="already-account">Don't have an account? <Link to="/register">Create an account</Link></p>
    </div>
  );
}