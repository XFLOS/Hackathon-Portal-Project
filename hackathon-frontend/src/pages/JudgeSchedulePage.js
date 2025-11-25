import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

// JudgeSchedulePage
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
    <div className="judge-page">
      <header className="judge-page-header">
        <h1 className="judge-title">Presentation Schedule</h1>
        <p className="judge-subtitle">View the full timeline or only your assigned team presentation slots. Live slots highlight & pulse.</p>
      </header>
      <div className="judge-toolbar">
        <button onClick={()=>setShowMine(false)} className={`judge-btn ${!showMine ? 'judge-btn-primary':'judge-btn-outline'}`}>All Events</button>
        <button onClick={()=>setShowMine(true)} className={`judge-btn ${showMine ? 'judge-btn-primary':'judge-btn-outline'}`} disabled={assignments.length===0 || !presentationEvent}>My Presentations</button>
      </div>
      <div aria-live="polite" aria-atomic="true" className="visually-hidden">
        {displayItems.filter(item => isWithin(item.start_time, item.end_time)).map(item => 
          `${item.kind === 'slot' ? item.team_name : item.event_name} is now presenting`
        ).join(', ')}
      </div>
      {loading && <div className="judge-loading-container">Loading schedule…</div>}
      {error && !loading && (
        <div className="judge-empty">
          <strong style={{ color:'var(--judge-danger)' }}>Error Loading Schedule</strong>
          <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>{error}</span>
        </div>
      )}
      {!loading && displayItems.length === 0 && (
        <div className="judge-empty">
          {showMine ? (
            <>
              <strong>No derived presentation slots.</strong>
              <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Ensure a presentation event exists and you have team assignments.</span>
            </>
          ) : (
            <>
              <strong>No schedule events.</strong>
              <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Coordinator may not have published them yet.</span>
            </>
          )}
        </div>
      )}
      {!loading && displayItems.length > 0 && (
        <ul className="judge-list">
          {displayItems.map(item => {
            const live = isWithin(item.start_time, item.end_time);
            if (item.kind === 'event') {
              return (
                <li key={`ev-${item.id}`} className={`judge-list-item ${live?'judge-live-row':''}`}>
                  <div className="judge-row-top">
                    <strong>{item.event_name}</strong>
                    {live && <span className="judge-badge judge-badge-live">Live Now</span>}
                  </div>
                  <div className="judge-row-actions judge-flex-wrap">
                    <span className="judge-badge judge-badge-soft">{new Date(item.start_time).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    <span className="judge-badge judge-badge-info">{formatRange(item.start_time, item.end_time)}</span>
                    {item.location && <span className="judge-location">{item.location}</span>}
                  </div>
                  {item.description && <p style={{ fontSize:'var(--judge-font-sm)', color:'var(--judge-text-bright)', margin:0 }}>{item.description}</p>}
                </li>
              );
            }
            return (
              <li key={item.id} className={`judge-list-item ${live?'judge-live-row':''}`}>
                <div className="judge-row-top">
                  <strong>{item.team_name}</strong>
                  {live && <span className="judge-badge judge-badge-live">Live Slot</span>}
                </div>
                <div className="judge-row-actions judge-flex-wrap">
                  <span className="judge-badge judge-badge-info">{formatRange(item.start_time, item.end_time)}</span>
                  {item.submission_id ? <span className="judge-badge judge-badge-success">Submission #{item.submission_id}</span> : <span className="judge-badge judge-badge-soft">No Submission</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {showMine && presentationEvent && derivedSlots.length > 0 && (
        <div className="judge-info-line">
          Slot length: {Math.round((new Date(derivedSlots[0].end_time) - new Date(derivedSlots[0].start_time))/60000)}m · Source event: “{presentationEvent.event_name}”
        </div>
      )}
    </div>
  );
}

// All inline styles replaced by judge-theme utility classes above.

