import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './StudentResourcesPage.css';

export default function StudentResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/mentor/resources/student');
      setResources(response.data.resources || []);
      setError('');
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📘';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📗';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="student-resources-page">
          <div className="resources-loading">Loading resources...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="student-resources-page">
        <div className="resources-header">
          <div className="header-content">
            <h1 className="page-title">📚 Mentor Resources</h1>
            <p className="page-subtitle">Access files and materials shared by your mentors</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="resources-list">
          {resources.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <h3>No resources available yet</h3>
              <p>Your mentors haven't uploaded any resources. Check back later!</p>
            </div>
          ) : (
            <div className="resources-grid">
              {resources.map((resource) => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-icon">
                    {getFileIcon(resource.file_type)}
                  </div>
                  <div className="resource-details">
                    <h3 className="resource-title">{resource.title}</h3>
                    {resource.description && (
                      <p className="resource-description">{resource.description}</p>
                    )}
                    <div className="resource-meta">
                      <span className="meta-item mentor-name">
                        👤 {resource.mentor_name || 'Mentor'}
                      </span>
                      <span className="meta-item">
                        📅 {formatDate(resource.created_at)}
                      </span>
                      {resource.file_size && (
                        <span className="meta-item">
                          💾 {formatFileSize(resource.file_size)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="resource-actions">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      ⬇ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
