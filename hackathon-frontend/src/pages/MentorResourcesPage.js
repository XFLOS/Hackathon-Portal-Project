import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './MentorResourcesPage.css';

export default function MentorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [file, setFile] = useState(null);

  // Fetch resources and teams
  useEffect(() => {
    fetchResources();
    fetchTeams();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/mentor/resources');
      setResources(response.data.resources || []);
      setError('');
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/mentor/teams');
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = uploadResponse.data.url;

      // Save resource to database
      await api.post('/mentor/resources/upload', {
        title: title.trim(),
        description: description.trim(),
        teamId: selectedTeam || null,
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size
      });

      setSuccess('Resource uploaded successfully!');
      setShowUploadForm(false);
      setTitle('');
      setDescription('');
      setSelectedTeam('');
      setFile(null);
      
      // Refresh resources list
      await fetchResources();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading resource:', err);
      setError(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await api.delete(`/mentor/resources/${id}`);
      setSuccess('Resource deleted successfully');
      await fetchResources();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError(err.response?.data?.error || 'Failed to delete resource');
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
        <div className="resources-page">
          <div className="resources-loading">Loading resources...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="resources-page">
        <div className="resources-header">
          <div className="header-content">
            <h1 className="page-title">📚 My Resources</h1>
            <p className="page-subtitle">Upload and manage files for your teams</p>
          </div>
          <button
            className="upload-button"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '✖ Cancel' : '⬆ Upload Resource'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showUploadForm && (
          <div className="upload-form-container">
            <form className="upload-form" onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., React Best Practices Guide"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this resource..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="team">Share with Team (Optional)</label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="file">File * (Max 10MB)</label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.mp4"
                  required
                />
                {file && (
                  <div className="file-preview">
                    {getFileIcon(file.type)} {file.name} ({formatFileSize(file.size)})
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '🚀 Upload Resource'}
              </button>
            </form>
          </div>
        )}

        <div className="resources-list">
          {resources.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <h3>No resources yet</h3>
              <p>Upload your first resource to help your teams succeed!</p>
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
                      <span className="meta-item">
                        📅 {formatDate(resource.created_at)}
                      </span>
                      {resource.file_size && (
                        <span className="meta-item">
                          💾 {formatFileSize(resource.file_size)}
                        </span>
                      )}
                      {resource.team_name ? (
                        <span className="meta-item team-badge">
                          👥 {resource.team_name}
                        </span>
                      ) : (
                        <span className="meta-item all-teams-badge">
                          🌐 All Teams
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="resource-actions">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button download-button"
                    >
                      ⬇ Download
                    </a>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="action-button delete-button"
                    >
                      🗑️ Delete
                    </button>
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
