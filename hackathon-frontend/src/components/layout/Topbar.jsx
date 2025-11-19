import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-user">
        {user ? (
          <>
            <span>{user.name || user.email}</span>
            <button onClick={logout} className="topbar-logout">
              Logout
            </button>
          </>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    </header>
  );
}
