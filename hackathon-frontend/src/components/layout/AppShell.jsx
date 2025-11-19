// src/components/layout/AppShell.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./appShell.css";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
