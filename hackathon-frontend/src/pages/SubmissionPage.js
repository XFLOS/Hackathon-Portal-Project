import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SubmissionPage.css';

export default function SubmissionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetchExistingSubmission();
    fetchDeadline();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!deadline) return;

    const updateCountdown = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate - now;

      if (diff <= 0) {
        setIsDeadlinePassed(true);
        setCountdown('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const fetchExistingSubmission = async () => {
    try {
      const res = await api.get('/submission/me');
      if (res.data) {
        setExistingSubmission(res.data);
        setTitle(res.data.title || '');
        setDescription(res.data.description || '');
        setGithubUrl(res.data.github_url || '');
        setDemoUrl(res.data.demo_url || '');
        setFileUrl(res.data.file_url || '');
        setFileType(res.data.file_type || '');
      }
    } catch (err) {
      // No existing submission, that's okay
      console.log('No existing submission found');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeadline = async () => {
    try {
      const res = await api.get('/users/schedule');
      if (res.data && res.data.length > 0) {
        // Find final submission deadline
        const finalSubmissionEvent = res.data.find(
          event => event.title && event.title.toLowerCase().includes('final submission')
        );
        if (finalSubmissionEvent && finalSubmissionEvent.end_time) {
          setDeadline(finalSubmissionEvent.end_time);
        }
      }
    } catch (err) {
      console.error('Failed to fetch deadline:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('Uploading file...');
    setMessageType('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Backend returns response.data.file.url
      if (response.data && response.data.file && response.data.file.url) {
        setFileUrl(response.data.file.url);
        setFileType(response.data.file.format || file.type);
        setMessage('File uploaded successfully!');
        setMessageType('success');
      } else {
        setMessage('Upload succeeded but no file URL returned');
        setMessageType('error');
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setMessage(err.response?.data?.error || 'File upload failed');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const validateUrl = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!title.trim()) {
      setMessage('Title is required');
      setMessageType('error');
      return;
    }

    if (!description.trim()) {
      setMessage('Description is required');
      setMessageType('error');
      return;
    }

    if (githubUrl && !validateUrl(githubUrl)) {
      setMessage('Invalid GitHub URL format');
      setMessageType('error');
      return;
    }

    if (demoUrl && !validateUrl(demoUrl)) {
      setMessage('Invalid Demo URL format');
      setMessageType('error');
      return;
    }

    if (isDeadlinePassed) {
      setMessage('Submission deadline has passed');
      setMessageType('error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        file_url: fileUrl || null,
        file_type: fileType || null
      };

      const res = await api.post('/submission', payload);
      setMessage(existingSubmission ? 'Submission updated successfully!' : 'Submission created successfully!');
      setMessageType('success');
      setExistingSubmission(res.data.submission);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit failed:', err);
      setMessage(err.response?.data?.message || 'Submission failed. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilePreview = () => {
    if (!fileUrl) return null;

    const isImage = fileType && (fileType.includes('image') || fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    const isVideo = fileType && (fileType.includes('video') || fileUrl.match(/\.(mp4|webm|mov)$/i));
    const isPdf = fileType && (fileType.includes('pdf') || fileUrl.endsWith('.pdf'));

    if (isImage) {
      return (
        <div className="file-preview">
          <img 
            src={fileUrl} 
            alt="Uploaded file preview"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="file-preview document"><span class="file-icon">🖼️</span><p>Image preview unavailable</p><a href="' + fileUrl + '" target="_blank" rel="noopener noreferrer">Try opening file directly</a></div>';
            }}
          />
        </div>
      );
    } else if (isVideo) {
      return (
        <div className="file-preview">
          <video controls>
            <source src={fileUrl} type={fileType} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="file-preview document">
          <span className="file-icon">📄</span>
          <div className="file-info">
            <p className="file-name">{fileUrl.split('/').pop() || 'Document'}</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
              View PDF Document →
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-preview document">
          <span className="file-icon">📎</span>
          <div className="file-info">
            <p className="file-name">{fileUrl.split('/').pop() || 'File'}</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
              View Uploaded File →
            </a>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="submission-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading submission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-container">
      <div className="submission-card">
        <div className="submission-header">
          <h1 className="submission-title">
            {existingSubmission ? 'Update Your Submission' : 'Submit Your Project'}
          </h1>
          <p className="submission-subtitle">
            Submit your final hackathon project for evaluation
          </p>
          
          {deadline && (
            <div className={`deadline-banner ${isDeadlinePassed ? 'expired' : ''}`}>
              <span className="deadline-label">
                {isDeadlinePassed ? '⚠️ Deadline Passed' : '⏰ Deadline:'}
              </span>
              <span className="deadline-time">
                {isDeadlinePassed 
                  ? 'Submissions are closed' 
                  : countdown}
              </span>
            </div>
          )}

          {existingSubmission && (
            <div className="submission-status">
              <span className="status-badge">✓ Submitted</span>
              <span className="status-info">
                Last updated: {new Date(existingSubmission.updated_at || existingSubmission.submitted_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {message && (
          <div className={`alert ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-section">
            <h3>Project Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Project Title *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your project title"
                required
                disabled={isDeadlinePassed}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Project Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, its features, and technologies used..."
                required
                disabled={isDeadlinePassed}
                rows="6"
                className="textarea-field"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Project Links</h3>
            
            <div className="form-group">
              <label htmlFor="github">GitHub Repository URL</label>
              <input
                id="github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                disabled={isDeadlinePassed}
                className="input-field"
              />
              <span className="field-hint">Optional: Link to your source code</span>
            </div>

            <div className="form-group">
              <label htmlFor="demo">Demo/Live URL</label>
              <input
                id="demo"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://your-project-demo.com"
                disabled={isDeadlinePassed}
                className="input-field"
              />
              <span className="field-hint">Optional: Link to live demo or video</span>
            </div>
          </div>

          <div className="form-section">
            <h3>Project Files</h3>
            
            <div className="upload-section">
              <div className="form-group">
                <label>Upload Project File</label>
                <div className="file-upload-group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isDeadlinePassed || uploading}
                    className="file-input"
                    accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                  />
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={!file || uploading || isDeadlinePassed}
                    className="btn-upload"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
                <span className="field-hint">
                  Supported: Images, Videos, PDF, Documents, Archives (Max 10MB)
                </span>
              </div>

              {fileUrl && (
                <div className="uploaded-file-section">
                  <h4>Uploaded File:</h4>
                  {getFilePreview()}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting || isDeadlinePassed}
              className="btn-submit"
            >
              {submitting 
                ? 'Submitting...' 
                : existingSubmission 
                  ? 'Update Submission' 
                  : 'Submit Project'}
            </button>
            
            {existingSubmission && (
              <button
                type="button"
                onClick={fetchExistingSubmission}
                className="btn-secondary"
              >
                Reset Form
              </button>
            )}
          </div>
        </form>

        {existingSubmission && (
          <div className="submission-metadata">
            <h3>Submission Details</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Submitted By:</span>
                <span className="metadata-value">{existingSubmission.submitted_by_name || 'N/A'}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Team:</span>
                <span className="metadata-value">{existingSubmission.team_name || 'N/A'}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Submitted At:</span>
                <span className="metadata-value">
                  {new Date(existingSubmission.submitted_at).toLocaleString()}
                </span>
              </div>
              {existingSubmission.updated_at && existingSubmission.updated_at !== existingSubmission.submitted_at && (
                <div className="metadata-item">
                  <span className="metadata-label">Last Updated:</span>
                  <span className="metadata-value">
                    {new Date(existingSubmission.updated_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

