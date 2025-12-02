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
    const hasSubmission = !!s.submission_id || !!s.evaluation_id || !!s.submitted_at;
    if (!hasSubmission) return <span className="judge-badge judge-badge-soft">No Submission</span>;
    if (!s.evaluation_id) return <span className="judge-badge judge-badge-warning">Pending Eval</span>;
    const scores = [s.innovation_score, s.technical_score, s.presentation_score];
    const validScores = scores.filter(v => typeof v === 'number');
    const total = validScores.reduce((a,b) => a + b, 0);
    return <span className="judge-badge judge-badge-success">Score: {total}</span>;
  };

  return (
    <AppShell>
      <div className="mentor-dashboard-bg">
        <div className="mentor-dashboard glass">
          {/* Header */}
          <div className="mentor-dashboard-header">
            <div className="mentor-dashboard-icon">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#00e0ff33"/>
                <path d="M12 36V20H36V36" stroke="#00e0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="20" y="24" width="8" height="8" rx="2" fill="#00e0ff"/>
              </svg>
            </div>
            <div>
              <div className="mentor-dashboard-title">Judge Dashboard</div>
              <div className="mentor-dashboard-subtitle">Evaluate submissions, monitor progress, and review feedback history.</div>
            </div>
          </div>

          {/* Stat Widgets */}
          <div className="mentor-dashboard-stats-row">
            <StatWidget label="Assigned" value={stats.total} icon="📝" color="#00e0ff" />
            <StatWidget label="Evaluated" value={stats.evaluated} icon="✅" color="#7cffb2" />
            <StatWidget label="Pending" value={stats.pending} icon="⏳" color="#ffd966" />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/judge/evaluation" className="action-btn">
              <span className="action-icon">📝</span>
              <div>
                <div className="action-title">Evaluation</div>
                <div className="action-desc">Score and review submissions</div>
              </div>
            </Link>
            <Link to="/judge/feedback" className="action-btn">
              <span className="action-icon">📋</span>
              <div>
                <div className="action-title">Feedback History</div>
                <div className="action-desc">See your past feedback</div>
              </div>
            </Link>
            <Link to="/judge/schedule" className="action-btn">
              <span className="action-icon">📅</span>
              <div>
                <div className="action-title">Presentation Schedule</div>
                <div className="action-desc">View judging slots</div>
              </div>
            </Link>
          </div>

          {/* Assigned Teams Section */}
          <div className="teams-section">
            <h3>Assigned Teams</h3>
            <div className="teams-grid">
              {loading ? (
                <div className="empty-state"><p>Loading…</p></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📋</p>
                  <p className="empty-title">No Teams Assigned Yet</p>
                  <p className="empty-desc">You'll see your assigned teams here once they're allocated or match your filters.</p>
                </div>
              ) : (
                filtered.map(row => {
                  const hasSubmission = !!row.submission_id || !!row.evaluation_id || !!row.submitted_at;
                  const evaluated = !!row.evaluation_id;
                  return (
                    <div key={row.team_id} className="team-card">
                      <div className="team-card-header">
                        <div className="team-info">
                          <h4 className="team-name">{row.team_name || `Team #${row.team_id}`}</h4>
                          <p className="team-meta">
                            {hasSubmission ? `Submitted${row.submitted_at ? ' ' + new Date(row.submitted_at).toLocaleDateString() : ''}` : 'Not Submitted'}
                          </p>
                        </div>
                      </div>
                      <div className="team-card-body">
                        <div className="detail-section">
                          <h5>Submission Status</h5>
                          {renderScoreBadge(row)}
                        </div>
                        <div className="team-actions">
                          <Link
                            to="/judge/evaluation"
                            className={`btn-primary`}
                          >{evaluated ? 'Update' : hasSubmission ? 'Evaluate' : 'Awaiting'}</Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );

  function StatWidget({ label, value, icon, color }) {
    return (
      <div className="mentor-dashboard-stat-widget glass" style={{ borderColor: color }}>
        <div className="stat-icon" style={{ color }}>{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }
}

// Removed inline filter styles in favor of shared judge-input / judge-select classes
