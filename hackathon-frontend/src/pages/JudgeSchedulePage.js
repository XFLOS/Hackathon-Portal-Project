import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

// JudgeSchedulePage (Phase 4)
// Provides per-team presentation slot breakdown derived from the aggregate 'Presentations & Judging' event.
// Features:
//  - Toggle filter: show all events vs only my assigned presentation slots
//  - Highlight current live slot (if now within slot start/end)
//  - Derives slot duration from description text (e.g. '10 min each'), defaults to 10 minutes
//  - Falls back gracefully if no assignments or presentation event
export default function JudgeSchedulePage() {
  const [events, setEvents] = useState([]); // raw schedule events
  const [assignments, setAssignments] = useState([]); // judge assignments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showMine, setShowMine] = useState(true); // filter toggle

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [schedRes, assignRes] = await Promise.all([
          api.get('/users/schedule').catch(() => ({ data: [] })),
          api.get('/judge/assignments/me').catch(() => ({ data: [] }))
        ]);
        if (!mounted) return;
        const sorted = (schedRes.data || []).slice().sort((a,b)=>new Date(a.start_time)-new Date(b.start_time));
        setEvents(sorted);
        setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || e.message || 'Failed to load schedule');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const timer = setInterval(()=> setCurrentTime(Date.now()), 1000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  // Presentation aggregate event (e.g., 'Presentations & Judging')
  const presentationEvent = useMemo(()=> events.find(ev => /presentation/i.test(ev.event_name)), [events]);

  // Derive per-team slots for judge's assigned teams
  const derivedSlots = useMemo(()=> {
    if (!presentationEvent || assignments.length === 0) return [];
    const start = new Date(presentationEvent.start_time).getTime();
    const end = new Date(presentationEvent.end_time).getTime();
    const totalWindowMin = Math.max(1, Math.floor((end - start)/60000));
    // Attempt to parse slot length from description text
    let slotLen = 10; // default
    if (presentationEvent.description) {
      const m = presentationEvent.description.match(/(\d+)\s*min/i);
      if (m) slotLen = parseInt(m[1], 10) || slotLen;
    }
    // Ensure slot length fits window
    const slotsNeeded = assignments.length;
    const requiredTotal = slotsNeeded * slotLen;
    if (requiredTotal > totalWindowMin) {
      // Compress: recalc slot len evenly
      slotLen = Math.floor(totalWindowMin / slotsNeeded) || 5;
    }
    const slots = [];
    let cursor = start;
    assignments.forEach((a, idx) => {
      if (cursor >= end) return; // safety
      const slotStart = cursor;
      const slotEnd = Math.min(end, slotStart + slotLen*60000);
      cursor = slotEnd; // advance
      slots.push({
        id: `slot-${a.team_id}-${idx}`,
        team_id: a.team_id,
        team_name: a.team_name,
        submission_id: a.submission_id,
        start_time: new Date(slotStart).toISOString(),
        end_time: new Date(slotEnd).toISOString(),
        base_event_id: presentationEvent.id
      });
    });
    return slots;
  }, [presentationEvent, assignments]);

  const isWithin = (startIso, endIso) => {
    const now = currentTime;
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    return now >= s && now <= e;
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatRange = (s,e) => `${formatTime(s)} – ${formatTime(e)}`;

  const allView = useMemo(()=> {
    // Combine original schedule (without modification) plus optional highlight for current event
    return events.map(ev => ({ ...ev, kind: 'event' }));
  }, [events]);

  const mineView = useMemo(()=> {
    if (!presentationEvent) return []; // nothing
    return derivedSlots.map(slot => ({ ...slot, kind: 'slot' }));
  }, [derivedSlots, presentationEvent]);

  const displayItems = showMine ? mineView : allView;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 4 }}>Judge — Presentation Schedule</h2>
      <p style={subtitleStyle}>View the full hackathon timeline or just your assigned presentation slots. Live slot is highlighted.</p>
      <div style={toolbarStyle}>
        <button onClick={()=>setShowMine(false)} style={toggleBtn(!showMine)}>All Events</button>
        <button onClick={()=>setShowMine(true)} style={toggleBtn(showMine)} disabled={assignments.length===0 || !presentationEvent}>
          My Assigned Presentations
        </button>
      </div>
      {loading && <p>Loading schedule…</p>}
      {error && !loading && <p style={{ color: 'var(--danger, #dc2626)' }}>{error}</p>}

      {!loading && displayItems.length === 0 && (
        <div style={emptyStyle}>
          {showMine ? (
            <>
              <strong>No derived presentation slots.</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>Ensure a presentation event exists and you have team assignments.</span>
            </>
          ) : (
            <>
              <strong>No schedule events.</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>Coordinator may not have published them yet.</span>
            </>
          )}
        </div>
      )}

      {!loading && displayItems.length > 0 && (
        <ul style={listStyle}>
          {displayItems.map(item => {
            const live = isWithin(item.start_time, item.end_time);
            if (item.kind === 'event') {
              const ongoing = live;
              return (
                <li key={`ev-${item.id}`} style={rowStyle(live)}>
                  <div style={headerRow}>
                    <strong>{item.event_name}</strong>
                    {ongoing && <span style={liveBadge}>Live Now</span>}
                  </div>
                  <div style={metaRow}>
                    <span style={timeStyle}>{new Date(item.start_time).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    <span style={durationStyle}>{formatRange(item.start_time, item.end_time)}</span>
                    {item.location && <span style={locStyle}>{item.location}</span>}
                  </div>
                  {item.description && <p style={descStyle}>{item.description}</p>}
                </li>
              );
            }
            // slot
            return (
              <li key={item.id} style={rowStyle(live)}>
                <div style={headerRow}>
                  <strong>{item.team_name}</strong>
                  {live && <span style={liveBadge}>Live Slot</span>}
                </div>
                <div style={metaRow}>
                  <span style={durationStyle}>{formatRange(item.start_time, item.end_time)}</span>
                  {item.submission_id ? <span style={submissionStyle}>Submission #{item.submission_id}</span> : <span style={pendingStyle}>No Submission</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {showMine && presentationEvent && derivedSlots.length > 0 && (
        <div style={{ marginTop: 18, fontSize: 12, color:'#64748b' }}>
          Slot length: {Math.round((new Date(derivedSlots[0].end_time) - new Date(derivedSlots[0].start_time))/60000)}m · Source event: “{presentationEvent.event_name}”
        </div>
      )}
    </div>
  );
}

const containerStyle = { maxWidth: 900, margin: '0 auto', padding: '1rem 0' };
const subtitleStyle = { color: '#64748b', marginTop: -2, marginBottom: 12, fontSize: 14 };
const toolbarStyle = { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0, display:'flex', flexDirection:'column', gap:12 };
const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 };
const metaRow = { display:'flex', flexWrap:'wrap', gap:12, fontSize:12, marginTop:6, alignItems:'center' };
const rowStyle = (live) => ({ background: live ? 'linear-gradient(90deg,#0f766e,#0d9488)' : '#0f172a', color:'#f8fafc', border:'1px solid #334155', padding:'12px 16px', borderRadius:10, boxShadow: live ? '0 0 0 2px #0d9488, 0 4px 16px rgba(13,148,136,0.4)' : '0 2px 8px rgba(0,0,0,0.4)', position:'relative', transition:'background .3s, box-shadow .3s' });
const timeStyle = { fontWeight:500 };
const durationStyle = { fontWeight:500 };
const locStyle = { background:'#1e293b', padding:'2px 6px', borderRadius:4 };
const descStyle = { fontSize:13, lineHeight:1.4, marginTop:8, color:'#cbd5e1' };
const liveBadge = { background:'#dc2626', color:'#fff', fontSize:11, padding:'3px 8px', borderRadius:16, fontWeight:600, letterSpacing:.5, boxShadow:'0 0 0 2px #dc2626,0 2px 8px rgba(220,38,38,.4)' };
const submissionStyle = { background:'#0f766e', padding:'2px 8px', borderRadius:12, fontSize:11 };
const pendingStyle = { background:'#334155', padding:'2px 8px', borderRadius:12, fontSize:11 };
const toggleBtn = (active) => ({
  background: active ? 'linear-gradient(135deg,#00e5ff,#0891b2)' : '#1e293b',
  color: active ? '#021b2b' : '#f1f5f9',
  fontWeight:600,
  border:'1px solid #334155',
  padding:'8px 16px',
  borderRadius:8,
  cursor:'pointer',
  boxShadow: active ? '0 4px 12px rgba(0,229,255,.3)' : 'none'
});
const emptyStyle = { background:'#0f172a', color:'#f1f5f9', border:'1px solid #334155', padding:'28px 24px', borderRadius:12, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start' };

