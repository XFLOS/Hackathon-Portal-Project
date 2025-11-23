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
    // Update current time every second for accurate countdowns
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      findNextEvent();
    }
  }, [events, currentTime]);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/schedule');
      // Sort by start_time chronologically
      const sortedEvents = (res.data || []).sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
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
    const upcoming = events.find(event => {
      const startTime = new Date(event.start_time).getTime();
      return startTime > now;
    });
    setNextEvent(upcoming || null);
  };

  const getEventStatus = (event) => {
    const now = currentTime.getTime();
    const startTime = new Date(event.start_time).getTime();
    const endTime = new Date(event.end_time).getTime();

    if (now >= startTime && now <= endTime) {
      return 'ongoing';
    } else if (now > endTime) {
      return 'past';
    } else {
      return 'upcoming';
    }
  };

  const formatCountdown = (targetDate) => {
    const now = currentTime.getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading schedule...</p>
        </div>
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
      <div className="schedule-card">
        <div className="schedule-header">
          <h1 className="schedule-title">Event Schedule</h1>
          <p className="schedule-subtitle">Complete hackathon timeline and event details</p>
        </div>

        {nextEvent && (
          <div className="next-event-banner">
            <div className="next-event-label">Next Event</div>
            <div className="next-event-info">
              <h3>{nextEvent.event_name}</h3>
              <div className="countdown-timer">
                <span className="countdown-label">Starts in:</span>
                <span className="countdown-value">{formatCountdown(nextEvent.start_time)}</span>
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
            {events.map((event, index) => {
              const status = getEventStatus(event);
              return (
                <div key={event.id} className={`event-item ${status}`}>
                  <div className="event-timeline-marker">
                    <div className="timeline-dot"></div>
                    {index < events.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header-row">
                      <h3 className="event-title">{event.event_name}</h3>
                      <span className={`status-badge ${status}`}>
                        {status === 'ongoing' ? '🔴 Live Now' : 
                         status === 'past' ? '✓ Completed' : 
                         '⏰ Upcoming'}
                      </span>
                    </div>

                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}

                    <div className="event-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🕒</span>
                        <span className="meta-label">Time:</span>
                        <span className="meta-value">{formatTime(event.start_time)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">{formatDuration(event.start_time, event.end_time)}</span>
                      </div>
                      {event.location && (
                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span className="meta-label">Location:</span>
                          <span className="meta-value">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {status === 'ongoing' && (
                      <div className="ongoing-indicator">
                        <div className="pulse-dot"></div>
                        <span>Event in progress</span>
                      </div>
                    )}

                    {status === 'upcoming' && event === nextEvent && (
                      <div className="next-event-indicator">
                        Next event starts in {formatCountdown(event.start_time)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

