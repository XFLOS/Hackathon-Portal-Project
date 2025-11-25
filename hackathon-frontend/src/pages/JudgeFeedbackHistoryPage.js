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
        const isExpanded = expanded[ev.id];
        const isEditing = editing[ev.id];
        const es = editState[ev.id] || {};
        return (
          <div key={ev.id} style={{ border: '1px solid #334155', padding: 16, borderRadius: 8, marginBottom: 14, background: '#0f172a', color: '#f8fafc', position:'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, cursor: 'pointer' }} onClick={() => toggleExpand(ev.id)}>
              <strong>{ev.team_name || `Team #${ev.submission_id}`}</strong>
              <span style={{ background: '#0ea5e9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>Total: {total}</span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{ev.submission_title || 'Untitled Submission'}</div>
            {isExpanded && (
              <>
                {!isEditing && (
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                    <Metric label="Innovation" value={ev.innovation_score} />
                    <Metric label="Technical" value={ev.technical_score} />
                    <Metric label="Presentation" value={ev.presentation_score} />
                  </div>
                )}
                {isEditing && (
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                    {['innovation_score','technical_score','presentation_score'].map(field => (
                      <div key={field}>
                        <label style={{ display:'block', fontSize:12, marginBottom:4 }}>{field.replace('_',' ').replace('_',' ').replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
                        <input type="number" min={0} max={10} value={es[field]} onChange={e=>updateField(ev.id, field, e.target.value)} style={inputStyle} />
                      </div>
                    ))}
                    <div style={{ gridColumn:'1 / -1' }}>
                      <label style={{ display:'block', fontSize:12, marginBottom:4 }}>Comments</label>
                      <textarea rows={3} value={es.comments} onChange={e=>updateField(ev.id,'comments',e.target.value)} style={{ ...inputStyle, resize:'vertical', width:'100%' }} />
                    </div>
                  </div>
                )}
                {ev.comments && !isEditing && <div style={{ marginTop: 12 }}><strong style={{ fontSize: 12 }}>Comments:</strong><div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.4 }}>{ev.comments}</div></div>}
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 12 }}>Evaluated: {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleString() : 'Unknown'}</div>
                <div style={{ marginTop: 12, display:'flex', gap:8 }}>
                  {!isEditing && <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.id);}} style={buttonStyle(false,'outline')}>Edit</button>}
                  {isEditing && <>
                    <button disabled={saving[ev.id]} onClick={(e)=>{e.stopPropagation(); saveEdit(ev);}} style={buttonStyle(saving[ev.id],'primary')}>{saving[ev.id] ? 'Saving…' : 'Save'}</button>
                    <button onClick={(e)=>{e.stopPropagation(); toggleEdit(ev.id);}} style={buttonStyle(false,'secondary')}>Cancel</button>
                  </>}
                  <button onClick={(e)=>{e.stopPropagation(); toggleExpand(ev.id);}} style={buttonStyle(false,'ghost')}>{isExpanded ? 'Collapse' : 'Expand'}</button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
          <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} style={pagBtn(page===0)}>Prev</button>
          <span style={{ alignSelf:'center', fontSize:12 }}>Page {page+1} / {totalPages}</span>
          <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} style={pagBtn(page>=totalPages-1)}>Next</button>
        </div>
      )}
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

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#f8fafc',
  fontSize: 14
};

const buttonStyle = (busy, variant) => {
  const base = {
    padding:'8px 14px',
    borderRadius:6,
    fontSize:14,
    cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.6 : 1,
    border:'1px solid transparent'
  };
  switch(variant){
    case 'primary': return { ...base, background:'linear-gradient(135deg,#00e5ff,#0891b2)', color:'#021b2b', fontWeight:600, border:'none' };
    case 'outline': return { ...base, background:'transparent', color:'#0ea5e9', border:'1px solid #0ea5e9' };
    case 'secondary': return { ...base, background:'#334155', color:'#f8fafc' };
    case 'ghost': return { ...base, background:'transparent', color:'#94a3b8' };
    default: return base;
  }
};

const pagBtn = (disabled) => ({
  padding:'6px 12px',
  borderRadius:6,
  fontSize:13,
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#334155' : '#0ea5e9',
  color:'#fff',
  border:'none'
});
