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

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Judge — Evaluation</h2>
      <p style={{ color: '#666', marginTop: -4 }}>Provide scores (0–10) for each rubric category. You can update an evaluation at any time.</p>
      {submissions.length === 0 && <p>No submissions available.</p>}
      {submissions.map(sub => {
        const evaluated = !!sub.evaluation_id;
        const fs = formState[sub.id] || {};
        const total = [sub.innovation_score, sub.technical_score, sub.presentation_score]
          .filter(v => typeof v === 'number')
          .reduce((a, b) => a + b, 0);
        return (
          <div key={sub.id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 14, background: '#0f172a', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>{sub.team_name || `Team #${sub.team_id}`}</strong>
              {evaluated && <span style={{ background: '#059669', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>Evaluated • Total {total}</span>}
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#94a3b8' }}>Submission ID: {sub.id}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Innovation (0–10)</label>
                <input type="number" min={0} max={10} value={fs.innovation_score}
                  onChange={e => updateField(sub.id, 'innovation_score', e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Technical (0–10)</label>
                <input type="number" min={0} max={10} value={fs.technical_score}
                  onChange={e => updateField(sub.id, 'technical_score', e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Presentation (0–10)</label>
                <input type="number" min={0} max={10} value={fs.presentation_score}
                  onChange={e => updateField(sub.id, 'presentation_score', e.target.value)}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Comments</label>
              <textarea rows={3} value={fs.comments}
                onChange={e => updateField(sub.id, 'comments', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', width: '100%' }} placeholder="Optional qualitative feedback" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <button
                onClick={() => submitEvaluation(sub.id)}
                disabled={submitting[sub.id]}
                style={buttonStyle(submitting[sub.id])}
              >{evaluated ? (submitting[sub.id] ? 'Updating…' : 'Update Evaluation') : (submitting[sub.id] ? 'Submitting…' : 'Submit Evaluation')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#f8fafc',
  fontSize: 14
};

const buttonStyle = (busy) => ({
  background: busy ? '#475569' : 'linear-gradient(135deg,#00e5ff,#0891b2)',
  color: '#020617',
  fontWeight: 600,
  padding: '10px 18px',
  border: 'none',
  borderRadius: 8,
  cursor: busy ? 'not-allowed' : 'pointer',
  boxShadow: '0 4px 12px rgba(0,229,255,0.3)',
  transition: 'all .25s'
});
