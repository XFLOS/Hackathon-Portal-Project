import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/notifications');
      setItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
      showMessage('Notification marked as read', 'success');
    } catch (err) {
      showMessage('Failed to mark as read', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setItems(prev => prev.map(i => ({ ...i, read: true })));
      showMessage('All notifications marked as read', 'success');
    } catch (err) {
      showMessage('Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      showMessage('Notification deleted', 'success');
    } catch (err) {
      showMessage('Failed to delete notification', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-card">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {message && (
          <div className={`alert ${messageType}`}>
            {message}
          </div>
        )}

        {unreadCount > 0 && (
          <div className="notifications-actions">
            <button onClick={markAllRead} className="btn-mark-all-read">
              Mark All as Read
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>No notifications yet</p>
            <p className="empty-subtitle">You'll be notified when there's something new</p>
          </div>
        ) : (
          <div className="notifications-list">
            {items.map(n => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'} ${n.type || 'info'}`}>
                <div className="notification-indicator"></div>
                <div className="notification-content">
                  <div className="notification-header-row">
                    <h3 className="notification-title">{n.title}</h3>
                    <div className="notification-actions">
                      {!n.read && (
                        <button 
                          onClick={() => markRead(n.id)} 
                          className="btn-action btn-mark-read"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)} 
                        className="btn-action btn-delete"
                        title="Delete notification"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="notification-message">{n.message}</p>
                  <div className="notification-meta">
                    <span className="notification-type-badge">{n.type || 'info'}</span>
                    <span className="notification-time">
                      {new Date(n.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

