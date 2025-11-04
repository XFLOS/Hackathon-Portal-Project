import React, { useState, useEffect } from "react";
import { signupWithFirebase, loginWithFirebase } from '../services/auth';
import { firebaseEnabled } from '../firebase/config';
import { Link, useNavigate } from "react-router-dom";
import api from '../services/api';
import './RegisterPage.css';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState('student');
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [demoInfo, setDemoInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/auth/demo-info');
        if (!mounted) return;
        setDemoInfo(res.data);
      } catch (err) {
        if (mounted) setDemoInfo({ enabled: false });
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      if (firebaseEnabled) {
        // create firebase user (centralized)
        const created = await signupWithFirebase(name, email, password);

        // api will attach the Firebase ID token automatically
        try {
          await api.post('/users', { name, email, role: selectedRole });
        } catch (err) {
          // Backend might not be running yet; proceed with Firebase-only flow
          console.warn('Backend /users upsert failed (continuing with Firebase only):', err.message || err);
        }

        // store minimal user in localStorage for frontend-only flows
        const minimalUser = { id: created.id, email: created.email, name: created.name, role: selectedRole };
        localStorage.setItem('user', JSON.stringify(minimalUser));

        // Try to fetch user profile from backend (optional)
        try {
          const profileRes = await api.get('/users/me');
          const profile = profileRes.data;
          if (profile && profile.teamId) navigate('/team');
          else navigate('/team-selection');
        } catch (err) {
          // Backend unavailable — go to team selection for now
          console.warn('Profile fetch failed after Firebase signup:', err?.message || err);
          navigate('/team-selection');
        }
      } else {
        // Backend auth register + login flow (no Firebase)
        await api.post('/auth/register', { name, email, password });
        // Auto-login after register
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.teamId) navigate('/team');
        else navigate('/team-selection');
      }
    } catch (err) {
      console.error('Register error:', err);
      setMessage(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        /><br />

        <label htmlFor="role">I am a</label>
        <select id="role" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          <option value="student">Student / Team Member</option>
          <option value="mentor">Mentor</option>
          <option value="judge">Judge</option>
        </select>
        <br />

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        /><br />

        <button type="submit" disabled={isLoading}>{isLoading ? 'Signing Up...' : 'Sign Up'}</button>
      </form>

      <p className="message">{message}</p>

      <p className="already-account">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      {demoInfo && demoInfo.enabled && (
        <div style={{ marginTop: '1rem' }}>
          <div className="muted">Or use the demo account: <strong>{demoInfo.email}</strong></div>
          <button type="button" onClick={async () => {
            try {
              const r = await api.post('/auth/demo-login');
              const { token, user } = r.data;
              if (token) localStorage.setItem('token', token);
              if (user) localStorage.setItem('user', JSON.stringify(user));
              navigate('/team-selection');
            } catch (e) {
              console.error('Demo login failed', e);
              setMessage('Demo login failed');
            }
          }} className="demo-btn">Use Demo Account</button>
        </div>
      )}
      {/* Google sign-up removed */}
    </div>
  );
}