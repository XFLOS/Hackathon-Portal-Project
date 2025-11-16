import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Handle CTA
  const handleJoin = () => {
    if (!user) {
      // Remember that an anonymous user chose to 'Join' so the app treats
      // the login page as their home going forward (persist across tabs)
      try { localStorage.setItem('homeIsLogin', 'true'); } catch (_) {}
      return navigate('/login');
    }
    if (role === 'student') return navigate('/student');
    if (role === 'mentor') return navigate('/mentor');
    if (role === 'judge') return navigate('/judge');
    if (role === 'admin') return navigate('/admin');
    return navigate('/');
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
