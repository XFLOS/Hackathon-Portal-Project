import React, { useState } from 'react';

// Simple admin-only scheduling placeholder. Replace with real data + API.
export default function PresentationSchedulePage() {
  const [sessions, setSessions] = useState([
    { id: 1, team: 'Team Alpha', time: '10:00', room: 'A' },
    { id: 2, team: 'Team Beta', time: '10:20', room: 'A' },
    { id: 3, team: 'Team Gamma', time: '10:40', room: 'B' },
  ]);

  const shuffle = () => {
    setSessions((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <section>
      <h1>Presentation Scheduler</h1>
      <p>Draft schedule. Hook this up to your backend to persist.</p>
      <button onClick={shuffle}>Randomize Order</button>
      <div style={{ marginTop: 16 }}>
        {sessions.map((s) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12,
            padding: 8, border: '1px solid #ddd', borderRadius: 6, marginBottom: 8
          }}>
            <strong>{s.team}</strong>
            <span>Time: {s.time}</span>
            <span>Room: {s.room}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

