import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AppShell from '../components/layout/AppShell';
import './MentorDashboard.css';

export default function MentorDashboard() {
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [teamDetails, setTeamDetails] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState({});
  
  useEffect(() => {
    fetchAssignedTeams();
    fetchSchedule();
    
    // Update next event every minute
    const interval = setInterval(() => {
      if (schedule.length > 0) {
        findNextEvent(schedule);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (schedule.length > 0) {
      findNextEvent(schedule);
    }
  }, [schedule]);

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
  
  const fetchSchedule = async () => {
    try {
      const res = await api.get('/users/schedule');
      const sortedEvents = (res.data || []).sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
      );
      setSchedule(sortedEvents);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  };
  
  const findNextEvent = (events) => {
    const now = new Date().getTime();
    const upcoming = events.find(event => {
      const startTime = new Date(event.start_time).getTime();
      return startTime > now;
    });
    setNextEvent(upcoming || null);
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
  
  const formatEventTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const formatTimeUntil = (targetDate) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) return 'Starting soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mentor-dashboard-bg">
          <div className="mentor-dashboard glass">
            <LoadingSpinner />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mentor-dashboard-bg">
        <div className="mentor-dashboard glass">
          {/* Header */}
          <div className="mentor-dashboard-header">
            <div className="mentor-dashboard-icon">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#00e0ff33"/>
                <path d="M12 36V20H36V36" stroke="#00e0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="20" y="24" width="8" height="8" rx="2" fill="#00e0ff"/>
              </svg>
            </div>
            <div>
              <div className="mentor-dashboard-title">Mentor Dashboard</div>
              <div className="mentor-dashboard-subtitle">Guide and support your assigned teams throughout the hackathon</div>
            </div>
          </div>

          {/* Stat Widgets */}
          <div className="mentor-dashboard-stats-row">
            <StatWidget label="Teams" value={teams.length} icon="👥" color="#00e0ff" />
            <StatWidget label="Students" value={teams.reduce((sum, t) => sum + (parseInt(t.member_count) || 0), 0)} icon="🎓" color="#7cffb2" />
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
            <Link to="/schedule" className="action-btn">
              <span className="action-icon">📅</span>
              <div>
                <div className="action-title">Event Schedule</div>
                <div className="action-desc">View workshops and check-ins</div>
              </div>
            </Link>
            <Link to="/announcements" className="action-btn">
              <span className="action-icon">📢</span>
              <div>
                <div className="action-title">Announcements</div>
                <div className="action-desc">View coordinator updates</div>
              </div>
            </Link>
          </div>

          {/* Schedule Preview */}
          {nextEvent && (
            <div className="schedule-preview">
              <div className="schedule-preview-header">
                <h3>
                  <span className="schedule-icon">⏰</span>
                  Next Event
                </h3>
                <Link to="/schedule" className="view-full-schedule">
                  View Full Schedule →
                </Link>
              </div>
              <div className="next-event-card">
                <div className="event-main-info">
                  <h4 className="event-name">{nextEvent.event_name}</h4>
                  {nextEvent.description && (
                    <p className="event-description">{nextEvent.description}</p>
                  )}
                </div>
                <div className="event-details-grid">
                  <div className="event-detail-item">
                    <span className="detail-icon">🕒</span>
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{formatEventTime(nextEvent.start_time)}</span>
                  </div>
                  {nextEvent.location && (
                    <div className="event-detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{nextEvent.location}</span>
                    </div>
                  )}
                  <div className="event-detail-item">
                    <span className="detail-icon">⏳</span>
                    <span className="detail-label">Starts:</span>
                    <span className="detail-value countdown">{formatTimeUntil(nextEvent.start_time)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                                {details.submission && (
                                  <Link to={`/mentor/submission/${team.id}`} className="btn-primary">
                                    View Full Submission
                                  </Link>
                                )}
                                <Link to={`/mentor/teams?team=${team.id}`} className="btn-secondary">
                                  View Updates
                                </Link>
                                <Link to={`/mentor/feedback?team=${team.id}`} className="btn-secondary">
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
      </div>
    </AppShell>
  );

  function StatWidget({ label, value, icon, color }) {
    return (
      <div className="mentor-dashboard-stat-widget glass" style={{ borderColor: color }}>
        <div className="stat-icon" style={{ color }}>{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }
}
