import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';


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
  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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
      {editSuccess && <Alert type="success" message={editSuccess} style={{ marginBottom: 12 }} />}
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
              <th style={{ border: '1px solid #ccc', padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No events scheduled.</td></tr>
            ) : (
              events.map(ev => {
                const start = new Date(ev.start_time);
                const end = new Date(ev.end_time);
                const isEditing = editId === ev.id;
                if (isEditing && editForm) {
                  return (
                    <tr key={ev.id} style={{ background: '#f6faff' }}>
                      <td colSpan={7}>
                        <form onSubmit={async e => {
                          e.preventDefault();
                          setEditError(null);
                          setEditSuccess(null);
                          // Validate
                          if (!editForm.event_name.trim()) return setEditError('Event name is required.');
                          if (!editForm.date) return setEditError('Date is required.');
                          if (!editForm.start_time) return setEditError('Start time is required.');
                          if (!editForm.end_time) return setEditError('End time is required.');
                          if (!editForm.location.trim()) return setEditError('Location is required.');
                          const s = new Date(`${editForm.date}T${editForm.start_time}`);
                          const en = new Date(`${editForm.date}T${editForm.end_time}`);
                          if (en <= s) return setEditError('End time must be after start time.');
                          setEditSubmitting(true);
                          try {
                            const payload = {
                              event_name: editForm.event_name,
                              description: editForm.description,
                              start_time: `${editForm.date}T${editForm.start_time}`,
                              end_time: `${editForm.date}T${editForm.end_time}`,
                              location: editForm.location
                            };
                            const res = await api.put(`/coordinator/schedule/${ev.id}`, payload);
                            setEvents(evts => evts.map(e => e.id === ev.id ? res.data.event : e));
                            setEditSuccess('Event updated successfully!');
                            setEditId(null);
                            setEditForm(null);
                          } catch (err) {
                            setEditError(err?.response?.data?.message || 'Failed to update event.');
                          } finally {
                            setEditSubmitting(false);
                          }
                        }} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input name="event_name" value={editForm.event_name} onChange={e => setEditForm(f => ({ ...f, event_name: e.target.value }))} required style={{ minWidth: 120 }} />
                          <input name="description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ minWidth: 120 }} />
                          <input type="date" name="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} required style={{ minWidth: 110 }} />
                          <input type="time" name="start_time" value={editForm.start_time} onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))} required style={{ minWidth: 90 }} />
                          <input type="time" name="end_time" value={editForm.end_time} onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))} required style={{ minWidth: 90 }} />
                          <input name="location" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} required style={{ minWidth: 120 }} />
                          <Button type="submit" disabled={editSubmitting} size="sm">{editSubmitting ? 'Saving...' : 'Save'}</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => { setEditId(null); setEditForm(null); }}>Cancel</Button>
                          {editError && <span style={{ color: 'red', marginLeft: 8 }}>{editError}</span>}
                        </form>
                      </td>
                    </tr>
                  );
                }
                // Normal row
                return (
                  <tr key={ev.id}>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.event_name}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.description}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{start.toLocaleDateString()}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>{ev.location}</td>
                    <td style={{ border: '1px solid #ccc', padding: 6 }}>
                      <Button type="button" size="sm" onClick={() => {
                        setEditId(ev.id);
                        setEditError(null);
                        setEditSuccess(null);
                        setEditForm({
                          event_name: ev.event_name,
                          description: ev.description || '',
                          date: ev.start_time ? new Date(ev.start_time).toISOString().slice(0, 10) : '',
                          start_time: ev.start_time ? new Date(ev.start_time).toISOString().slice(11, 16) : '',
                          end_time: ev.end_time ? new Date(ev.end_time).toISOString().slice(11, 16) : '',
                          location: ev.location || ''
                        });
                      }}>Edit</Button>
                    </td>
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