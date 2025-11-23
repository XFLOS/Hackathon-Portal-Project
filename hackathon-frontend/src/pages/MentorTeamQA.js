// src/pages/MentorTeamQA.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './MentorTeamQA.css';

export default function MentorTeamQA() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/teams');
      setTeams(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <AppShell role="mentor">
      <div className="mentor-teams-page">
        <div className="page-header">
          <h1>My Assigned Teams</h1>
          <p className="subtitle">Monitor team progress and provide guidance</p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your assigned teams...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error loading teams</strong>
              <p>{error}</p>
            </div>
            <button onClick={fetchTeams} className="retry-btn">Retry</button>
          </div>
        )}

        {!loading && !error && teams.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Teams Assigned</h3>
            <p>You don't have any teams assigned yet. Check back later!</p>
          </div>
        )}

        {!loading && !error && teams.length > 0 && (
          <div className="teams-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-card">
                <div className="team-card-header">
                  <div className="team-title-section">
                    <h2 className="team-name">{team.name || `Team #${team.id}`}</h2>
                    <span className="team-badge">
                      {team.member_count || 0} {team.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="assigned-date">
                    Assigned: {formatDate(team.assigned_at)}
                  </div>
                </div>

                <div className="team-info-section">
                  <div className="info-row">
                    <span className="info-label">👤 Team Leader:</span>
                    <span className="info-value">{team.creator_name || 'Not set'}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">📝 Description:</span>
                    <span className="info-value">{team.description || 'No description provided'}</span>
                  </div>

                  {team.project_idea && (
                    <div className="info-row">
                      <span className="info-label">💡 Project Idea:</span>
                      <span className="info-value">{team.project_idea}</span>
                    </div>
                  )}

                  {team.tech_stack && (
                    <div className="info-row">
                      <span className="info-label">🛠️ Tech Stack:</span>
                      <span className="info-value">{team.tech_stack}</span>
                    </div>
                  )}
                </div>

                <div className="team-actions">
                  <Link 
                    to={`/mentor/feedback?team=${team.id}`} 
                    className="action-btn primary"
                  >
                    <span className="btn-icon">📝</span>
                    Give Feedback
                  </Link>
                  <Link 
                    to={`/mentor/submission/${team.id}`} 
                    className="action-btn secondary"
                  >
                    <span className="btn-icon">👁️</span>
                    View Submission
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && teams.length > 0 && (
          <div className="stats-footer">
            <p>
              You are mentoring <strong>{teams.length}</strong> {teams.length === 1 ? 'team' : 'teams'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
