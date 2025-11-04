import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function JudgeDashboard() {
  const [assignments, setAssignments] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/assignments');
        if (mounted && res?.data) setAssignments(res.data.slice(0,5));
      } catch (err) {
        // ignore when backend not available
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container section">
      <div className="stack">
        <h2 className="h2">Judge Dashboard</h2>
        <p className="subtitle">Evaluate submissions and review feedback history.</p>
        <div className="card panel">
          <h3 style={{ marginTop: 0 }}>Your assignments</h3>
          {assignments.length === 0 ? <p className="muted">No assignments (or backend unavailable).</p> : (
            <ul>{assignments.map(a => <li key={a._id || a.id}>{a.title || a.name}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}
