import React from 'react';

// Public page listing available hackathons (placeholder data)
export default function HackathonsListPage() {
  const hacks = [
    { id: 'spring-innovate', name: 'Spring Innovate 2025', dates: 'Apr 12–13', desc: '48h product sprint.' },
    { id: 'ai-challenge', name: 'AI Challenge', dates: 'May 3–4', desc: 'ML + data hack.' },
  ];

  return (
    <section>
      <h1>Available Hackathons</h1>
      <p>Sign in to enroll and see team options.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {hacks.map((h) => (
          <li key={h.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 10 }}>
            <h3 style={{ margin: '0 0 4px' }}>{h.name}</h3>
            <small>{h.dates}</small>
            <p style={{ marginTop: 8 }}>{h.desc}</p>
            <button disabled>Enroll (placeholder)</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

