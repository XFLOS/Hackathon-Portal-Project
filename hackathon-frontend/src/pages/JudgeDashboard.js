import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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
        const hasSubmission = !!r.submission_id || !!r.evaluation_id || !!r.submitted_at;
        return statusFilter === 'submitted' ? hasSubmission : !hasSubmission;
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
    if (!s.submission_id) return <span className="judge-badge judge-badge-soft">No Submission</span>;
    if (!s.evaluation_id) return <span className="judge-badge judge-badge-warning">Pending Eval</span>;
    const scores = [s.innovation_score, s.technical_score, s.presentation_score];
    const validScores = scores.filter(v => typeof v === 'number');
    const total = validScores.reduce((a,b) => a + b, 0);
    return <span className="judge-badge judge-badge-success">Score: {total}</span>;
  };

  return (
    <AppShell>
      <div className="judge-page">
        <header className="judge-page-header">
          <h1 className="judge-title">Judge Dashboard</h1>
          <p className="judge-subtitle">Evaluate submissions, monitor progress, and review feedback history.</p>
        </header>
        <div className="judge-row-actions" style={{ flexWrap:'wrap', marginBottom:'1rem' }}>
          <Link to="/judge/evaluation" className="judge-btn judge-btn-primary">Evaluation</Link>
          <Link to="/judge/feedback" className="judge-btn judge-btn-secondary">Feedback History</Link>
          <Link to="/judge/schedule" className="judge-btn judge-btn-outline">Presentation Schedule</Link>
        </div>
        {/* Debug panel for assignment data */}
        <details style={{ marginBottom: '1rem', background: '#1e293b', color: '#fff', borderRadius: 8, padding: '0.5rem 1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Debug: Raw Assignments Data</summary>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(assignments, null, 2)}</pre>
        </details>
        {loading && <LoadingSpinner />}
        {error && !loading && <p style={{ color: 'var(--judge-danger)', fontSize:'var(--judge-font-sm)' }}>{error}</p>}
        <section className="judge-card" aria-label="Assigned Teams">
          <div className="judge-card-header">
            <div>
              <div className="judge-card-title">Assigned Teams</div>
              <div className="judge-card-meta">{stats.evaluated} evaluated • {stats.pending} pending • {stats.total} total</div>
            </div>
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center' }}>
              <input
                className="judge-input"
                type="text"
                placeholder="Search team..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                aria-label="Search team by name"
                style={{ flex:'1 1 180px', minWidth:160 }}
              />
              <select className="judge-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter by submission status" style={{ flex:'0 0 140px' }}>
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Not Submitted</option>
              </select>
              <select className="judge-select" value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort list" style={{ flex:'0 0 140px' }}>
                <option value="team">Team</option>
                <option value="time">Time</option>
                <option value="score">Score</option>
              </select>
            </div>
          </div>
          {loading ? <p style={{ color:'var(--judge-text-muted)', fontSize:'var(--judge-font-sm)' }}>Loading…</p> : (
            filtered.length === 0 ? <p style={{ color:'var(--judge-text-muted)', fontSize:'var(--judge-font-sm)' }}>No teams match current filters.</p> : (
              <ul className="judge-list" aria-label="Teams list">
                {filtered.map(row => {
                  // Treat any team with a submission (including demo/evaluated) as 'Submitted'
                  const hasSubmission = !!row.submission_id || !!row.evaluation_id || !!row.submitted_at;
                  const evaluated = !!row.evaluation_id;
                  return (
                    <li key={row.team_id} className="judge-list-item">
                      <div className="judge-row-top">
                        <div style={{ flex:1 }}>
                          <strong style={{ fontSize:'var(--judge-font-md)' }}>{row.team_name || `Team #${row.team_id}`}</strong>
                          <div style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)', marginTop:4 }}>
                            {hasSubmission ? `Submitted${row.submitted_at ? ' ' + new Date(row.submitted_at).toLocaleDateString() : ''}` : 'Not Submitted'}
                          </div>
                        </div>
                        <div className="judge-row-actions">
                          {renderScoreBadge(row)}
                          <Link
                            to="/judge/evaluation"
                            className={`judge-btn ${evaluated ? 'judge-btn-outline' : hasSubmission ? 'judge-btn-primary' : 'judge-btn-secondary'}`}
                            style={{ fontSize:'var(--judge-font-xs)' }}
                          >{evaluated ? 'Update' : hasSubmission ? 'Evaluate' : 'Awaiting'}</Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </section>
      </div>
    </AppShell>
  );
}

// Removed inline filter styles in favor of shared judge-input / judge-select classes
