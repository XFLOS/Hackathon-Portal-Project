import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';
import { Link } from 'react-router-dom';

// JudgeDashboard Phase 2 Enhancements: assignments, search, filter, sort
export default function JudgeDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | submitted | not-submitted
  const [sortBy, setSortBy] = useState('team'); // team | time | score

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resProfile = await api.get('/auth/profile').catch(()=>({ data: {} }));
        const judgeId = resProfile?.data?.id;
        const route = judgeId ? `/judge/assignments/${judgeId}` : '/judge/submissions';
        const res = await api.get(route);
        if (mounted && res?.data) {
          setAssignments(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load judge assignments:', err);
        if (mounted) setError('Failed to load assignments');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    let evaluated = 0;
    let total = assignments.length;
    assignments.forEach(a => { if (a.evaluation_id) evaluated++; });
    return { evaluated, total, pending: total - evaluated };
  }, [assignments]);

  const filtered = useMemo(() => {
    let rows = assignments.map(r => ({
      ...r,
      total_score: typeof r.total_score === 'number' ? r.total_score : ((r.innovation_score||0)+(r.technical_score||0)+(r.presentation_score||0))
    }));
    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(r => (r.team_name || '').toLowerCase().includes(term));
    }
    if (statusFilter !== 'all') {
      rows = rows.filter(r => {
        const submitted = !!r.submitted_at;
        return statusFilter === 'submitted' ? submitted : !submitted;
      });
    }
    switch (sortBy) {
      case 'team':
        rows.sort((a,b)=>(a.team_name||'').localeCompare(b.team_name||''));
        break;
      case 'time':
        rows.sort((a,b)=>{
          const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
          const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
          return tb - ta; // newest first
        });
        break;
      case 'score':
        rows.sort((a,b)=>{
          const sa = a.total_score ?? -1;
          const sb = b.total_score ?? -1;
          return sb - sa;
        });
        break;
      default: break;
    }
    return rows;
  }, [assignments, search, statusFilter, sortBy]);

  const renderScoreBadge = (s) => {
    if (!s.submission_id) return <span className="badge badge-secondary">No Submission</span>;
    if (!s.evaluation_id) return <span className="badge badge-warning">Pending Eval</span>;
    const scores = [s.innovation_score, s.technical_score, s.presentation_score];
    const validScores = scores.filter(v => typeof v === 'number');
    const total = validScores.reduce((a,b) => a + b, 0);
    return <span className="badge badge-success">Score: {total}</span>;
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

          <Card title="Assigned Teams" subtitle={`${stats.evaluated} evaluated · ${stats.pending} pending · ${stats.total} total`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Search team..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={filterInputStyle}
                aria-label="Search team by name"
              />
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={filterSelectStyle} aria-label="Filter by submission status">
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Not Submitted</option>
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={filterSelectStyle} aria-label="Sort list">
                <option value="team">Sort: Team</option>
                <option value="time">Sort: Time</option>
                <option value="score">Sort: Score</option>
              </select>
            </div>
            {loading ? <p>Loading...</p> : (
              filtered.length === 0 ? <p className="muted">No teams match current filters.</p> : (
                <ul className="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filtered.map(row => (
                    <li key={row.team_id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <strong>{row.team_name || `Team #${row.team_id}`}</strong>
                          <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                            {row.submission_id ? `Submitted ${new Date(row.submitted_at).toLocaleDateString()}` : 'Not Submitted'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {renderScoreBadge(row)}
                          <Link to="/judge/evaluation"><Button size="sm" variant={row.evaluation_id ? 'outline' : 'primary'}>{row.evaluation_id ? 'Update' : (row.submission_id ? 'Evaluate' : 'Awaiting')}</Button></Link>
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

const filterInputStyle = {
  flex: '1 1 180px',
  minWidth: 160,
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6
};

const filterSelectStyle = {
  flex: '0 0 150px',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--surface)'
};
