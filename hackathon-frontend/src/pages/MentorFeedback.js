import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MentorFeedback() {
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let on = true;
    api.get('/api/mentor/teams')
      .then(res => {
        if (!on) return; 
        const list = res.data || [];
        setTeams(list);
        if (list.length && !teamId) setTeamId(list[0].id);
      })
      .catch(() => {})
    return () => { on = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await api.post(`/api/mentor/teams/${teamId}/feedback`, { message });
      setStatus('Feedback sent');
      setMessage('');
    } catch (e) {
      setStatus(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <h2>Mentor — Feedback for Teams</h2>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input placeholder="Your feedback" value={message} onChange={e => setMessage(e.target.value)} required />
        <button type="submit">Send</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
