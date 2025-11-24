import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Judge Feedback History Page
// Aligns with backend getEvaluationHistory response shape:
// e: { id, submission_id, judge_id, innovation_score, technical_score, presentation_score, comments, evaluated_at, submission_title, team_name, total_score }
export default function JudgeFeedbackHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/judge/history');
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted) setHistory(data);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || e.message || 'Failed to load history');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Judge — Feedback History</h2>
      <p style={{ color: '#666', marginTop: -4 }}>Past evaluations you have submitted. Total score is the sum of the three rubric scores.</p>
      {history.length === 0 && <p>No past evaluations.</p>}
      {history.map(ev => {
        const total = typeof ev.total_score === 'number'
          ? ev.total_score
          : [ev.innovation_score, ev.technical_score, ev.presentation_score]
              .filter(v => typeof v === 'number')
              .reduce((a,b) => a + b, 0);
        return (
          <div key={ev.id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 14, background: '#1e293b', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>{ev.team_name || `Team #${ev.submission_id}`}</strong>
              <span style={{ background: '#0ea5e9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>Total: {total}</span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{ev.submission_title || 'Untitled Submission'}</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
              <Metric label="Innovation" value={ev.innovation_score} />
              <Metric label="Technical" value={ev.technical_score} />
              <Metric label="Presentation" value={ev.presentation_score} />
            </div>
            {ev.comments && <div style={{ marginTop: 12 }}><strong style={{ fontSize: 12 }}>Comments:</strong><div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.4 }}>{ev.comments}</div></div>}
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 12 }}>Evaluated: {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleString() : 'Unknown'}</div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{typeof value === 'number' ? value : '—'}</span>
    </div>
  );
}
