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
      const tryFetch = async (fn) => {
        try { return await fn(); } catch (e) { return { error: e }; }
      };
      let data = null;
      // 1) Preferred convenience endpoint
      const r1 = await tryFetch(()=> api.get('/judge/assignments/me'));
      if (!r1.error && Array.isArray(r1.data)) data = r1.data;
      // 2) Legacy profile + id-specific route
      if (!data) {
        const prof = await tryFetch(()=> api.get('/auth/profile'));
        const judgeId = prof.error ? null : prof.data?.id;
        if (judgeId) {
          const r2 = await tryFetch(()=> api.get(`/judge/assignments/${judgeId}`));
          if (!r2.error && Array.isArray(r2.data)) data = r2.data;
        }
      }
      // 3) Fallback to submissions list (only teams with submissions)
      if (!data) {
        const r3 = await tryFetch(()=> api.get('/judge/submissions'));
        if (!r3.error && Array.isArray(r3.data)) data = r3.data;
      }
      if (mounted) {
        if (data) {
          setAssignments(data);
        } else {
          setError('Failed to load assignments');
        }
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    let evaluated = 0;
    let pending = 0;
    let withSubmission = 0;
    assignments.forEach(a => {
      const hasSub = !!a.submission_id;
      if (hasSub) withSubmission++;
      if (hasSub && a.evaluation_id) evaluated++;
      else if (hasSub && !a.evaluation_id) pending++;
    });
    return { evaluated, pending, total: assignments.length, withSubmission };
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
          <p className="judge-subtitle">Evaluate assigned team submissions, monitor scoring progress, and review feedback history.</p>
        </header>
        <div className="judge-actions-bar">
          <Link to="/judge/evaluation" className="judge-btn judge-btn-primary">Go To Evaluation</Link>
          <Link to="/judge/feedback" className="judge-btn judge-btn-secondary">Feedback History</Link>
          <Link to="/judge/schedule" className="judge-btn judge-btn-outline">Presentation Schedule</Link>
        </div>
        <section className="judge-card" aria-label="Assigned Teams">
          <div className="judge-card-header">
            <div>
              <div className="judge-card-title">Assigned Teams</div>
              <div className="judge-card-meta">{stats.evaluated} evaluated • {stats.pending} pending • {stats.withSubmission}/{stats.total} submitted</div>
            </div>
            <div className="judge-filters">
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
          {loading && <div className="judge-loading-container">Loading assignments…</div>}
          {!loading && error && (
            <div className="judge-empty" style={{ marginTop:'.5rem' }}>
              <strong style={{ color:'var(--judge-danger)' }}>Failed to load assignments</strong>
              <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Please refresh or check network connectivity.</span>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="judge-empty" style={{ marginTop:'.5rem' }}>
              <strong>No teams match current filters.</strong>
              <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Adjust search text or status filter to view other teams.</span>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul className="judge-list" aria-label="Teams list">
              {filtered.map(row => {
                const submitted = !!row.submission_id;
                const evaluated = !!row.evaluation_id;
                return (
                  <li key={row.team_id} className={`judge-list-item ${evaluated ? 'judge-list-item-evaluated' : ''}`}>
                    <div className="judge-row-top">
                      <div style={{ flex:1 }}>
                        <strong className="judge-team-name">{row.team_name || `Team #${row.team_id}`}</strong>
                        <div className="judge-team-meta">
                          {submitted ? `Submitted ${row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : ''}` : 'Not Submitted'}
                        </div>
                      </div>
                      <div className="judge-row-actions">
                        {renderScoreBadge(row)}
                        <Link
                          to="/judge/evaluation"
                          className={`judge-btn judge-btn-xs ${evaluated ? 'judge-btn-outline' : submitted ? 'judge-btn-primary' : 'judge-btn-secondary'}`}
                        >{evaluated ? 'Update' : submitted ? 'Evaluate' : 'Awaiting'}</Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

// Removed inline filter styles in favor of shared judge-input / judge-select classes
