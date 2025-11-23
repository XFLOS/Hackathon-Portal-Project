import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MentorTeamQA() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    api.get('/mentor/teams')
      .then(res => { if (on) setTeams(res.data || []); })
      .catch(e => { if (on) setError(e.response?.data?.message || e.message); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Mentor — Team Info & Q&A</h2>
      {teams.length === 0 ? (
        <p>No teams yet.</p>
      ) : (
        teams.map((t) => (
          <div key={t.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
            <strong>{t.name}</strong>
            <div>Leader: {t.leader}</div>
            <div>Members: {(t.members || []).join(', ') || '—'}</div>
            <div>Updates:</div>
            <ul>
              {(t.updates || []).length === 0 ? (
                <li>None yet.</li>
              ) : (
                (t.updates || []).map((u, idx) => <li key={idx}>{u}</li>)
              )}
            </ul>
            <div style={{ fontSize: 12, color: '#666' }}>Team ID: {t.id}</div>
          </div>
        ))
      )}
    </div>
  );
}
