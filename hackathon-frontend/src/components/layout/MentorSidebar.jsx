import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function MentorSidebar() {
  const navItems = [
    { path: '/mentor-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/mentor/teams', label: 'Teams & Q&A', icon: '👥' },
    { path: '/mentor/feedback', label: 'Feedback', icon: '📝' },
    { path: '/mentor/chat', label: 'Chat', icon: '💬' },
    { path: '/mentor/resources', label: 'Resources', icon: '📚' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Mentor Portal</h3>
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
