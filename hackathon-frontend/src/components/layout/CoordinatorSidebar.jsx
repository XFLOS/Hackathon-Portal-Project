import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function CoordinatorSidebar() {
  const navItems = [
    { path: '/coordinator-schedule', label: 'Schedule Editor', icon: '📅' },
    { path: '/post-hackathon', label: 'Reports', icon: '📈' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/teams', label: 'All Teams', icon: '👥' },
    { path: '/participants', label: 'Participants', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Coordinator Portal</h3>
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
