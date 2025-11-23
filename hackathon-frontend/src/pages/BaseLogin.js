import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithEmail, useAuth } from '../context/AuthContext';
import { firebaseEnabled } from '../firebase/config';
import './AuthForm.css';

function BaseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role: currentRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (user || currentRole)) {
      // Redirect to role-based dashboard
      const dashboardRoutes = {
        student: '/student-dashboard',
        mentor: '/mentor-dashboard',
        judge: '/judge-dashboard',
        coordinator: '/coordinator-dashboard',
        admin: '/coordinator-dashboard'
      };
      navigate(dashboardRoutes[currentRole] || '/student-dashboard');
    }
  }, [authLoading, user, currentRole, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // Redirect to role-based dashboard after successful login
      const userRole = currentRole || 'student';
      const dashboardRoutes = {
        student: '/student-dashboard',
        mentor: '/mentor-dashboard',
        judge: '/judge-dashboard',
        coordinator: '/coordinator-dashboard',
        admin: '/coordinator-dashboard'
      };
      navigate(dashboardRoutes[userRole] || '/student-dashboard');
    } catch (err) {
      // Provide clearer guidance depending on auth mode and error shape
      const axiosNetwork = !err?.response && (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error');
      if (!firebaseEnabled && axiosNetwork) {
        const api = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        setError(`API not reachable at ${api}. Either run the backend or configure Firebase in .env and restart.`);
      } else if (err?.code && String(err.code).startsWith('auth/')) {
        // Special-case unverified email
        if (err.code === 'auth/email-not-verified') {
          setError('Please verify your email address before logging in. A verification email was sent during registration.');
          navigate('/verify-email');
        } else {
          setError(`Firebase auth error: ${err.code.replace('auth/','')}`);
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Log in</h2>
        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">Email</label>
          <input className="auth-input" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />

          <label className="auth-label">Password</label>
          <input className="auth-input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>

          <div className="auth-meta">
            <span>New here? <Link to="/register">Create account</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BaseLogin;
