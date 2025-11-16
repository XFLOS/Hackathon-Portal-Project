import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerWithEmail, useAuth } from '../context/AuthContext';
import { firebaseEnabled, auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import './AuthForm.css';

function BaseRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const navigate = useNavigate();
  const { user, role: currentRole, loading: authLoading } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to role-based dashboard
    if (!authLoading && (user || currentRole)) {
      const r = (currentRole || (user && user.role) || 'student');
      if (r === 'student') navigate('/student');
      else if (r === 'mentor') navigate('/mentor');
      else if (r === 'judge') navigate('/judge');
      else if (r === 'admin') navigate('/admin');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, currentRole]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Basic client-side validation: college-ish email and password strength
        const emailLower = (email || '').toLowerCase();
        // Allow common academic domains and explicitly allow nctorontostudents.ca
        const allowedExtraDomain = 'nctorontostudents.ca';
        const isCollege = /\.edu$|\.ac\.|college|university/i.test(emailLower) || emailLower.endsWith(`@${allowedExtraDomain}`);
    if (!isCollege) {
      setError('Please use your college/university email address');
      setLoading(false);
      return;
    }
    if (!password || password.length < 8 || !/\d/.test(password)) {
      setError('Password must be at least 8 characters and include a number');
      setLoading(false);
      return;
    }
    try {
      await registerWithEmail({ name, email, password, role });
      if (firebaseEnabled && auth) {
        try { await signOut(auth); } catch (_) {}
      }
      // Remove any cached session data so the user must log in explicitly
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (_) {}
      window.alert('Account created successfully! Please log in to continue.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">Name</label>
          <input className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />

          <label className="auth-label">Role</label>
          <select className="auth-input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="judge">Judge</option>
          </select>

          <label className="auth-label">Email</label>
          <input className="auth-input" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />

          <label className="auth-label">Password</label>
          <input className="auth-input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          <div className="auth-meta">
            <span>Already have an account? <Link to="/login">Log in</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BaseRegister;
