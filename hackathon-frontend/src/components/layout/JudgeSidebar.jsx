import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function JudgeSidebar() {
  const navItems = [
    { path: '/judge-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/judge-submissions', label: 'Submissions', icon: '📤' },
    { path: '/judge-grading', label: 'Grading', icon: '✅' },
    { path: '/judge-rubric', label: 'Rubric Editor', icon: '📝' },
    { path: '/judge-history', label: 'Team History', icon: '📜' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
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
