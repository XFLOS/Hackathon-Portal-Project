import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/coordinator/stats');
        if (mounted && res?.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to load coordinator stats:', err);
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
          <h2 className="h2">Coordinator Dashboard</h2>
          <p className="subtitle">Manage teams/mentors. Reports &amp; Analytics.</p>
          
          {loading && <LoadingSpinner />}
          
          <Card title="Quick Stats" subtitle="Hackathon overview and metrics">
            {loading ? <p>Loading...</p> : (
              stats ? (
                <ul>
                  <li>Total Teams: {stats.totalTeams || 0}</li>
                  <li>Total Submissions: {stats.totalSubmissions || 0}</li>
                  <li>Total Users: {stats.totalUsers || 0}</li>
                  <li>Evaluated Submissions: {stats.evaluatedSubmissions || 0}</li>
                </ul>
              ) : <p className="muted">No stats available.</p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
