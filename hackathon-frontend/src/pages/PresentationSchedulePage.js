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
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });

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
      <div className="judge-page">
        <p style={{ color: '#b0c4d8', textAlign: 'center', marginTop: 48 }}>Loading schedule…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-page">
        <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: 48 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="judge-page">
      <header className="judge-page-header">
        <h1 className="judge-title">Event Schedule</h1>
        <p className="judge-subtitle">See all scheduled events for the hackathon. Times are shown in EST.</p>
      </header>
      {events.length === 0 ? (
        <div className="judge-empty">
          <strong>No schedule events.</strong>
          <span style={{ fontSize:'var(--judge-font-xs)', color:'var(--judge-text-muted)' }}>Coordinator may not have published them yet.</span>
        </div>
      ) : (
        <ul className="judge-list" style={{ maxWidth: 700, margin: '0 auto' }}>
          {events.map(event => (
            <li key={event.id} className="judge-list-item">
              <div className="judge-row-top">
                <strong>{event.event_name}</strong>
              </div>
              <div className="judge-row-actions" style={{ flexWrap:'wrap' }}>
                <span className="judge-badge judge-badge-soft">{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
                {event.location && <span className="judge-location">{event.location}</span>}
              </div>
              {event.description && <p style={{ fontSize:'var(--judge-font-sm)', color:'var(--judge-text-bright)', margin:0 }}>{event.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}