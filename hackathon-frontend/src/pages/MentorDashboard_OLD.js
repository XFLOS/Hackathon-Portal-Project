import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';

export default function MentorDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/mentor/teams');
        if (mounted && res?.data) {
          setTeams(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load mentor teams:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <AppShell>
      <div className="container section">
        <div className="stack">
          <h2 className="h2">Mentor Dashboard</h2>
          <p className="subtitle">Team info and Q&amp;A. Provide feedback to teams.</p>
          
          {loading && <LoadingSpinner />}
          
          <Card title="Assigned Teams" subtitle={`${teams.length} teams under your guidance`}>
            {loading ? <p>Loading...</p> : (
              teams.length === 0 ? <p className="muted">No teams assigned yet.</p> : (
                <ul>
                  {teams.map(t => (
                    <li key={t.id}>
                      <strong>{t.name}</strong>
                      <p className="muted">{t.members?.length || 0} members</p>
                    </li>
                  ))}
                </ul>
              )
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
