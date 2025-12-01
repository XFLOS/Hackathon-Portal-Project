import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

export default function CoordinatorScheduleEditor() {
  const { role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ...existing state declarations...

  // Fetch events from backend
  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/coordinator/schedule')
      .then(res => {
        const sorted = (res.data || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setEvents(sorted);
      })
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // In all create, edit, delete handlers, call fetchEvents() after success
  // ...existing code, but replace setEvents logic after successful create/edit/delete with fetchEvents()...

  // UI rendering
  if (authLoading) return <div style={{ padding: 32 }}>Loading...</div>;
  const isCoordinator = role === 'coordinator';

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h2>Schedule Editor</h2>
      {!isCoordinator && (
        <Alert type="info" message="You have read-only access to the schedule. Only coordinators can add, edit, or delete events." style={{ marginBottom: 16 }} />
      )}
      {/* Export buttons for coordinators */}
      {isCoordinator && (
        <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
          <Button type="button" onClick={() => {
            // Export as CSV
            const headers = ['Event Name', 'Description', 'Date', 'Start Time', 'End Time', 'Location'];
            const rows = events.map(ev => [
              ev.event_name,
              ev.description,
              new Date(ev.start_time).toLocaleDateString(),
              new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ev.location
            ]);
            let csv = headers.join(',') + '\n';
            rows.forEach(r => { csv += r.map(x => '"' + (x || '').replace(/"/g, '""') + '"').join(',') + '\n'; });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'schedule.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>Export as CSV</Button>
          <Button type="button" onClick={() => {
            // Export as PDF
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text('Hackathon Schedule', 14, 16);
            const headers = ['Event Name', 'Description', 'Date', 'Start', 'End', 'Location'];
            const rows = events.map(ev => [
              ev.event_name,
              ev.description,
              new Date(ev.start_time).toLocaleDateString(),
              new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ev.location
            ]);
            let y = 28;
            doc.setFontSize(10);
            doc.text(headers, 14, y);
            y += 6;
            rows.forEach(r => {
              doc.text(r.map(x => String(x)), 14, y);
              y += 6;
              if (y > 280) { doc.addPage(); y = 16; }
            });
            doc.save('schedule.pdf');
          }}>Export as PDF</Button>
        </div>
      )}
      {/* Only show event creation form to coordinators */}
      {isCoordinator && (
        <form /* ...form props and handlers here... */>
          {/* ...event creation form fields and submit button... */}
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Event Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Start</th>
            <th style={{ textAlign: 'left', padding: 8 }}>End</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Location</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Phase</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => {
            // Phase color map
            const phaseColors = {
              registration: '#1976d2',
              hacking: '#43a047',
              judging: '#fbc02d',
              ceremony: '#8e24aa',
              networking: '#00838f',
              other: '#757575'
            };
            const phase = ev.phase || 'other';
            const badgeColor = phaseColors[phase] || phaseColors.other;
            return (
              <tr key={ev.id} style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{ev.event_name}</td>
                <td style={{ padding: 8 }}>{ev.description}</td>
                <td style={{ padding: 8 }}>{new Date(ev.start_time).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: 8 }}>{new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: 8 }}>{ev.location}</td>
                <td style={{ padding: 8 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 12,
                    background: badgeColor,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    letterSpacing: 0.5
                  }}
                  aria-label={`Phase: ${phase}`}
                  >{phase}</span>
                </td>
                <td style={{ padding: 8 }}>
                  {isCoordinator && <Button /* ...edit props... */>Edit</Button>}
                  {isCoordinator && <Button /* ...delete props... */>Delete</Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}