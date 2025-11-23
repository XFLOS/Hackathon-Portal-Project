import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AppShell from '../components/layout/AppShell';
import './MentorSubmissionView.css';

export default function MentorSubmissionView() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamAndSubmission();
  }, [teamId]);

  const fetchTeamAndSubmission = async () => {
    try {
      const res = await api.get(`/mentor/team/${teamId}`);
      if (res.data) {
        setTeam(res.data);
        setSubmission(res.data.submission);
        
        if (!res.data.submission) {
          setError('This team has not submitted their project yet.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch team submission:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view this team\'s submission.');
      } else {
        setError('Failed to load submission details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('doc') || type.includes('docx')) return '📝';
    return '📄';
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const ext = url.toLowerCase();
    return ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.gif') || ext.endsWith('.webp');
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mentor-submission-view">
          <LoadingSpinner />
        </div>
      </AppShell>
    );
  }

  if (error || !team) {
    return (
      <AppShell>
        <div className="mentor-submission-view">
          <div className="error-container">
            <p className="error-icon">❌</p>
            <p className="error-title">{error || 'Team not found'}</p>
            <button onClick={() => navigate('/mentor-dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!submission) {
    return (
      <AppShell>
        <div className="mentor-submission-view">
          <div className="no-submission-container">
            <p className="empty-icon">📭</p>
            <h2>{team.name}</h2>
            <p className="empty-title">No Submission Yet</p>
            <p className="empty-desc">This team hasn't submitted their project.</p>
            <button onClick={() => navigate('/mentor-dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mentor-submission-view">
        {/* Header */}
        <div className="submission-header">
          <button onClick={() => navigate('/mentor-dashboard')} className="back-link">
            ← Back to Dashboard
          </button>
          <div className="header-content">
            <h1 className="submission-title">{submission.title || 'Untitled Submission'}</h1>
            <div className="team-badge">{team.name}</div>
          </div>
          <div className="submission-meta">
            <span className="meta-item">
              <span className="meta-label">Submitted:</span>
              <span className="meta-value">{formatDate(submission.created_at || submission.submitted_at)}</span>
            </span>
            {submission.file_type && (
              <span className="meta-item">
                <span className="meta-label">File Type:</span>
                <span className="meta-value">{submission.file_type}</span>
              </span>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="submission-content">
          {/* Left Column - Description & Details */}
          <div className="content-main">
            {/* Description */}
            <div className="content-section">
              <h3 className="section-title">Project Description</h3>
              <div className="description-box">
                {submission.description || 'No description provided.'}
              </div>
            </div>

            {/* Uploaded File */}
            {submission.file_url && (
              <div className="content-section">
                <h3 className="section-title">Uploaded File</h3>
                <div className="file-card">
                  <div className="file-icon">{getFileIcon(submission.file_type)}</div>
                  <div className="file-info">
                    <div className="file-name">
                      {submission.file_url.split('/').pop() || 'Project File'}
                    </div>
                    <div className="file-type">{submission.file_type || 'Unknown type'}</div>
                  </div>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download"
                  >
                    📥 Download
                  </a>
                </div>

                {/* Image Preview */}
                {isImageFile(submission.file_url) && (
                  <div className="image-preview">
                    <img src={submission.file_url} alt="Submission preview" />
                  </div>
                )}
              </div>
            )}

            {/* External Links */}
            <div className="content-section">
              <h3 className="section-title">Project Links</h3>
              <div className="links-grid">
                {submission.github_url ? (
                  <a
                    href={submission.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-card github"
                  >
                    <div className="link-icon">🔗</div>
                    <div className="link-content">
                      <div className="link-title">GitHub Repository</div>
                      <div className="link-url">{submission.github_url}</div>
                    </div>
                    <div className="link-arrow">→</div>
                  </a>
                ) : (
                  <div className="link-card disabled">
                    <div className="link-icon">🔗</div>
                    <div className="link-content">
                      <div className="link-title">GitHub Repository</div>
                      <div className="link-url">Not provided</div>
                    </div>
                  </div>
                )}

                {submission.demo_url ? (
                  <a
                    href={submission.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-card demo"
                  >
                    <div className="link-icon">🚀</div>
                    <div className="link-content">
                      <div className="link-title">Live Demo</div>
                      <div className="link-url">{submission.demo_url}</div>
                    </div>
                    <div className="link-arrow">→</div>
                  </a>
                ) : (
                  <div className="link-card disabled">
                    <div className="link-icon">🚀</div>
                    <div className="link-content">
                      <div className="link-title">Live Demo</div>
                      <div className="link-url">Not provided</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Team Info & Actions */}
          <div className="content-sidebar">
            {/* Team Information */}
            <div className="sidebar-card">
              <h4 className="sidebar-title">Team Information</h4>
              <div className="team-info">
                <div className="info-row">
                  <span className="info-label">Team Name:</span>
                  <span className="info-value">{team.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Members:</span>
                  <span className="info-value">{team.members?.length || 0}</span>
                </div>
                {team.project_name && (
                  <div className="info-row">
                    <span className="info-label">Project:</span>
                    <span className="info-value">{team.project_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Members */}
            {team.members && team.members.length > 0 && (
              <div className="sidebar-card">
                <h4 className="sidebar-title">Team Members</h4>
                <div className="members-list-sidebar">
                  {team.members.map((member) => (
                    <div key={member.id} className="member-item-sidebar">
                      <div className="member-name-sidebar">
                        {member.full_name}
                        {member.role === 'leader' && (
                          <span className="leader-tag">Leader</span>
                        )}
                      </div>
                      <a href={`mailto:${member.email}`} className="member-email-sidebar">
                        {member.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Actions */}
            <div className="sidebar-card actions-card">
              <h4 className="sidebar-title">Actions</h4>
              <div className="actions-list">
                <Link to={`/mentor/feedback?team=${teamId}`} className="action-button primary">
                  📝 Give Feedback
                </Link>
                <Link to={`/mentor/teams?team=${teamId}`} className="action-button secondary">
                  💬 View Updates
                </Link>
                <Link to="/mentor-dashboard" className="action-button secondary">
                  🏠 Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
