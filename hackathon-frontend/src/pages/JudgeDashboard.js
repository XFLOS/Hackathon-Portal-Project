import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';
import { Link } from 'react-router-dom';

// JudgeDashboard shows high-level evaluation status and links to evaluation & history pages.
export default function JudgeDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        if (mounted) setError('Failed to load submissions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    let evaluated = 0;
    let total = submissions.length;
    submissions.forEach(s => { if (s.evaluation_id) evaluated++; });
    return { evaluated, total, pending: total - evaluated };
  }, [submissions]);

  const renderScoreBadge = (s) => {
    if (!s.evaluation_id) return <span className="badge badge-warning">Pending</span>;
    const scores = [s.innovation_score, s.technical_score, s.presentation_score];
    const validScores = scores.filter(v => typeof v === 'number');
    const total = validScores.reduce((a,b) => a + b, 0);
    return <span className="badge badge-success">Total: {total}</span>;
  };

  return (
    <AppShell>
      <div className="container section">
        <div className="stack">
          <h2 className="h2">Judge Dashboard</h2>
          <p className="subtitle">Evaluate submissions and review feedback history.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/judge/evaluation"><Button variant="primary">Go to Evaluation Page</Button></Link>
            <Link to="/judge/feedback"><Button variant="secondary">View Feedback History</Button></Link>
          </div>

          {loading && <LoadingSpinner />}
          {error && !loading && <p className="error" style={{ color: 'var(--danger)' }}>{error}</p>}

          <Card title="Submission Overview" subtitle={`${stats.evaluated} evaluated · ${stats.pending} pending · ${stats.total} total`}>
            {loading ? <p>Loading...</p> : (
              submissions.length === 0 ? <p className="muted">No submissions assigned yet.</p> : (
                <ul className="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {submissions.map(s => (
                    <li key={s.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <strong>{s.team_name || `Team #${s.team_id}`}</strong>
                          <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
                            Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {renderScoreBadge(s)}
                          <Link to="/judge/evaluation"><Button size="sm" variant={s.evaluation_id ? 'outline' : 'primary'}>{s.evaluation_id ? 'Update' : 'Evaluate'}</Button></Link>
                        </div>
                      </div>
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
