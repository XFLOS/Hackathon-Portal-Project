import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/admin/stats');
        if (mounted && res?.data) setStats(res.data);
      } catch (err) {
        // ignore for local dev
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container section">
      <div className="stack">
        <h2 className="h2">Coordinator Dashboard</h2>
        <p className="subtitle">Manage teams/mentors. Reports &amp; Analytics.</p>
        <div className="card panel">
          <h3 style={{ marginTop: 0 }}>Quick stats</h3>
          {stats ? (
            <ul>
              <li>Teams: {stats.teams}</li>
              <li>Projects: {stats.projects}</li>
              <li>Users: {stats.users}</li>
            </ul>
          ) : <p className="muted">No stats available (or backend unavailable).</p>}
        </div>
      </div>
    </div>
  );
}
