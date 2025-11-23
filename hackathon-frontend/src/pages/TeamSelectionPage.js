import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingTeam, setCheckingTeam] = useState(true);

  // Check if user already has a team on page load
  useEffect(() => {
    const checkExistingTeam = async () => {
      try {
        const res = await api.get('/teams/me');
        if (res.data && res.data.id) {
          // User already has a team, redirect to team page
          console.log('User already has a team, redirecting...');
          localStorage.setItem('teamId', res.data.id);
          navigate('/team', { replace: true });
        }
      } catch (err) {
        // If 404 or error, user doesn't have a team yet - stay on this page
        console.log('No existing team found, showing team selection');
      } finally {
        setCheckingTeam(false);
      }
    };

    checkExistingTeam();
  }, [navigate]);

  // Validation helpers
  const validateTeamName = (teamName) => {
    if (!teamName.trim()) {
      return "Team name is required";
    }
    if (teamName.trim().length < 3) {
      return "Team name must be at least 3 characters";
    }
    if (teamName.trim().length > 50) {
      return "Team name must be less than 50 characters";
    }
    // Allow letters, numbers, spaces, hyphens, underscores
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(teamName.trim())) {
      return "Team name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    return null;
  };

  const validateDescription = (desc) => {
    if (desc.trim().length > 200) {
      return "Description must be less than 200 characters";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) return null; // Optional field
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return "Invalid email format";
    }
    return null;
  };

  const validateJoinCode = (code) => {
    if (!code.trim()) {
      return "Join code is required";
    }
    if (code.trim().length < 4) {
      return "Join code must be at least 4 characters";
    }
    return null;
  };

  const handleCreateTeam = async () => {
    setMessage("");
    setErrors({});

    // Validate team name
    const nameError = validateTeamName(name);
    if (nameError) {
      setErrors({ name: nameError });
      setMessage(nameError);
      return;
    }

    // Validate description
    const descError = validateDescription(description);
    if (descError) {
      setErrors({ description: descError });
      setMessage(descError);
      return;
    }

    // Validate member emails
    const emailErrors = [];
    memberEmails.forEach((email, idx) => {
      if (email.trim()) {
        const emailError = validateEmail(email);
        if (emailError) {
          emailErrors.push(`Member ${idx + 1}: ${emailError}`);
        }
      }
    });

    if (emailErrors.length > 0) {
      setMessage(emailErrors.join(", "));
      return;
    }

    if (emailErrors.length > 0) {
      setMessage(emailErrors.join(", "));
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
      name: name.trim(),
      description: description.trim(),
      leaderId: user.uid,
      memberEmails: memberEmails.filter((email) => email.trim() !== ''),
    };

    setLoading(true);
    try {
      const res = await api.post('/teams', teamData);
      console.log('Team created:', res.data);
      // Persist teamId for TeamPage to load
      if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
      setMessage('Team created successfully! Redirecting...');
      setTimeout(() => navigate('/team'), 1000); // go to team page after creation
    } catch (err) {
      console.error('Failed to create team:', err);
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to create team. Try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    setJoinMessage('');
    setErrors({});

    // Validate join code
    const codeError = validateJoinCode(joinCode);
    if (codeError) {
      setErrors({ joinCode: codeError });
      setJoinMessage(codeError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/teams/join', { code: joinCode.trim() });
      console.log('Joined team:', res.data);
      // backend returns id (DB) or id (in-memory)
      if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
      setJoinMessage('Joined successfully! Redirecting...');
      setTimeout(() => navigate('/team'), 1000);
    } catch (err) {
      console.error('Failed to join team:', err);
      const msg = err?.response?.data?.error || err.message || 'Failed to join team';
      setJoinMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-selection-container">
      {checkingTeam ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Checking your team status...</p>
        </div>
      ) : (
        <>
          <h2>Create Team</h2>
          {message && (
            <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}

          <input
            type="text"
            placeholder="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'input-error' : ''}
            disabled={loading}
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={errors.description ? 'input-error' : ''}
            disabled={loading}
          />

          {memberEmails.map((email, idx) => (
            <input
              key={idx}
              type="email"
              placeholder={`Member ${idx + 1} Email (Optional)`}
              value={email}
              onChange={(e) => {
                const newMembers = [...memberEmails];
                newMembers[idx] = e.target.value;
                setMemberEmails(newMembers);
              }}
              disabled={loading}
            />
          ))}

          <button onClick={handleCreateTeam} disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </button>

          <div style={{ marginTop: '1rem' }}>
            <h3>Or join an existing team</h3>
            {joinMessage && (
              <p className={`message ${joinMessage.includes('successfully') ? 'success' : 'error'}`}>
                {joinMessage}
              </p>
            )}
            <input
              type="text"
              placeholder="Enter join code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className={errors.joinCode ? 'input-error' : ''}
              disabled={loading}
            />
            <button onClick={handleJoinByCode} disabled={loading}>
              {loading ? 'Joining...' : 'Join Team'}
            </button>
          </div>
          <a href="/" className="back-link">Back to Home</a>
        </>
      )}
    </div>
  );
}
