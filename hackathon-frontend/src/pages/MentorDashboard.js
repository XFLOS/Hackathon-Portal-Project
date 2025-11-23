import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AppShell from '../components/layout/AppShell';
import './MentorDashboard.css';

export default function MentorDashboard() {
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [teamDetails, setTeamDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState({});
  
  useEffect(() => {
    fetchAssignedTeams();
  }, []);

  const fetchAssignedTeams = async () => {
    try {
      const res = await api.get('/mentor/teams');
      if (res?.data) {
        setTeams(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load mentor teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamExpand = async (teamId) => {
    const isExpanding = !expandedTeams[teamId];
    
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: isExpanding
    }));

    // Fetch team details if expanding and not already loaded
    if (isExpanding && !teamDetails[teamId]) {
      setLoadingDetails(prev => ({ ...prev, [teamId]: true }));
      try {
        const res = await api.get(`/mentor/team/${teamId}`);
        setTeamDetails(prev => ({
          ...prev,
          [teamId]: res.data
        }));
      } catch (err) {
        console.error(`Failed to load details for team ${teamId}:`, err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [teamId]: false }));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mentor-dashboard">
          <LoadingSpinner />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mentor-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h2>Mentor Dashboard</h2>
          <p className="subtitle">Guide and support your assigned teams throughout the hackathon</p>
        </div>

        {/* Quick Stats */}
        <div className="mentor-stats">
          <div className="stat-card">
            <div className="stat-value">{teams.length}</div>
            <div className="stat-label">Assigned Teams</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {teams.reduce((sum, t) => sum + (parseInt(t.member_count) || 0), 0)}
            </div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/mentor/teams" className="action-btn">
            <span className="action-icon">💬</span>
            <div>
              <div className="action-title">Team Q&A</div>
              <div className="action-desc">View team updates and discussions</div>
            </div>
          </Link>
          <Link to="/mentor/feedback" className="action-btn">
            <span className="action-icon">📝</span>
            <div>
              <div className="action-title">Provide Feedback</div>
              <div className="action-desc">Give guidance and suggestions</div>
            </div>
          </Link>
        </div>

        {/* Teams List */}
        <div className="teams-section">
          <h3>Your Assigned Teams</h3>
          
          {teams.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📋</p>
              <p className="empty-title">No Teams Assigned Yet</p>
              <p className="empty-desc">You'll see your assigned teams here once they're allocated.</p>
            </div>
          ) : (
            <div className="teams-grid">
              {teams.map((team) => {
                const isExpanded = expandedTeams[team.id];
                const details = teamDetails[team.id];
                const isLoadingDetails = loadingDetails[team.id];

                return (
                  <div key={team.id} className={`team-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="team-card-header" onClick={() => toggleTeamExpand(team.id)}>
                      <div className="team-info">
                        <h4 className="team-name">{team.name}</h4>
                        <p className="team-meta">
                          {team.member_count || 0} members • Assigned {formatDate(team.assigned_at)}
                        </p>
                      </div>
                      <button className="expand-btn">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="team-card-body">
                        {isLoadingDetails ? (
                          <div className="loading-details">Loading details...</div>
                        ) : details ? (
                          <>
                            {/* Project Info */}
                            <div className="detail-section">
                              <h5>Project Details</h5>
                              <div className="project-info">
                                <div className="info-row">
                                  <span className="label">Project Name:</span>
                                  <span className="value">{details.project_name || 'Not specified'}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">Description:</span>
                                  <span className="value">{details.project_description || 'No description provided'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Team Members */}
                            <div className="detail-section">
                              <h5>Team Members ({details.members?.length || 0})</h5>
                              {details.members && details.members.length > 0 ? (
                                <div className="members-list">
                                  {details.members.map((member) => (
                                    <div key={member.id} className="member-item">
                                      <div className="member-info">
                                        <span className="member-name">{member.full_name}</span>
                                        {member.role === 'leader' && (
                                          <span className="leader-badge">Leader</span>
                                        )}
                                      </div>
                                      <a href={`mailto:${member.email}`} className="member-email">
                                        {member.email}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="empty-text">No members yet</p>
                              )}
                            </div>

                            {/* Submission Status */}
                            <div className="detail-section">
                              <h5>Submission Status</h5>
                              {details.submission ? (
                                <div className="submission-info">
                                  <div className="status-badge submitted">✓ Submitted</div>
                                  <div className="submission-details">
                                    <p><strong>{details.submission.title}</strong></p>
                                    <p className="submission-desc">{details.submission.description}</p>
                                    {details.submission.github_url && (
                                      <a href={details.submission.github_url} target="_blank" rel="noopener noreferrer" className="submission-link">
                                        View on GitHub
                                      </a>
                                    )}
                                    {details.submission.demo_url && (
                                      <a href={details.submission.demo_url} target="_blank" rel="noopener noreferrer" className="submission-link">
                                        View Demo
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="submission-info">
                                  <div className="status-badge pending">⏳ Not Submitted</div>
                                  <p className="empty-text">Team hasn't submitted their project yet</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="team-actions">
                              <Link to={`/mentor/teams?team=${team.id}`} className="btn-secondary">
                                View Updates
                              </Link>
                              <Link to={`/mentor/feedback?team=${team.id}`} className="btn-primary">
                                Give Feedback
                              </Link>
                            </div>
                          </>
                        ) : (
                          <p className="error-text">Failed to load team details</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
