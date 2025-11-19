import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const ctx = useAuth ? useAuth() : {};
  const { user } = ctx || {};

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          HACKATHON PORTAL
        </Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <span className="navbar-user">{user.email}</span>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
