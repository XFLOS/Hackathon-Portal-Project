import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';


export default function CoordinatorScheduleEditor() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    event_name: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: ''
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch events
  useEffect(() => {
    let mounted = true;
    api.get('/coordinator/schedule')
      .then(res => {
        if (mounted) {
          const sorted = (res.data || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          setEvents(sorted);
        }
      })
      .catch(() => {
        if (mounted) setError('Failed to load schedule');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Validate form fields
  const validateForm = () => {
    if (!form.event_name.trim()) return 'Event name is required.';
    if (!form.date) return 'Date is required.';
    if (!form.start_time) return 'Start time is required.';
    if (!form.end_time) return 'End time is required.';
    if (!form.location.trim()) return 'Location is required.';
    // Check time order
    const start = new Date(`${form.date}T${form.start_time}`);
    const end = new Date(`${form.date}T${form.end_time}`);
    if (end <= start) return 'End time must be after start time.';
    return null;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        event_name: form.event_name,
        description: form.description,
        start_time: `${form.date}T${form.start_time}`,
        end_time: `${form.date}T${form.end_time}`,
        location: form.location
      };
      const res = await api.post('/coordinator/schedule', payload);
      setFormSuccess('Event created successfully!');
      setForm({ event_name: '', description: '', date: '', start_time: '', end_time: '', location: '' });
      // Add new event to list and sort
      setEvents(evts => {
        const updated = [...evts, res.data.event];
        return updated.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      });
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h2>Schedule Editor</h2>
      {/* Event Creation Form */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 32, boxShadow: '0 1px 4px #0001' }}>
        <h3 style={{ marginTop: 0 }}>Add New Event</h3>
        {formError && <Alert type="error" message={formError} style={{ marginBottom: 12 }} />}
        {formSuccess && <Alert type="success" message={formSuccess} style={{ marginBottom: 12 }} />}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label>Event Name<br />
              <input name="event_name" value={form.event_name} onChange={handleInputChange} required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ flex: 3, minWidth: 220 }}>
            <label>Description<br />
              <input name="description" value={form.description} onChange={handleInputChange} style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label>Date<br />
              <input type="date" name="date" value={form.date} onChange={handleInputChange} required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label>Start Time<br />
              <input type="time" name="start_time" value={form.start_time} onChange={handleInputChange} required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label>End Time<br />
              <input type="time" name="end_time" value={form.end_time} onChange={handleInputChange} required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label>Location<br />
              <input name="location" value={form.location} onChange={handleInputChange} required style={{ width: '100%' }} />
            </label>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Event'}
          </Button>
        </div>
      </form>

      {loading && <p>Loading schedule...</p>}
      {error && <Alert type="error" message={error} />}
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