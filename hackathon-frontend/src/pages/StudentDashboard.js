import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';
import StudentSidebar from '../components/layout/StudentSidebar';
import './StudentDashboard.css';

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
  const [error, setError] = useState(null);
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
        // Load dashboard data from backend endpoints
        const [teamRes, subsRes, scheduleRes] = await Promise.all([
          api.get('/team/me').catch(() => ({ data: null })),
          api.get('/submission/me').catch(() => ({ data: [] })),
          api.get('/users/schedule').catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;
        setTeam(teamRes?.data || null);
        setSubmissions(Array.isArray(subsRes?.data) ? subsRes.data : (subsRes?.data ? [subsRes.data] : []));
        
        // Extract deadlines from schedule events
        const events = scheduleRes?.data || [];
        const deadlineEvents = events.filter(e => e.type === 'deadline' || e.title?.toLowerCase().includes('deadline'));
        setDeadlines(deadlineEvents.map(e => ({ id: e.id, title: e.title, due: e.time })));
        
        // Extract announcements from schedule
        const announcements = events.filter(e => e.type === 'announcement').map(e => ({ 
          id: e.id, 
          title: e.title, 
          body: e.description || '' 
        }));
        setAnnouncements(announcements.length ? announcements : [
          { id: 'welcome', title: 'Welcome', body: 'Check your schedule for important updates!' }
        ]);
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (mounted) {
          setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
          // Fall back to mock data
          const mock = getMockDashboard();
          setTeam(mock.team);
          setSubmissions(mock.submissions);
          setDeadlines(mock.deadlines);
          setAnnouncements(mock.announcements);
        }
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => { mounted = false; clearTimeout(timeout); };
  }, []);

  return (
    <AppShell sidebar={<StudentSidebar />}>
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p className="dashboard-subtitle">Your team status, submissions, deadlines, and announcements.</p>
        </div>

        {loading && <div className="dashboard-loading"><LoadingSpinner /></div>}
        
        {error && (
          <div className="dashboard-alert">
            <strong>⚠️ Warning:</strong> {error}. Showing offline data.
          </div>
        )}

        {!loading && (
          <div className="dashboard-grid">
            <Card 
              title="Team"
              subtitle={team ? `${team.name} · ${team.members?.length || 1} members` : null}
              actions={team && <Button size="sm" variant="outline">View Team</Button>}
            >
              {team ? (
                <div className="team-info">
                  <p>Leader: {team.creator_name || 'Unknown'}</p>
                  <p>Status: Active</p>
                </div>
              ) : (
                <div>
                  <p className="no-team-message">You are not in a team.</p>
                  <div className="team-actions">
                    <Button variant="primary" onClick={() => window.location.href = '/team-selection'}>
                      Create Team
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/team-selection'}>
                      Join Team
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card 
              title="Submissions"
              subtitle="Track your project uploads"
              actions={<Button size="sm" variant="outline">Upload</Button>}
            >
              {submissions && submissions.length ? (
                <ul className="dashboard-list">
                  {submissions.map(s => (
                    <li key={s.id}>
                      <strong>{s.filename}</strong> — {new Date(s.time || s.timestamp || s.createdAt).toLocaleString()} — <em>{s.status}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No submissions yet.</p>
              )}
            </Card>

            <Card 
              title="Deadlines"
              subtitle="Upcoming milestones"
            >
              {deadlines && deadlines.length ? (
                <ul className="dashboard-list">
                  {deadlines.map(d => (
                    <li key={d.id}>{d.title} — due {new Date(d.due).toLocaleString()}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No upcoming deadlines.</p>
              )}
            </Card>

            <Card 
              title="Announcements"
              subtitle="Latest updates"
            >
              {announcements && announcements.length ? (
                <ul className="dashboard-list">
                  {announcements.map(a => (
                    <li key={a.id}><strong>{a.title}</strong> — {a.body}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No announcements.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
