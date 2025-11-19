import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (user) {
      const userRole = role?.toLowerCase() || user.role?.toLowerCase();
      console.log('🏠 [HomePage] User detected, redirecting. Role:', userRole);
      
      const dashboardPaths = {
        student: "/student-dashboard",
        mentor: "/mentor-dashboard",
        judge: "/judge-dashboard",
        coordinator: "/coordinator-dashboard",
        admin: "/coordinator-dashboard",
      };
      
      const path = dashboardPaths[userRole] || "/student-dashboard";
      console.log('🏠 [HomePage] Redirecting to:', path);
      navigate(path, { replace: true });
    }
  }, [user, role, navigate]);

  // Handle CTA - only for logged-out users
  const handleJoin = () => {
    try { 
      localStorage.setItem('homeIsLogin', 'true'); 
    } catch (_) {}
    navigate('/login');
  };

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
