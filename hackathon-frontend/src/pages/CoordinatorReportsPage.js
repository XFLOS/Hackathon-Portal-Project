import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/coordinator/stats')
      .then(res => { if (mounted) setStats(res.data || null); })
      .catch(() => { if (mounted) setStats(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading reports…</p>;

  return (
    <div>
      <h2>Coordinator — Reports & Analytics</h2>
      {stats ? (
        <div>
          <div>Teams: {stats.teams}</div>
          <div>Projects: {stats.projects}</div>
          <div>Active users: {stats.users}</div>
        </div>
      ) : (
        <p>No reports available (backend may be offline).</p>
      )}
    </div>
  );
}

