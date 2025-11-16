import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; 

export default function Footer() {
  return (
    <footer className="portal-footer">
      <p>&copy; {new Date().getFullYear()} Niagara College - Toronto Hackathon Portal</p>
      <div className="footer-links">
        <Link to="/about">About Hackathon</Link>
        <span>|</span>
        <Link to="/contact">Contact Support</Link>
      </div>
    </footer>
  );
}