import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseEnabled } from '../firebase/config';
import { loginWithFirebase } from '../services/auth';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
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
        
        // Notify auth context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        
        // Redirect to appropriate dashboard based on role
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = storedUser.role || 'student';
        const dashboardRoutes = {
          student: '/student-dashboard',
          mentor: '/mentor-dashboard',
          judge: '/judge-dashboard',
          coordinator: '/coordinator-dashboard',
          admin: '/coordinator-dashboard'
        };
        navigate(dashboardRoutes[userRole] || '/student-dashboard');
      } else {
        // Backend JWT login
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        // store token and user for api wrapper and UI
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Notify other components (like Navbar) that auth state changed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        
        // Redirect directly to role-based dashboard
        const dashboardRoutes = {
          student: '/student-dashboard',
          mentor: '/mentor-dashboard',
          judge: '/judge-dashboard',
          coordinator: '/coordinator-dashboard',
          admin: '/coordinator-dashboard'
        };
        navigate(dashboardRoutes[user.role] || '/student-dashboard');
      }

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed'); // show error
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
      
      // Notify other components that auth state changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Redirect directly to role-based dashboard
      const dashboardRoutes = {
        student: '/student-dashboard',
        mentor: '/mentor-dashboard',
        judge: '/judge-dashboard',
        coordinator: '/coordinator-dashboard',
        admin: '/coordinator-dashboard'
      };
      navigate(dashboardRoutes[user.role] || '/student-dashboard');
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
    <div className="login-wrapper">
      <div className="login-grid">
        {/* Left: Brand Section */}
        <div className="login-brand">
          <h1>Hackathon Portal</h1>
          <p className="login-brand-tagline">Collaborate. Innovate. Compete.</p>
          <div className="login-brand-features">
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span>Build Amazing Projects</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Team Collaboration</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Win Prizes</span>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="login-form-side">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue to your dashboard</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-footer">
                <Link to="/reset-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" full>
                Sign In
              </Button>
            </form>

            {message && <p className="login-message error">{message}</p>}

            {demoInfo && demoInfo.enabled && (
              <div className="demo-section">
                <div className="divider">
                  <span>or</span>
                </div>
                <div className="demo-info">
                  <p className="muted">Demo account: <strong>{demoInfo.email}</strong></p>
                </div>
                <Button variant="outline" full onClick={handleDemoSignIn}>
                  Sign in as Demo
                </Button>
              </div>
            )}

            <p className="create-account">
              Don't have an account? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}