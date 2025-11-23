// src/pages/MentorFeedback.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './MentorFeedback.css';

function MentorFeedback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(searchParams.get('team') || '');
  const [feedback, setFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch mentor's teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch feedback history when team is selected
  useEffect(() => {
    if (selectedTeamId) {
      fetchFeedbackHistory(selectedTeamId);
    } else {
      setFeedbackHistory([]);
    }
  }, [selectedTeamId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentor/teams');
      setTeams(response.data);
      
      // If team param exists, use it
      const teamParam = searchParams.get('team');
      if (teamParam && response.data.some(t => t.id === parseInt(teamParam))) {
        setSelectedTeamId(teamParam);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackHistory = async (teamId) => {
    try {
      const response = await api.get(`/mentor/feedback/${teamId}`);
      setFeedbackHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch feedback history:', err);
      setError('Failed to load feedback history.');
    }
  };

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    setFeedback('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeamId) {
      setError('Please select a team first.');
      return;
    }

    if (!feedback.trim()) {
      setError('Please enter your feedback.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await api.post(`/mentor/feedback/${selectedTeamId}`, {
        feedback: feedback.trim()
      });

      setSuccess('Feedback submitted successfully! ✓');
      setFeedback('');
      
      // Refresh feedback history
      await fetchFeedbackHistory(selectedTeamId);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
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

  const selectedTeam = teams.find(t => t.id === parseInt(selectedTeamId));

  if (loading) {
    return (
      <AppShell>
        <div className="mentor-feedback-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading teams...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mentor-feedback-page">
        {/* Header */}
        <div className="feedback-header">
          <button onClick={() => navigate('/mentor-dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1 className="page-title">Provide Team Feedback</h1>
          <p className="page-subtitle">Share insights and guidance with your teams</p>
        </div>

        {/* Main Content */}
        <div className="feedback-content">
          {/* Left Column: Feedback Form */}
          <div className="feedback-form-section">
            <div className="form-card">
              <h2 className="section-title">Write Feedback</h2>

              {/* Team Selection */}
              <div className="form-group">
                <label htmlFor="team-select" className="form-label">
                  Select Team <span className="required">*</span>
                </label>
                <select
                  id="team-select"
                  value={selectedTeamId}
                  onChange={handleTeamChange}
                  className="team-select"
                  disabled={submitting}
                >
                  <option value="">-- Choose a team --</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name || `Team #${team.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Team Info */}
              {selectedTeam && (
                <div className="selected-team-info">
                  <div className="team-badge-large">{selectedTeam.name || `Team #${selectedTeam.id}`}</div>
                  {selectedTeam.project_idea && (
                    <p className="team-project">💡 {selectedTeam.project_idea}</p>
                  )}
                  {selectedTeam.description && (
                    <p className="team-description">📝 {selectedTeam.description}</p>
                  )}
                </div>
              )}

              {/* Feedback Textarea */}
              <div className="form-group">
                <label htmlFor="feedback-textarea" className="form-label">
                  Your Feedback <span className="required">*</span>
                </label>
                <textarea
                  id="feedback-textarea"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, and guidance for the team..."
                  className="feedback-textarea"
                  rows={8}
                  disabled={!selectedTeamId || submitting}
                />
                <div className="char-count">
                  {feedback.length} characters
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedTeamId || !feedback.trim() || submitting}
                className="btn-submit"
              >
                {submitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    📤 Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Feedback History */}
          <div className="feedback-history-section">
            <div className="history-card">
              <h2 className="section-title">Feedback History</h2>
              
              {!selectedTeamId ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p className="empty-text">Select a team to view feedback history</p>
                </div>
              ) : feedbackHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <p className="empty-text">No feedback yet for this team</p>
                  <p className="empty-subtext">Be the first to provide feedback!</p>
                </div>
              ) : (
                <div className="feedback-list">
                  {feedbackHistory.map((item) => (
                    <div key={item.id} className="feedback-item">
                      <div className="feedback-item-header">
                        <div className="mentor-info">
                          <span className="mentor-icon">👤</span>
                          <span className="mentor-name">{item.mentor_name}</span>
                        </div>
                        <span className="feedback-date">{formatDate(item.created_at)}</span>
                      </div>
                      <div className="feedback-text">
                        {item.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default MentorFeedback;
