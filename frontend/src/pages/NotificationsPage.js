import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/notifications')
      .then(res => { if (mounted) setItems(res.data || []); })
      .catch(err => { if (mounted) setError(err.response?.data?.message || err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
    } catch (err) {
      alert('Failed to mark read');
    }
  };

  if (loading) return <p>Loading notifications…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Notifications</h2>
      {items.length === 0 ? <p>No notifications.</p> : (
        <ul>
          {items.map(n => (
            <li key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
              <div><strong>{n.title}</strong></div>
              <div>{n.body}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.at || n.createdAt).toLocaleString()}</div>
              {!n.read && <button onClick={() => markRead(n.id)}>Mark read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

