import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './PresentationSchedulePage.css';

export default function MentorEventSchedulePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/schedule');
      const sortedEvents = (res.data || []).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setEvents(sortedEvents);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading schedule…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="schedule-card">
        <div className="schedule-header">
          <h2 className="schedule-title">Mentor Event Schedule</h2>
          <div className="schedule-subtitle">All times shown in EST (Eastern Time)</div>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📋</p>
            <p>No schedule events.</p>
            <p className="empty-subtitle">Coordinator may not have published them yet.</p>
          </div>
        ) : (
          <ul className="events-timeline">
            {events.map((event, idx) => {
              const now = new Date();
              const start = new Date(event.start_time);
              const end = new Date(event.end_time);
              let status = 'upcoming';
              if (now >= start && now <= end) status = 'ongoing';
              else if (now > end) status = 'past';
              return (
                <li key={event.id} className={`event-item ${status}`}>
                  <div className="event-timeline-marker">
                    <span className="timeline-dot" />
                    {idx < events.length - 1 && <span className="timeline-line" />}
                  </div>
                  <div className="event-content">
                    <div className="event-header-row">
                      <div className="event-title">{event.event_name}</div>
                      <span className={`status-badge ${status}`}>{status === 'ongoing' ? 'Ongoing' : status === 'past' ? 'Past' : 'Upcoming'}</span>
                    </div>
                    <div className="event-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🕒</span>
                        <span className="meta-label">Time:</span>
                        <span className="meta-value">{formatEventTime(event.start_time)} – {formatEventTime(event.end_time)}</span>
                      </span>
                      {event.location && (
                        <span className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span className="meta-label">Location:</span>
                          <span className="meta-value">{event.location}</span>
                        </span>
                      )}
                    </div>
                    {event.description && <div className="event-description">{event.description}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
