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
  const [expanded, setExpanded] = useState({}); // itemId -> bool
  const [editing, setEditing] = useState({}); // itemId -> bool
  const [editState, setEditState] = useState({}); // itemId -> {innovation_score,...,comments}
  const [saving, setSaving] = useState({});
  const [submissionDetails, setSubmissionDetails] = useState({}); // submission_id -> details
  const [loadingSubmission, setLoadingSubmission] = useState({}); // submission_id -> bool
  // Fetch submission details for a given submission_id
  const fetchSubmissionDetails = async (submission_id) => {
    if (submissionDetails[submission_id] || loadingSubmission[submission_id]) return;
    setLoadingSubmission(prev => ({ ...prev, [submission_id]: true }));
    try {
      const res = await api.get(`/submission/${submission_id}`);
      setSubmissionDetails(prev => ({ ...prev, [submission_id]: res.data }));
    } catch (e) {
      setSubmissionDetails(prev => ({ ...prev, [submission_id]: { error: 'Failed to load submission.' } }));
    } finally {
      setLoadingSubmission(prev => ({ ...prev, [submission_id]: false }));
    }
  };

  const loadPage = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/judge/history?page=${targetPage}&pageSize=${pageSize}`);
      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload.items; // support legacy response
      setHistory(items || []);
      if (!Array.isArray(payload) && typeof payload.totalPages === 'number') {
        setTotalPages(payload.totalPages);
      } else {
        setTotalPages(1);
      }
      // Initialize edit state if not present
      const nextEdit = {};
      for (const it of items || []) {
        nextEdit[it.id] = {
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

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleEdit = (id) => setEditing(prev => ({ ...prev, [id]: !prev[id] }));
  const updateField = (id, field, value) => setEditState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const validateScores = ({ innovation_score, technical_score, presentation_score }) => {
    const scores = [innovation_score, technical_score, presentation_score].map(v => Number(v));
    return scores.every(s => !Number.isNaN(s) && s >= 0 && s <= 10);
  };

  const saveEdit = async (item) => {
    const state = editState[item.id];
    if (!state || !validateScores(state)) { alert('Scores must be 0–10.'); return; }
    try {
      setSaving(prev => ({ ...prev, [item.id]: true }));
      await api.post(`/judge/evaluate/${item.submission_id}`, {
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments
      });
      // Update local history array
      setHistory(prev => prev.map(ev => ev.id === item.id ? {
        ...ev,
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments,
        evaluated_at: new Date().toISOString(),
        total_score: Number(state.innovation_score) + Number(state.technical_score) + Number(state.presentation_score)
      } : ev));
      setEditing(prev => ({ ...prev, [item.id]: false }));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to save evaluation');
    } finally {
      setSaving(prev => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) return <div className="judge-page"><p style={{ color:'var(--judge-text-muted)' }}>Loading…</p></div>;
  if (error) return <div className="judge-page"><p style={{ color:'var(--judge-danger)' }}>{error}</p></div>;

  return (
    <div className="judge-page">
      <header className="judge-page-header">
        <h1 className="judge-title">Feedback History</h1>
        <p className="judge-subtitle">Past evaluations you have submitted. Total score sums all rubric metrics.</p>
      </header>
      {history.length === 0 && <p style={{ color:'var(--judge-text-muted)' }}>No past evaluations.</p>}
      {history.map(ev => {
        const total = typeof ev.total_score === 'number'
          ? ev.total_score
          : [ev.innovation_score, ev.technical_score, ev.presentation_score]
              .filter(v => typeof v === 'number')
              .reduce((a,b) => a + b, 0);
        const isExpanded = expanded[ev.id];
        const isEditing = editing[ev.id];
        const es = editState[ev.id] || {};
        return (
          <div key={ev.id} className="judge-card" style={{ marginBottom:'1rem' }}>
            <div className="judge-card-header" onClick={() => toggleExpand(ev.id)} style={{ cursor:'pointer' }}>
              <div>
                <div className="judge-card-title">{ev.team_name || `Team #${ev.submission_id}`}</div>
                <div className="judge-card-meta">{ev.submission_title || 'Untitled Submission'}</div>
              </div>
              <span className="judge-badge judge-badge-info">Total: {total}</span>
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
                        <input type="number" min={0} max={10} value={es[field]} onChange={e=>updateField(ev.id, field, e.target.value)} className="judge-input" />
                      </div>
                    ))}
                    <div style={{ gridColumn:'1 / -1' }}>
                      <label style={{ display:'block', fontSize:'var(--judge-font-xs)', marginBottom:4 }}>Comments</label>
                      <textarea rows={3} value={es.comments} onChange={e=>updateField(ev.id,'comments',e.target.value)} className="judge-textarea" />
                    </div>
                  </div>
                )}
                {ev.comments && !isEditing && <div style={{ marginTop: '.75rem' }}><strong style={{ fontSize: 'var(--judge-font-xs)' }}>Comments:</strong><div style={{ marginTop: 4, fontSize: 'var(--judge-font-md)', lineHeight: 1.4 }}>{ev.comments}</div></div>}
                <div style={{ fontSize: 'var(--judge-font-xs)', color: 'var(--judge-text-muted)', marginTop: '.75rem' }}>Evaluated: {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleString() : 'Unknown'}</div>
                <div style={{ marginTop: '.75rem', display:'flex', gap:8, flexWrap:'wrap' }}>
                  {!isEditing && <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.id);}} className="judge-btn judge-btn-outline">Edit</button>}
                  {isEditing && <>
                    <button disabled={saving[ev.id]} onClick={(e)=>{e.stopPropagation(); saveEdit(ev);}} className="judge-btn judge-btn-primary">{saving[ev.id] ? 'Saving…' : 'Save'}</button>
                    <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.id);}} className="judge-btn judge-btn-secondary">Cancel</button>
                  </>}
                  <button onClick={(e)=>{e.stopPropagation(); toggleExpand(ev.id);}} className="judge-btn judge-btn-ghost">{isExpanded ? 'Collapse' : 'Expand'}</button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetchSubmissionDetails(ev.submission_id);
                      setExpanded(prev => ({ ...prev, ["submission-"+ev.id]: !prev["submission-"+ev.id] }));
                    }}
                    className="judge-btn judge-btn-outline"
                  >{expanded["submission-"+ev.id] ? 'Hide Submission' : 'View Submission'}</button>
                </div>
                {/* Submission details section */}
                {expanded["submission-"+ev.id] && (
                  <div style={{ marginTop: '1rem', background: '#181f2a', padding: '1rem', borderRadius: 8 }}>
                    {loadingSubmission[ev.submission_id] && <div>Loading submission…</div>}
                    {!loadingSubmission[ev.submission_id] && submissionDetails[ev.submission_id] && !submissionDetails[ev.submission_id].error && (
                      <div>
                        <h4 style={{ marginBottom: 8 }}>Submission Details</h4>
                        <div><strong>Title:</strong> {submissionDetails[ev.submission_id].title || 'Untitled'}</div>
                        <div><strong>Description:</strong> {submissionDetails[ev.submission_id].description || 'No description'}</div>
                        <div><strong>GitHub URL:</strong> {submissionDetails[ev.submission_id].github_url ? <a href={submissionDetails[ev.submission_id].github_url} target="_blank" rel="noopener noreferrer">{submissionDetails[ev.submission_id].github_url}</a> : 'N/A'}</div>
                        <div><strong>Demo URL:</strong> {submissionDetails[ev.submission_id].demo_url ? <a href={submissionDetails[ev.submission_id].demo_url} target="_blank" rel="noopener noreferrer">{submissionDetails[ev.submission_id].demo_url}</a> : 'N/A'}</div>
                        {submissionDetails[ev.submission_id].file_url && (
                          <div><strong>File:</strong> <a href={submissionDetails[ev.submission_id].file_url} target="_blank" rel="noopener noreferrer">Download</a></div>
                        )}
                        <div><strong>Submitted By:</strong> {submissionDetails[ev.submission_id].submitted_by_name || 'N/A'}</div>
                        <div><strong>Team:</strong> {submissionDetails[ev.submission_id].team_name || 'N/A'}</div>
                        <div><strong>Submitted At:</strong> {submissionDetails[ev.submission_id].submitted_at ? new Date(submissionDetails[ev.submission_id].submitted_at).toLocaleString() : 'N/A'}</div>
                        {submissionDetails[ev.submission_id].updated_at && submissionDetails[ev.submission_id].updated_at !== submissionDetails[ev.submission_id].submitted_at && (
                          <div><strong>Last Updated:</strong> {new Date(submissionDetails[ev.submission_id].updated_at).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                    {submissionDetails[ev.submission_id] && submissionDetails[ev.submission_id].error && (
                      <div style={{ color: 'var(--judge-danger)' }}>{submissionDetails[ev.submission_id].error}</div>
                    )}
                  </div>
                )}
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
