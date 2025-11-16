import React, { useEffect, useState } from 'react';
import { auth, firebaseEnabled } from '../firebase/config';
import { updateProfile as fbUpdateProfile } from 'firebase/auth';
import api from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (firebaseEnabled && auth && auth.currentUser) {
      const u = auth.currentUser;
      setUser({ id: u.uid, email: u.email, name: u.displayName });
      setName(u.displayName || '');
    }
  }, []);

  const save = async () => {
    setMessage('');
    try {
      if (firebaseEnabled && auth && auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { displayName: name });
      }
      // Upsert to backend (backend will read Firebase token if available)
      try {
        await api.post('/users', { name, email: user?.email });
      } catch (err) {
        // ignore backend failure
      }
      const updated = { ...user, name };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setMessage('Profile saved');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Save failed');
    }
  };

  if (!user) return <p className="container section">Please log in to view your profile.</p>;

  return (
    <div className="container section">
      <div className="stack">
        <h2 className="h2">Profile</h2>
        <div className="card panel">
          <div className="stack">
            <div>
              <label className="subtitle">Email</label>
              <div>{user.email}</div>
            </div>
            <div>
              <label className="subtitle">Full name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
            {message && <p className="muted">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
