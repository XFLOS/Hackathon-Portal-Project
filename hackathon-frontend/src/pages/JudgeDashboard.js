import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';
import JudgeSidebar from '../components/layout/JudgeSidebar';

export default function JudgeDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/judge/submissions');
        if (mounted && res?.data) {
          setSubmissions(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load judge submissions:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <AppShell sidebar={<JudgeSidebar />}>
      <div className="container section">
        <div className="stack">
          <h2 className="h2">Judge Dashboard</h2>
          <p className="subtitle">Evaluate submissions and review feedback history.</p>
          
          {loading && <LoadingSpinner />}
          
          <Card title="Submissions to Evaluate" subtitle={`${submissions.length} submissions pending review`}>
            {loading ? <p>Loading...</p> : (
              submissions.length === 0 ? <p className="muted">No submissions assigned yet.</p> : (
                <ul>
                  {submissions.map(s => (
                    <li key={s.id}>
                      <strong>{s.team_name || `Team #${s.team_id}`}</strong>
                      <p className="muted">
                        Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Unknown'}
                        {s.score && ` • Score: ${s.score}`}
                      </p>
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
      </div>
    </div>
  );
}
