import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PresentationSchedulePage.css';

export default function PresentationSchedulePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    fetchSchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (events.length > 0) findNextEvent();
  }, [events, currentTime]);

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

  const findNextEvent = () => {
    const now = currentTime.getTime();
    const upcoming = events.find(event => new Date(event.start_time).getTime() > now);
    setNextEvent(upcoming || null);
  };

  const getEventStatus = event => {
    const now = currentTime.getTime();
    const startTime = new Date(event.start_time).getTime();
    const endTime = new Date(event.end_time).getTime();

    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'past';
    return 'upcoming';
  };

  const formatCountdown = targetDate => {
    const diff = targetDate - currentTime.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatTime = dateString =>
    new Date(dateString).toLocaleString();

  const formatDuration = (startTime, endTime) => {
    const diff = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <p>Loading schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Event Schedule</h1>

      {nextEvent && (
        <div className="next-event-banner">
          <div className="next-event-label">Next Event</div>
          <div className="next-event-info">
            <h3>{nextEvent.event_name}</h3>
            <div className="countdown-timer">
              <span className="countdown-label">Starts in:</span>
              <span className="countdown-value">{formatCountdown(new Date(nextEvent.start_time).getTime())}</span>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No events scheduled</p>
          <p className="empty-subtitle">Check back later for the event schedule</p>
        </div>
      ) : (
        <div className="events-timeline">
          {events.map((event, idx) => {
            const status = getEventStatus(event);
            // Pick an icon based on event type or name (simple heuristic)
            let icon = "🗓️";
            if (/ceremony/i.test(event.event_name)) icon = "🎤";
            else if (/workshop|ai|ml/i.test(event.event_name)) icon = "🧑‍💻";
            else if (/snack|pizza|food/i.test(event.event_name)) icon = "🍕";
            else if (/mentor/i.test(event.event_name)) icon = "🧑‍🏫";
            else if (/submission/i.test(event.event_name)) icon = "📤";
            else if (/presentation|judging/i.test(event.event_name)) icon = "🏆";

            return (
              <div key={event.id} className={`event-item ${status}`}>
                <div className="event-timeline-marker">
                  <div className="timeline-dot" />
                  {idx < events.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="event-content">
                  <div className="event-header-row">
                    <div className="event-title">{icon} {event.event_name}</div>
                    <span className={`status-badge ${status}`}>
                      {status === 'ongoing' ? '🔴 Live Now' : status === 'past' ? '✓ Completed' : '⏰ Upcoming'}
                    </span>
                  </div>
                  <div className="event-description">{event.description}</div>
                  <div className="event-meta">
                    <div className="meta-item"><span className="meta-icon">🕒</span><span className="meta-label">Time:</span> <span className="meta-value">{formatTime(event.start_time)}</span></div>
                    <div className="meta-item"><span className="meta-icon">⏳</span><span className="meta-label">Duration:</span> <span className="meta-value">{formatDuration(event.start_time, event.end_time)}</span></div>
                  </div>
                  {status === 'ongoing' && (
                    <div className="ongoing-indicator"><span className="pulse-dot" /> Happening Now</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}