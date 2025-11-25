import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function JudgeSidebar() {
  // Updated to only include implemented routes; legacy paths now aliased in AppRoutes
  const navItems = [
    { path: '/judge-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/judge/evaluation', label: 'Evaluation', icon: '✅' },
    { path: '/judge/feedback', label: 'Feedback History', icon: '📜' },
    { path: '/judge/schedule', label: 'Schedule', icon: '📅' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Judge Portal</h3>
      </div>
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
