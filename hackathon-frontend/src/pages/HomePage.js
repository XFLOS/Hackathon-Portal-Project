import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

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
