import React, { useEffect, useState } from 'react';
import { auth, firebaseEnabled } from '../firebase/config';
import { updateProfile as fbUpdateProfile, updatePassword as fbUpdatePassword } from 'firebase/auth';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data) {
        setProfileData(res.data);
        setFullName(res.data.full_name || '');
        setBio(res.data.bio || '');
        setProfileImage(res.data.profile_image || '');
        setAvatarPreview(res.data.profile_image || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage('Failed to load profile data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setMessage('Please select an image first');
      setMessageType('error');
      return;
    }

    setUploadingAvatar(true);
    setMessage('Uploading avatar...');
    setMessageType('');

    try {
      const formData = new FormData();
      formData.append('file', avatarFile);

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.url) {
        setProfileImage(response.data.url);
        setAvatarPreview(response.data.url);
        setMessage('Avatar uploaded successfully!');
        setMessageType('success');
        setAvatarFile(null);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setMessage(err.response?.data?.error || 'Avatar upload failed');
      setMessageType('error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!fullName.trim()) {
      setMessage('Full name is required');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      // Update backend profile
      const payload = {
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        profile_image: profileImage || null
      };

      const res = await api.put('/users/me', payload);
      
      // Update Firebase profile if enabled
      if (firebaseEnabled && auth && auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { 
          displayName: fullName,
          photoURL: profileImage 
        });
      }

      // Update local storage
      const updated = { ...profileData, ...res.data.user };
      setProfileData(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      setMessage('Profile updated successfully!');
      setMessageType('success');

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Save profile failed:', err);
      setMessage(err.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordMessageType('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      setPasswordMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      setPasswordMessageType('error');
      return;
    }

    setChangingPassword(true);

    try {
      if (firebaseEnabled && auth && auth.currentUser) {
        await fbUpdatePassword(auth.currentUser, newPassword);
        setPasswordMessage('Password updated successfully!');
        setPasswordMessageType('success');
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordMessage('Password change is only available for Firebase authentication');
        setPasswordMessageType('error');
      }
    } catch (err) {
      console.error('Password change failed:', err);
      setPasswordMessage(err.message || 'Failed to change password');
      setPasswordMessageType('error');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role?.toLowerCase()) {
      case 'student': return 'role-badge student';
      case 'mentor': return 'role-badge mentor';
      case 'judge': return 'role-badge judge';
      case 'coordinator': return 'role-badge coordinator';
      default: return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <p className="error-message">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        {message && (
          <div className={`alert ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="profile-form">
          {/* Avatar Section */}
          <div className="form-section avatar-section">
            <h3>Profile Picture</h3>
            <div className="avatar-upload-container">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    <span className="avatar-icon">👤</span>
                  </div>
                )}
              </div>
              <div className="avatar-upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="file-input"
                  id="avatar-input"
                />
                <label htmlFor="avatar-input" className="btn-file-label">
                  Choose Image
                </label>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="btn-upload-avatar"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  disabled
                  className="input-field disabled"
                />
                <span className="field-hint">Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <div className="role-display">
                  <span className={getRoleBadgeClass(profileData.role)}>
                    {profileData.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="input-field"
              />
            </div>

            {/* Bio field - optional for all roles, but maybe more important for mentors/judges */}
            <div className="form-group">
              <label htmlFor="bio">
                Bio / About Me {profileData.role !== 'student' && '(Recommended)'}
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  profileData.role === 'student'
                    ? "Tell others about yourself, your interests, and skills..."
                    : "Share your expertise, experience, and what you can help with..."
                }
                rows="5"
                className="textarea-field"
              />
              <span className="field-hint">
                {profileData.role === 'student' 
                  ? 'Optional: Share your background and interests'
                  : 'Help teams know your expertise and availability'}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={saving}
              className="btn-submit"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={fetchProfile}
              className="btn-secondary"
            >
              Reset Changes
            </button>
          </div>
        </form>

        {/* Password Change Section */}
        <div className="form-section password-section">
          <div className="section-header">
            <h3>Security</h3>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-toggle"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="password-form">
              {passwordMessage && (
                <div className={`alert ${passwordMessageType}`}>
                  {passwordMessage}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength="6"
                  className="input-field"
                />
                <span className="field-hint">Minimum 6 characters</span>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                  className="input-field"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn-submit"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Info */}
        <div className="account-info">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Account Created:</span>
              <span className="info-value">
                {new Date(profileData.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value">{profileData.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
