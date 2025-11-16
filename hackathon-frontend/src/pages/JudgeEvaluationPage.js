import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function JudgeEvaluationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    let on = true;
    api.get('/api/judge/evaluations')
      .then(res => { if (on) setItems(res.data || []); })
      .catch(e => { if (on) setError(e.response?.data?.message || e.message); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, []);

  const submit = async (id) => {
    try {
      await api.post(`/api/judge/evaluations/${id}`, { score: score[id] || 0, comments: comments[id] || '' });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'completed' } : i));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Judge — Evaluation</h2>
      {items.length === 0 ? <p>No assignments.</p> : items.map(i => (
        <div key={i.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
          <strong>{i.teamName}</strong>
          <div>Status: {i.status}</div>
          {i.status !== 'completed' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Score"
                value={score[i.id] || ''}
                onChange={e => setScore({ ...score, [i.id]: e.target.value })}
                style={{ width: 80 }}
              />
              <input
                placeholder="Comments"
                value={comments[i.id] || ''}
                onChange={e => setComments({ ...comments, [i.id]: e.target.value })}
                style={{ flex: 1 }}
              />
              <button onClick={() => submit(i.id)}>Submit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
