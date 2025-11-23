import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import logo from "../images/1.png";
import "./Navbar.css";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Safe useAuth call with fallback
  const ctx = useAuth ? useAuth() : {};
  const { user, role, logout } = ctx || {};

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout();
      } else {
        // Fallback logout if logout function not available
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      setDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      const menu = document.querySelector('.dropdown-menu');
      const trigger = document.querySelector('.hamburger-btn');
      if (!menu) return;
      if (menu.contains(e.target) || (trigger && trigger.contains(e.target))) return;
      setDropdownOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand" aria-label="Go to home">
          <img src={logo} alt="Hackathon Logo" className="nav-logo" />
        </Link>
      </div>

      <div className="nav-right">
        <button
          className="hamburger-btn"
          aria-label="Open menu"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {dropdownOpen && (
          <div
            className="dropdown-menu"
            role="menu"
            onClick={(e) => {
              if (e.target.closest('a,button')) setDropdownOpen(false);
            }}
          >
            {user ? (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/notifications" className="notification-link">
                  Notifications
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </Link>
                <div className="dropdown-divider" />
                
                {role === 'student' && (
                  <>
                    <Link to="/team">Team</Link>
                    <Link to="/team-selection">Create/Join Team</Link>
                    <Link to="/submission">Submission</Link>
                    <Link to="/certificate">Certificate</Link>
                  </>
                )}
                
                {role === 'mentor' && (
                  <>
                    <Link to="/mentor-dashboard">Mentor Dashboard</Link>
                    <Link to="/mentor/teams">Teams & Q&A</Link>
                    <Link to="/mentor/feedback">Feedback</Link>
                  </>
                )}
                
                {role === 'judge' && (
                  <>
                    <Link to="/judge-dashboard">Judge Dashboard</Link>
                    <Link to="/judge/evaluation">Evaluation</Link>
                    <Link to="/judge/feedback">Feedback History</Link>
                  </>
                )}
                
                {(role === 'admin' || role === 'coordinator') && (
                  <>
                    <Link to="/coordinator-dashboard">Coordinator</Link>
                    <Link to="/admin/manage">Manage</Link>
                    <Link to="/admin/reports">Reports</Link>
                    <Link to="/admin/schedule">Schedule</Link>
                  </>
                )}
                
                <div className="dropdown-divider" />
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/surveys">Surveys</Link>
                <Link to="/help">Help</Link>
                <div className="dropdown-divider" />
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Log In</Link>
                <Link to="/register">Register</Link>
                <Link to="/help">Help</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
