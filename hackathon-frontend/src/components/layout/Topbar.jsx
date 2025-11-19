import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, loading, logout } = useAuth() || {};

  // While auth is loading, show a simple skeleton
  if (loading) {
    return (
      <header className="topbar">
        <div className="topbar-user">Loading...</div>
      </header>
    );
  }

  // If no user exists (logged out), still show a safe topbar
  if (!user) {
    return (
      <header className="topbar">
        <div className="topbar-user">Not logged in</div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="topbar-user">
        <span>{user?.name || user?.email || "User"}</span>

        {typeof logout === "function" && (
          <button onClick={logout} className="topbar-logout">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
