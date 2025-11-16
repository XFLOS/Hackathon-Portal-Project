import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorManagePage() {
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/teams').catch(() => ({ data: [] })), api.get('/users?role=mentor').catch(() => ({ data: [] }))])
      .then(([t, m]) => { if (mounted) { setTeams(t.data || []); setMentors(m.data || []); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const assign = async (teamId, mentorId) => {
    try {
      await api.post(`/admin/teams/${teamId}/assign`, { mentorId });
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, mentorId } : t));
      alert('Assigned');
    } catch (err) {
      alert('Assign failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Coordinator — Manage Teams & Mentors</h2>
      {teams.length === 0 ? <p>No teams found.</p> : (
        teams.map(t => (
          <div key={t.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
            <div><strong>{t.name}</strong></div>
            <div>Mentor: {t.mentorName || 'Unassigned'}</div>
            <div>
              <select defaultValue="" onChange={(e) => assign(t.id, e.target.value)}>
                <option value="">Assign mentor…</option>
                {mentors.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name || m.email}</option>)}
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

