import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorScheduleEditor() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/coordinator/schedule')
      .then(res => {
        if (mounted) {
          // Sort events by start_time ascending
          const sorted = (res.data || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          setEvents(sorted);
        }
      })
      .catch(err => {
        if (mounted) setError('Failed to load schedule');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Schedule Editor</h2>
      {loading && <p>Loading schedule...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Event Name</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Description</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Start Time</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>End Time</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Location</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No events scheduled.</td></tr>
            ) : (
              events.map(ev => {
                const start = new Date(ev.start_time);
                const end = new Date(ev.end_time);
                return (
                  <tr key={ev.id}>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.event_name}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.description}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{start.toLocaleDateString()}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.location}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}