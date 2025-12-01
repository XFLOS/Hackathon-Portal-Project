import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PresentationSchedulePage.css';

// ✅ Error Boundary for this page
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: 'red', background: '#222', borderRadius: 8, margin: 32 }}>
          <h2>Schedule Page Error</h2>
          <p>Sorry, something went wrong while loading the schedule.</p>
          <pre style={{ color: '#fff', fontSize: 12 }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    try {
      const res = await api.get('/users/schedule');
      const sortedEvents = (res.data || []).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setEvents(sortedEvents);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const findNextEvent = () => {
    const now = new Date().getTime();
    const upcoming = events.find(e => new Date(e.start_time).getTime() > now);
    setNextEvent(upcoming || null);
  };

  const getEventStatus = (event) => {
    const now = currentTime.getTime();
    const start = new Date(event.start_time).getTime();
    const end = new Date(event.end_time).getTime();
    if (now >= start && now <= end) return 'ongoing';
    if (now > end) return 'past';
    return 'upcoming';
  };

  const formatCountdown = (target) => {
    const diff = new Date(target).getTime() - currentTime.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) return ${days}d ${hours}h ${minutes}m;
    if (hours > 0) return ${hours}h ${minutes}m ${seconds}s;
    if (minutes > 0) return ${minutes}m ${seconds}s;
    return ${seconds}s;
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

  const formatDuration = (startTime, endTime) => {
    const diff = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 0 && minutes > 0) return ${hours}h ${minutes}m;
    if (hours > 0) return ${hours}h;
    return ${minutes}m;
  };

  if (loading) {
    return <div className="schedule-container">Loading schedule...</div>;
  }

  if (error) {
    return <div className="schedule-container">{error}</div>;
  }

  return (
    <PageErrorBoundary>
      <div className="schedule-container">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No events scheduled</p>
            <p className="empty-subtitle">Check back later for the event schedule</p>
          </div>
        ) : (
          <div className="events-timeline">
            {events.map((event) => {
              const status = getEventStatus(event);
              return (
                <div key={event.id} className={event-item ${status}}>
                  <h3>{event.event_name}</h3>
                  <p>{event.description}</p>
                  <p>Start: {formatTime(event.start_time)}</p>
                  <p>Duration: {formatDuration(event.start_time, event.end_time)}</p>
                  <p>Status: {status}</p>
                  {status === 'upcoming' && event === nextEvent && (
                    <p>Next starts in {formatCountdown(event.start_time)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageErrorBoundary>
  );
}