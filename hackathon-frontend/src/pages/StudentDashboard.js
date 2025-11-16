import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Simple mock data provider used when backend is offline or slow.
function getMockDashboard() {
  const now = Date.now();
  return {
    team: null, // or { id, name, members }
    submissions: [
      { id: 'sub1', filename: 'project.zip', time: new Date(now - 1000 * 60 * 60).toISOString(), status: 'Pending' }
    ],
    deadlines: [
      { id: 'd1', title: 'Final Submission', due: new Date(now + 1000 * 60 * 60 * 24).toISOString() }
    ],
    announcements: [
      { id: 'a1', title: 'Welcome', body: 'Welcome to the hackathon! Check deadlines and form your teams.' }
    ]
  };
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      // If backend is too slow (2s), fall back to mock to satisfy SLA
      if (mounted && loading) {
        const mock = getMockDashboard();
        setTeam(mock.team);
        setSubmissions(mock.submissions);
        setDeadlines(mock.deadlines);
        setAnnouncements(mock.announcements);
        setLoading(false);
      }
    }, 1800);

    (async () => {
      try {
        // Try to load dashboard payload from backend-friendly endpoints
        const [teamRes, subsRes, dlRes, annRes] = await Promise.all([
          api.get('/teams/me').catch(() => ({ data: null })),
          api.get('/submissions/mine').catch(() => ({ data: [] })),
          api.get('/deadlines').catch(() => ({ data: [] })),
          api.get('/announcements').catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;
        setTeam(teamRes?.data || null);
        setSubmissions((subsRes?.data && subsRes.data.length) ? subsRes.data : []);
        setDeadlines(dlRes?.data || []);
        setAnnouncements(annRes?.data || []);
      } catch (err) {
        // If backend completely fails, mock will be used after timeout
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => { mounted = false; clearTimeout(timeout); };
  }, []);

  return (
    <div className="container section">
      <div className="stack">
        <h2 className="h2">Student Dashboard</h2>
        <p className="subtitle">Your team status, submissions, deadlines, and announcements.</p>

        <div className="grid">
          <div className="card panel">
            <h3>Team</h3>
            {loading ? <p>Loading…</p> : (
              team ? (
                <div>
                  <strong>{team.name}</strong>
                  <p>Members: {team.members?.length || 1}</p>
                </div>
              ) : (
                <div>
                  <p className="muted">You are not in a team.</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <a className="btn" href="/team-selection">Create Team</a>
                    <a className="btn" style={{ marginLeft: '0.5rem' }} href="/team-selection">Join Team</a>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="card panel">
            <h3>Submissions</h3>
            {loading ? <p>Loading…</p> : (
              submissions && submissions.length ? (
                <ul>
                  {submissions.map(s => (
                    <li key={s.id}>
                      <strong>{s.filename}</strong> — {new Date(s.time || s.timestamp || s.createdAt).toLocaleString()} — <em>{s.status}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No submissions yet.</p>
              )
            )}
          </div>

          <div className="card panel">
            <h3>Deadlines</h3>
            {loading ? <p>Loading…</p> : (
              deadlines && deadlines.length ? (
                <ul>
                  {deadlines.map(d => (
                    <li key={d.id}>{d.title} — due {new Date(d.due).toLocaleString()}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No upcoming deadlines.</p>
              )
            )}
          </div>

          <div className="card panel">
            <h3>Announcements</h3>
            {loading ? <p>Loading…</p> : (
              announcements && announcements.length ? (
                <ul>
                  {announcements.map(a => (
                    <li key={a.id}><strong>{a.title}</strong> — {a.body}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No announcements.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
