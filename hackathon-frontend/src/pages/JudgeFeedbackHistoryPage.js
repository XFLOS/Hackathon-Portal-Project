import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function JudgeFeedbackHistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    api.get('/judge/history')
      .then(res => { if (on) setItems(res.data || []); })
      .catch(e => { if (on) setError(e.response?.data?.message || e.message); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Judge — Feedback History</h2>
      {items.length === 0 ? <p>No past evaluations.</p> : (
        items.map((e) => (
          <div key={e.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
            <div><strong>Team:</strong> {e.teamId}</div>
            <div><strong>Score:</strong> {e.score}</div>
            <div><strong>Comments:</strong> {e.comments}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(e.at).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}
