import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';

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
      {/* Only show event creation form to coordinators */}
      {isCoordinator && (
        // ...existing event creation form code...
      )}
      {/* ...existing table rendering code, but only show edit/delete buttons if isCoordinator... */}
    </div>
  );
}