import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Redirect logged-in users to their dashboard immediately
  useEffect(() => {
    // Check both AuthContext and localStorage for user/role
    const checkAndRedirect = () => {
      let currentUser = user;
      let currentRole = role;

      // Fallback to localStorage if context hasn't updated yet
      if (!currentUser || !currentRole) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            currentUser = currentUser || parsed;
            currentRole = currentRole || parsed.role;
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }

      // Redirect if we have a user and role
      if (currentUser && currentRole) {
        switch (currentRole) {
          case 'student':
            navigate('/student-dashboard', { replace: true });
            break;
          case 'mentor':
            navigate('/mentor-dashboard', { replace: true });
            break;
          case 'judge':
            navigate('/judge-dashboard', { replace: true });
            break;
          case 'coordinator':
          case 'admin':
            navigate('/coordinator-dashboard', { replace: true });
            break;
          default:
            break;
        }
      }
    };

    checkAndRedirect();
  }, [user, role, navigate]);

  // Handle CTA
  const handleJoin = () => {
    if (!user) {
      // Remember that an anonymous user chose to 'Join' so the app treats
      // the login page as their home going forward (persist across tabs)
      try { localStorage.setItem('homeIsLogin', 'true'); } catch (_) {}
      return navigate('/login');
    }
    // If user is logged in, redirect to their dashboard
    if (role === 'student') return navigate('/student-dashboard');
    if (role === 'mentor') return navigate('/mentor-dashboard');
    if (role === 'judge') return navigate('/judge-dashboard');
    if (role === 'admin' || role === 'coordinator') return navigate('/coordinator-dashboard');
    return navigate('/');
  };

  // Don't render landing page content if user is logged in
  // Check both context and localStorage
  const isLoggedIn = user || (() => {
    try {
      return !!localStorage.getItem('user');
    } catch (e) {
      return false;
    }
  })();

  if (isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="home-landing">
      <main className="landing-content">
        <h1 className="hero-title">GUS Hackathon Portal</h1>
        <h2 className="hero-subtitle">The home for hackathons.</h2>
        <p className="hero-desc">Where students collaborate on projects, showcase their skills, and win amazing prizes!</p>
        <button className="btn btn-primary hero-cta" onClick={handleJoin}>Join the Hackathon</button>
      </main>
    </div>
  );
}
