import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Phase 1 Judge Evaluation Page
// Implements correct API contract: POST /judge/evaluate/:submissionId
// Sends { innovation_score, technical_score, presentation_score, comments }
// Supports update if evaluation already exists (evaluation_id present)
export default function JudgeEvaluationPage() {
  const [submissions, setSubmissions] = useState([]); // list from /judge/submissions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Local form state keyed by submission id
  const [formState, setFormState] = useState({});
  const [submitting, setSubmitting] = useState({}); // per-row submitting flag
  // Submission details for view
  const [viewDetails, setViewDetails] = useState({}); // { [id]: { loading, error, data } }
  // Fetch submission details for a given submission id
  const fetchSubmissionDetails = async (submissionId) => {
    setViewDetails(prev => ({ ...prev, [submissionId]: { loading: true, error: '', data: null } }));
    try {
      const res = await api.get(`/submission/${submissionId}`);
      setViewDetails(prev => ({ ...prev, [submissionId]: { loading: false, error: '', data: res.data } }));
    } catch (e) {
      setViewDetails(prev => ({ ...prev, [submissionId]: { loading: false, error: e.response?.data?.message || e.message || 'Failed to load submission', data: null } }));
    }
  };

  // Initialize form state with existing evaluation scores if present
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/judge/submissions');
        const data = Array.isArray(res.data) ? res.data : [];
        if (!mounted) return;
        // Build initial form state
        const initial = {};
        for (const s of data) {
          initial[s.id] = {
            innovation_score: s.innovation_score ?? '',
            technical_score: s.technical_score ?? '',
            presentation_score: s.presentation_score ?? '',
            comments: s.comments ?? ''
          };
        }
        setFormState(initial);
        setSubmissions(data);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || e.message || 'Failed to load submissions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateField = (id, field, value) => {
    setFormState(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const validateScores = ({ innovation_score, technical_score, presentation_score }) => {
    const toNum = v => v === '' ? NaN : Number(v);
    const scores = [toNum(innovation_score), toNum(technical_score), toNum(presentation_score)];
    for (const s of scores) {
      if (Number.isNaN(s) || s < 0 || s > 10) return false;
    }
    return true;
  };

  const submitEvaluation = async (submissionId) => {
    const state = formState[submissionId];
    if (!state) return;
    if (!validateScores(state)) {
      alert('All three scores must be numbers between 0 and 10.');
      return;
    }
    try {
      setSubmitting(prev => ({ ...prev, [submissionId]: true }));
      await api.post(`/judge/evaluate/${submissionId}`,{
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments
      });

      // Refresh row locally (mark as evaluated)
      setSubmissions(prev => prev.map(s => s.id === submissionId ? {
        ...s,
        innovation_score: Number(state.innovation_score),
        technical_score: Number(state.technical_score),
        presentation_score: Number(state.presentation_score),
        comments: state.comments,
        evaluation_id: s.evaluation_id || -1 // sentinel if it was newly created
      } : s));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  if (loading) return <div className="judge-page"><div className="judge-loading-container">Loading submissions…</div></div>;
  if (error) return (
    <div className="judge-page">
      <div className="judge-empty">
        <strong style={{ color:'var(--judge-danger)' }}>Failed to Load Submissions</strong>
        <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="judge-page">
      <header className="judge-page-header">
        <h1 className="judge-title">Evaluation</h1>
        <p className="judge-subtitle">Provide scores (0–10) for each rubric category. You can update at any time.</p>
      </header>
      {submissions.length === 0 && (
        <div className="judge-empty">
          <strong>No Submissions Available</strong>
          <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>You have no assigned submissions to evaluate at this time.</span>
        </div>
      )}
      {submissions.map(sub => {
        const evaluated = !!sub.evaluation_id;
        const fs = formState[sub.id] || {};
        const total = [sub.innovation_score, sub.technical_score, sub.presentation_score]
          .filter(v => typeof v === 'number')
          .reduce((a, b) => a + b, 0);
        return (
          <div key={sub.id} className="judge-card" style={{ marginBottom:'1rem' }}>
            <div className="judge-card-header">
              <div>
                <div className="judge-card-title">{sub.team_name || `Team #${sub.team_id}`}</div>
                <div className="judge-card-meta">Submission #{sub.id}</div>
              </div>
              {evaluated && <span className="judge-badge judge-badge-success">Evaluated • {total}</span>}
            </div>
            {/* View Submission Section */}
            <div style={{ margin: '0.5rem 0' }}>
              <button
                className="judge-btn judge-btn-outline"
                style={{ minWidth: 150, marginBottom: 6 }}
                onClick={() => fetchSubmissionDetails(sub.id)}
                aria-expanded={!!viewDetails[sub.id]?.data}
              >
                {viewDetails[sub.id]?.data ? 'Hide Submission' : (viewDetails[sub.id]?.loading ? 'Loading…' : 'View Submission')}
              </button>
              {viewDetails[sub.id]?.loading && <span style={{ marginLeft: 8, fontSize: 12 }}>Loading…</span>}
              {viewDetails[sub.id]?.error && <div style={{ color: 'var(--judge-danger)', fontSize: 13 }}>{viewDetails[sub.id].error}</div>}
              {viewDetails[sub.id]?.data && (
                <div className="judge-submission-view" style={{ background: '#181c2a', borderRadius: 8, padding: '0.75rem 1rem', marginTop: 8 }}>
                  <div><strong>Title:</strong> {viewDetails[sub.id].data.title || viewDetails[sub.id].data.project_name || 'Untitled Submission'}</div>
                  {viewDetails[sub.id].data.description && <div style={{ marginTop: 4 }}><strong>Description:</strong> {viewDetails[sub.id].data.description}</div>}
                  {viewDetails[sub.id].data.file_url && (
                    <div style={{ marginTop: 4 }}>
                      <strong>File:</strong> <a href={viewDetails[sub.id].data.file_url} target="_blank" rel="noopener noreferrer">Download/View</a>
                    </div>
                  )}
                  {viewDetails[sub.id].data.filename && (
                    <div style={{ marginTop: 4 }}><strong>Filename:</strong> {viewDetails[sub.id].data.filename}</div>
                  )}
                  {viewDetails[sub.id].data.created_at && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#aaa' }}><strong>Submitted:</strong> {new Date(viewDetails[sub.id].data.created_at).toLocaleString()}</div>
                  )}
                </div>
              )}
            </div>
            <div className="judge-metrics-grid" style={{ marginTop: '.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--judge-font-xs)', marginBottom: 4 }}>Innovation (0–10)</label>
                <input type="number" min={0} max={10} value={fs.innovation_score}
                  onChange={e => updateField(sub.id, 'innovation_score', e.target.value)}
                  className="judge-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--judge-font-xs)', marginBottom: 4 }}>Technical (0–10)</label>
                <input type="number" min={0} max={10} value={fs.technical_score}
                  onChange={e => updateField(sub.id, 'technical_score', e.target.value)}
                  className="judge-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--judge-font-xs)', marginBottom: 4 }}>Presentation (0–10)</label>
                <input type="number" min={0} max={10} value={fs.presentation_score}
                  onChange={e => updateField(sub.id, 'presentation_score', e.target.value)}
                  className="judge-input" />
              </div>
            </div>
            <div style={{ marginTop: '.75rem' }}>
              <label style={{ display: 'block', fontSize: 'var(--judge-font-xs)', marginBottom: 4 }}>Comments</label>
              <textarea rows={3} value={fs.comments}
                onChange={e => updateField(sub.id, 'comments', e.target.value)}
                className="judge-textarea" placeholder="Optional qualitative feedback" />
            </div>
            <div style={{ marginTop: '.75rem', display: 'flex', gap: '.75rem', flexWrap:'wrap' }}>
              <button
                onClick={() => submitEvaluation(sub.id)}
                disabled={submitting[sub.id]}
                className={`judge-btn ${evaluated ? 'judge-btn-outline' : 'judge-btn-primary'}`}
                style={{ minWidth:170 }}
              >{evaluated ? (submitting[sub.id] ? 'Updating…' : 'Update Evaluation') : (submitting[sub.id] ? 'Submitting…' : 'Submit Evaluation')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Migrated inline input/button styles to shared judge theme classes
