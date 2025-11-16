import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MentorDashboard() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/teams');
        if (mounted && res?.data) setTeams(res.data.slice(0,5));
      } catch (err) {
        // ignore when backend not available
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container section">
      <div className="stack">
        <h2 className="h2">Mentor Dashboard</h2>
        <p className="subtitle">Team info and Q&amp;A. Provide feedback to teams.</p>
        <div className="card panel">
          <h3 style={{ marginTop: 0 }}>Assigned teams</h3>
          {teams.length === 0 ? <p className="muted">No teams assigned (or backend unavailable).</p> : (
            <ul>{teams.map(t => <li key={t._id || t.id}>{t.name}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}
