// src/components/layout/AppShell.jsx
import React from "react";
import "./appShell.css";

const AppShell = ({ sidebar, header, children }) => {
  return (
    <div className="app-shell">
      {sidebar && <aside className="app-shell__sidebar">{sidebar}</aside>}
      <main className="app-main">
        {header && <div className="app-shell__header">{header}</div>}
        <div className="app-shell__content">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
