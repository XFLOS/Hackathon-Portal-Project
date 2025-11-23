import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function StudentSidebar() {
  const navItems = [
    { path: '/student-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/team-selection', label: 'Team Selection', icon: '🔍' },
    { path: '/submission', label: 'Submissions', icon: '📤' },
    { path: '/student/chat', label: 'Chat', icon: '💬' },
    // Schedule removed until implemented
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Student Portal</h3>
      </div>

      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                isActive ? 'nav-item active' : 'nav-item'
              }
              end
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
