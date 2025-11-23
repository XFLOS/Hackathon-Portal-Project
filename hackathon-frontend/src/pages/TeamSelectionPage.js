import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { auth, firebaseEnabled } from '../firebase/config'; // for current user and token
import "./TeamSelectionPage.css";

export default function TeamSelectionPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmails, setMemberEmails] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");

  const handleCreateTeam = async () => {
    if (!name.trim()) {
      setMessage("Team name is required!");
      return;
    }

    // Determine current user (Firebase or backend JWT stored in localStorage)
    let user = null;
    if (firebaseEnabled && auth && auth.currentUser) {
      user = auth.currentUser;
    } else {
      try {
        user = JSON.parse(localStorage.getItem('user')) || null;
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      setMessage('You must be logged in to create a team.');
      return;
    }

    const teamData = {
      name,
      description,
      leaderId: user.uid,
      memberEmails: memberEmails.filter((email) => email.trim() !== ''),
    };

    try {
      const res = await api.post('/teams', teamData);
      console.log('Team created:', res.data);
      // Persist teamId for TeamPage to load
      if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
      navigate('/team'); // go to team page after creation
    } catch (err) {
      console.error('Failed to create team:', err);
      setMessage('Failed to create team. Try again.');
    }
  };

  const handleJoinByCode = async () => {
    setJoinMessage('');
    if (!joinCode || !joinCode.trim()) {
      setJoinMessage('Enter a join code');
      return;
    }

    try {
      const res = await api.post('/teams/join', { code: joinCode.trim() });
      console.log('Joined team:', res.data);
      // backend returns id (DB) or id (in-memory)
      if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
      navigate('/team');
    } catch (err) {
      console.error('Failed to join team:', err);
      const msg = err?.response?.data?.error || err.message || 'Failed to join team';
      setJoinMessage(msg);
    }
  };

  return (
    <div className="team-selection-container">
      <h2>Create Team</h2>
      {message && <p className="message">{message}</p>}

      <input
        type="text"
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {memberEmails.map((email, idx) => (
        <input
          key={idx}
          type="email"
          placeholder={`Member ${idx + 1} Email`}
          value={email}
          onChange={(e) => {
            const newMembers = [...memberEmails];
            newMembers[idx] = e.target.value;
            setMemberEmails(newMembers);
          }}
        />
      ))}

      <button onClick={handleCreateTeam}>Create Team</button>
      <div style={{ marginTop: '1rem' }}>
        <h3>Or join an existing team</h3>
        {joinMessage && <p className="message">{joinMessage}</p>}
        <input
          type="text"
          placeholder="Enter join code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button onClick={handleJoinByCode}>Join Team</button>
      </div>
      <a href="/" className="back-link">Back to Home</a>
    </div>
  );
}
