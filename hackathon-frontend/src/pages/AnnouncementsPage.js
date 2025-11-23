// src/pages/AnnouncementsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './AnnouncementsPage.css';

function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnnouncementIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('welcome')) return '👋';
    if (lowerTitle.includes('submission') || lowerTitle.includes('deadline')) return '⏰';
    if (lowerTitle.includes('mentor')) return '🎓';
    if (lowerTitle.includes('workshop') || lowerTitle.includes('event')) return '📅';
    if (lowerTitle.includes('award') || lowerTitle.includes('winner')) return '🏆';
    if (lowerTitle.includes('food') || lowerTitle.includes('snack') || lowerTitle.includes('meal')) return '🍕';
    if (lowerTitle.includes('update') || lowerTitle.includes('change')) return '📢';
    return '📣';
  };

  if (loading) {
    return (
      <AppShell>
        <div className="announcements-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading announcements...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="announcements-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={fetchAnnouncements} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="announcements-page">
        {/* Header */}
        <div className="announcements-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">
            Stay updated with important hackathon information and coordinator updates
          </p>
        </div>

        {/* Announcements List */}
        <div className="announcements-content">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <p className="empty-text">No announcements yet</p>
              <p className="empty-subtext">Check back later for updates from coordinators</p>
            </div>
          ) : (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-icon-badge">
                    {getAnnouncementIcon(announcement.title)}
                  </div>
                  
                  <div className="announcement-content">
                    <div className="announcement-header-row">
                      <h2 className="announcement-title">{announcement.title}</h2>
                      <span className="announcement-badge">Official</span>
                    </div>

                    <p className="announcement-text">{announcement.content}</p>

                    <div className="announcement-footer">
                      <div className="announcement-author">
                        <span className="author-icon">👤</span>
                        <span className="author-name">
                          {announcement.author_name || 'Coordinator'}
                        </span>
                      </div>
                      <span className="announcement-time">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        {announcements.length > 0 && (
          <div className="info-banner">
            <span className="info-icon">💡</span>
            <span className="info-text">
              Showing {announcements.length} active announcement{announcements.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default AnnouncementsPage;
