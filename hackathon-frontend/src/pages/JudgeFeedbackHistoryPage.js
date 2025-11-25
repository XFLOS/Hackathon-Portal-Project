import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Judge Feedback History Page
// Aligns with backend getEvaluationHistory response shape:
// e: { id, submission_id, judge_id, innovation_score, technical_score, presentation_score, comments, evaluated_at, submission_title, team_name, total_score }

export default function JudgeFeedbackHistoryPage() {
  const [history, setHistory] = useState([]); // current page items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0); // 0-based
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [expanded, setExpanded] = useState({}); // submissionId -> bool
  const [editing, setEditing] = useState({}); // submissionId -> bool
  const [editState, setEditState] = useState({}); // submissionId -> {innovation_score,...,comments}
  const [saving, setSaving] = useState({});

  // Load all assigned submissions (with evaluation if present)
  const loadPage = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/judge/history?page=${targetPage}&pageSize=${pageSize}`);
      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload.items;
      setHistory(items || []);
      if (!Array.isArray(payload) && typeof payload.totalPages === 'number') {
        setTotalPages(payload.totalPages);
      } else {
        setTotalPages(1);
      }
      // Initialize edit state for evaluated submissions
      const nextEdit = {};
      for (const it of items || []) {
        nextEdit[it.submission_id] = {
          innovation_score: it.innovation_score ?? '',
          technical_score: it.technical_score ?? '',
          presentation_score: it.presentation_score ?? '',
          comments: it.comments ?? ''
        };
      }
      setEditState(nextEdit);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(0); }, []); // initial
  useEffect(() => { loadPage(page); }, [page]);

  const toggleExpand = (submissionId) => setExpanded(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  const toggleEdit = (submissionId) => setEditing(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  const updateField = (submissionId, field, value) => setEditState(prev => ({ ...prev, [submissionId]: { ...prev[submissionId], [field]: value } }));

  const validateScores = ({ innovation_score, technical_score, presentation_score }) => {
    const scores = [innovation_score, technical_score, presentation_score].map(v => Number(v));
    return scores.every(s => !Number.isNaN(s) && s >= 0 && s <= 10);
  };

  const saveEdit = async (item) => {
    const state = editState[item.submission_id];
    if (!state || !validateScores(state)) { alert('Scores must be 0–10.'); return; }
    try {
      setSaving(prev => ({ ...prev, [item.submission_id]: true }));
      await api.post(`/judge/evaluate/${item.submission_id}`, {
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments
      });
      // Update local history array
      setHistory(prev => prev.map(ev => ev.submission_id === item.submission_id ? {
        ...ev,
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments,
        evaluated_at: new Date().toISOString(),
        total_score: Number(state.innovation_score) + Number(state.technical_score) + Number(state.presentation_score),
        evaluation_id: ev.evaluation_id || -1
      } : ev));
      setEditing(prev => ({ ...prev, [item.submission_id]: false }));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to save evaluation');
    } finally {
      setSaving(prev => ({ ...prev, [item.submission_id]: false }));
    }
  };

  if (loading) return <div className="judge-page"><div className="judge-loading-container">Loading feedback history…</div></div>;
  if (error) return (
    <div className="judge-page">
      <div className="judge-empty">
        <strong style={{ color:'var(--judge-danger)' }}>Failed to Load History</strong>
        <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="judge-page">
      <header className="judge-page-header">
        <h1 className="judge-title">Feedback History</h1>
        <p className="judge-subtitle">All submissions assigned to you. If not yet evaluated, you can submit feedback here.</p>
      </header>
      {history.length === 0 && (
        <div className="judge-empty">
          <strong>No Assigned Submissions</strong>
          <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>You have no assigned submissions at this time.</span>
        </div>
      )}
      {history.map(ev => {
        const evaluated = !!ev.evaluation_id;
        const total = typeof ev.total_score === 'number'
          ? ev.total_score
          : [ev.innovation_score, ev.technical_score, ev.presentation_score]
              .filter(v => typeof v === 'number')
              .reduce((a,b) => a + b, 0);
        const isExpanded = expanded[ev.submission_id];
        const isEditing = editing[ev.submission_id];
        const es = editState[ev.submission_id] || {};
        return (
          <div key={ev.submission_id} className="judge-card" style={{ marginBottom:'1rem' }}>
            <div className="judge-card-header" onClick={() => toggleExpand(ev.submission_id)} style={{ cursor:'pointer' }}>
              <div>
                <div className="judge-card-title">{ev.team_name || `Team #${ev.submission_id}`}</div>
                <div className="judge-card-meta">{ev.submission_title || 'Untitled Submission'}</div>
              </div>
              {evaluated
                ? <span className="judge-badge judge-badge-success">Evaluated • {total}</span>
                : <span className="judge-badge judge-badge-warning">Not yet evaluated</span>
              }
            </div>
            {isExpanded && (
              <>
                {!isEditing && (
                  <div className="judge-metrics-grid" style={{ marginTop:'.75rem' }}>
                    <Metric label="Innovation" value={ev.innovation_score} />
                    <Metric label="Technical" value={ev.technical_score} />
                    <Metric label="Presentation" value={ev.presentation_score} />
                  </div>
                )}
                {isEditing && (
                  <div className="judge-metrics-grid" style={{ marginTop:'.75rem' }}>
                    {['innovation_score','technical_score','presentation_score'].map(field => (
                      <div key={field}>
                        <label style={{ display:'block', fontSize:'var(--judge-font-xs)', marginBottom:4 }}>{field.replace('_',' ').replace('_',' ').replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
                        <input type="number" min={0} max={10} value={es[field]} onChange={e=>updateField(ev.submission_id, field, e.target.value)} className="judge-input" />
                      </div>
                    ))}
                    <div style={{ gridColumn:'1 / -1' }}>
                      <label style={{ display:'block', fontSize:'var(--judge-font-xs)', marginBottom:4 }}>Comments</label>
                      <textarea rows={3} value={es.comments} onChange={e=>updateField(ev.submission_id,'comments',e.target.value)} className="judge-textarea" />
                    </div>
                  </div>
                )}
                {ev.comments && !isEditing && <div style={{ marginTop: '.75rem' }}><strong style={{ fontSize: 'var(--judge-font-xs)' }}>Comments:</strong><div style={{ marginTop: 4, fontSize: 'var(--judge-font-md)', lineHeight: 1.4 }}>{ev.comments}</div></div>}
                <div style={{ fontSize: 'var(--judge-font-xs)', color: 'var(--judge-text-muted)', marginTop: '.75rem' }}>
                  {evaluated
                    ? <>Evaluated: {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleString() : 'Unknown'}</>
                    : <>Not yet evaluated</>
                  }
                </div>
                <div style={{ marginTop: '.75rem', display:'flex', gap:8, flexWrap:'wrap' }}>
                  {!isEditing && (
                    <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.submission_id);}} className="judge-btn judge-btn-outline">
                      {evaluated ? 'Edit' : 'Evaluate'}
                    </button>
                  )}
                  {isEditing && <>
                    <button disabled={saving[ev.submission_id]} onClick={(e)=>{e.stopPropagation(); saveEdit(ev);}} className="judge-btn judge-btn-primary">{saving[ev.submission_id] ? 'Saving…' : (evaluated ? 'Save' : 'Submit')}</button>
                    <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.submission_id);}} className="judge-btn judge-btn-secondary">Cancel</button>
                  </>}
                  <button onClick={(e)=>{e.stopPropagation(); toggleExpand(ev.submission_id);}} className="judge-btn judge-btn-ghost">{isExpanded ? 'Collapse' : 'Expand'}</button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:'1.5rem' }}>
          <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className={`judge-btn ${page===0?'judge-btn-secondary':'judge-btn-outline'}`}>Prev</button>
          <span style={{ alignSelf:'center', fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Page {page+1} / {totalPages}</span>
          <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} className={`judge-btn ${page>=totalPages-1?'judge-btn-secondary':'judge-btn-outline'}`}>Next</button>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="judge-metric-box">
      <span>{label}</span>
      <span>{typeof value === 'number' ? value : '—'}</span>
    </div>
  );
}

// Inline styles migrated to judge theme classes
