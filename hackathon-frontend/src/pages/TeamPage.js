import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload"; // Ensure this component exists and is correctly imported
import api from "../services/api"; // Ensure this service is set up (e.g., Axios instance)
import "./TeamPage.css";

// Simplified version without AppShell wrapper
export default function TeamPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  
  // Invite member states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Edit project states
  const [editingProject, setEditingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
  // Delete/leave confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Auto-refresh
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchTeamData = useCallback(async () => {
    try {
      const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!loggedUser) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }
      setUser(loggedUser);

      const res = await api.get("/teams/me");
      if (res.data) {
        setTeam(res.data);
        setUpdates(res.data.updates || []);
        setProjectName(res.data.project_name || "");
        setProjectDescription(res.data.project_description || "");
        
        // Check if current user is the leader
        const userMember = res.data.members?.find(m => m.id === loggedUser.id);
        setIsLeader(userMember?.role === 'leader');
      } else {
        setError("No team data found.");
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
      if (err?.response?.status === 404) {
        // User not in a team, redirect to team selection
        navigate('/team-selection');
      } else {
        setError("Failed to load team data. Please try again later.");
      }
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, [navigate]);

  useEffect(() => {
    fetchTeamData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTeamData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTeamData]);

  // Show loading spinner or message while fetching
  if (loading) {
    return (
      <div className="team-container">
        <p className="team-message">Loading team data...</p>
      </div>
    );
  // Show loading spinner or message while fetching
  if (loading) {
    return (
      <div className="team-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }
    return (
      <div className="team-container">
        <p className="team-message error">{error}</p>
      </div>
    );
  }

  // If no team, show create/join UI (merged from TeamSelectionPage)
  if (!team) {
    // --- Begin create/join team logic ---
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [memberEmails, setMemberEmails] = useState(["", "", "", ""]);
    const [message, setMessage] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [joinMessage, setJoinMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation helpers (copied from TeamSelectionPage)
    const validateTeamName = (teamName) => {
      if (!teamName.trim()) return "Team name is required";
      if (teamName.trim().length < 3) return "Team name must be at least 3 characters";
      if (teamName.trim().length > 50) return "Team name must be less than 50 characters";
      const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!validPattern.test(teamName.trim())) return "Team name can only contain letters, numbers, spaces, hyphens, and underscores";
      return null;
    };
    const validateDescription = (desc) => desc.trim().length > 200 ? "Description must be less than 200 characters" : null;
    const validateEmail = (email) => {
      if (!email.trim()) return null;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) return "Invalid email format";
      return null;
    };
    const validateJoinCode = (code) => {
      if (!code.trim()) return "Join code is required";
      if (code.trim().length < 4) return "Join code must be at least 4 characters";
      return null;
    };

    const handleCreateTeam = async () => {
      setMessage(""); setErrors({});
      const nameError = validateTeamName(name);
      if (nameError) { setErrors({ name: nameError }); setMessage(nameError); return; }
      const descError = validateDescription(description);
      if (descError) { setErrors({ description: descError }); setMessage(descError); return; }
      const emailErrors = [];
      memberEmails.forEach((email, idx) => {
        if (email.trim()) {
          const emailError = validateEmail(email);
          if (emailError) emailErrors.push(`Member ${idx + 1}: ${emailError}`);
        }
      });
      if (emailErrors.length > 0) { setMessage(emailErrors.join(", ")); return; }
      let user = null;
      try { user = JSON.parse(localStorage.getItem('user')) || null; } catch (err) { user = null; }
      if (!user) { setMessage('You must be logged in to create a team.'); return; }
      const teamData = {
        name: name.trim(),
        description: description.trim(),
        leaderId: user.uid,
        memberEmails: memberEmails.filter((email) => email.trim() !== ''),
      };
      setCreating(true);
      try {
        const res = await api.post('/teams', teamData);
        if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
        setMessage('Team created successfully! Redirecting...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        const errorMsg = err?.response?.data?.error || err.message || 'Failed to create team. Try again.';
        setMessage(errorMsg);
      } finally { setCreating(false); }
    };
    const handleJoinByCode = async () => {
      setJoinMessage(''); setErrors({});
      const codeError = validateJoinCode(joinCode);
      if (codeError) { setErrors({ joinCode: codeError }); setJoinMessage(codeError); return; }
      setJoining(true);
      try {
        const res = await api.post('/teams/join', { code: joinCode.trim() });
        if (res?.data?.id) localStorage.setItem('teamId', res.data.id);
        setJoinMessage('Joined successfully! Redirecting...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to join team';
        setJoinMessage(msg);
      } finally { setJoining(false); }
    };

    return (
      <div className="team-container">
        <h2>Create Team</h2>
        {message && (
          <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>
        )}
        <input type="text" placeholder="Team Name" value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? 'input-error' : ''} disabled={creating} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={errors.description ? 'input-error' : ''} disabled={creating} />
        {memberEmails.map((email, idx) => (
          <input key={idx} type="email" placeholder={`Member ${idx + 1} Email (Optional)`} value={email} onChange={(e) => { const newMembers = [...memberEmails]; newMembers[idx] = e.target.value; setMemberEmails(newMembers); }} disabled={creating} />
        ))}
        <button onClick={handleCreateTeam} disabled={creating}>{creating ? 'Creating...' : 'Create Team'}</button>
        <div style={{ marginTop: '1rem' }}>
          <h3>Or join an existing team</h3>
          {joinMessage && (
            <p className={`message ${joinMessage.includes('successfully') ? 'success' : 'error'}`}>{joinMessage}</p>
          )}
          <input type="text" placeholder="Enter join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className={errors.joinCode ? 'input-error' : ''} disabled={joining} />
          <button onClick={handleJoinByCode} disabled={joining}>{joining ? 'Joining...' : 'Join Team'}</button>
        </div>
        <a href="/" className="back-link">Back to Home</a>
      </div>
    );
    // --- End create/join team logic ---
  }

  const mentor = team.mentor || { name: "No mentor assigned", email: "" };
  const members = team.members || team.memberEmails || [];

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    // Optimistically update UI
    const updatedUpdates = [...updates, newUpdate];
    setUpdates(updatedUpdates);

    try {
      await api.post(`/teams/${team.id}/update`, { message: newUpdate });
    } catch (err) {
      console.error("Failed to send update:", err);
      // Revert on error
      setUpdates(updates);
      alert("Failed to post update. Please try again.");
    }

    setNewUpdate("");
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setInviteMessage("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    setInviteMessage("");

    try {
      await api.post(`/teams/${team.id}/members`, { email: inviteEmail.trim() });
      setInviteMessage("Member invited successfully!");
      setInviteEmail("");
      
      // Refresh team data to show new member
      setTimeout(() => {
        fetchTeamData();
        setInviteMessage("");
      }, 2000);
    } catch (err) {
      console.error("Failed to invite member:", err);
      const errorMsg = err?.response?.data?.message || "Failed to invite member";
      setInviteMessage(errorMsg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!projectName.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await api.put(`/teams/${team.id}`, {
        project_name: projectName.trim(),
        project_description: projectDescription.trim()
      });
      
      setEditingProject(false);
      fetchTeamData(); // Refresh to show updated data
      alert("Project details updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      alert(err?.response?.data?.message || "Failed to update project details");
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await api.post('/teams/leave');
      alert("Successfully left the team");
      localStorage.removeItem('teamId');
      navigate('/team-selection');
    } catch (err) {
      console.error("Failed to leave team:", err);
      alert(err?.response?.data?.message || "Failed to leave team");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${team.id}`);
      alert("Team deleted successfully");
      localStorage.removeItem('teamId');
      navigate('/team-selection');
    } catch (err) {
      console.error("Failed to delete team:", err);
      alert(err?.response?.data?.message || "Failed to delete team");
    }
  };

  const confirmAndExecute = (action) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = () => {
    setShowConfirmModal(false);
    if (confirmAction) {
      confirmAction();
    }
    setConfirmAction(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="team-container">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure?</h3>
            <p>
              {isLeader 
                ? "This will delete the team for all members. This action cannot be undone." 
                : "You will be removed from this team."}
            </p>
            <div className="modal-actions">
              <button onClick={executeConfirmedAction} className="btn-danger">
                Yes, {isLeader ? 'Delete' : 'Leave'}
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="team-card">
        <div className="team-header">
          <div className="header-content">
            <h1 className="team-title">{team?.name || "Unnamed Team"}</h1>
            <p className="team-description">
              {team?.description || "No description provided."}
            </p>
            <div className="team-meta">
              <span className="meta-item">
                👥 {members.length} {members.length === 1 ? 'Member' : 'Members'}
              </span>
              <span className="meta-item">
                📅 Created {formatDate(team?.created_at)}
              </span>
              <button 
                onClick={fetchTeamData} 
                className="refresh-btn"
                title="Refresh team data"
              >
                🔄
              </button>
            </div>
          </div>
          <div className="header-actions">
            {isLeader ? (
              <button 
                onClick={() => confirmAndExecute(handleDeleteTeam)} 
                className="btn-danger"
              >
                Delete Team
              </button>
            ) : (
              <button 
                onClick={() => confirmAndExecute(handleLeaveTeam)} 
                className="btn-warning"
              >
                Leave Team
              </button>
            )}
          </div>
        </div>

        {/* Project Details Section */}
        <div className="team-section project-section">
          <div className="section-header">
            <h3>Project Details</h3>
            {isLeader && (
              <button 
                onClick={() => setEditingProject(!editingProject)} 
                className="btn-edit"
              >
                {editingProject ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
          
          {editingProject ? (
            <div className="edit-form">
              <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input-field"
              />
              <textarea
                placeholder="Project Description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="textarea-field"
                rows="4"
              />
              <button onClick={handleUpdateProject} className="btn-primary">
                Save Changes
              </button>
            </div>
          ) : (
            <div className="project-info">
              <p className="project-name">
                <strong>{projectName || "No project name set"}</strong>
              </p>
              <p className="project-desc">
                {projectDescription || "No project description yet."}
              </p>
            </div>
          )}
        </div>

        <div className="team-section">
          <h3>Team Leader</h3>
          <div className="leader-badge">
            <span className="role-badge leader">👑 Leader</span>
            <strong>{team?.creator_name || "N/A"}</strong>
          </div>
        </div>

        <div className="team-section">
          <h3>Team Members</h3>
          <ul className="member-list">
            {members.length === 0 ? (
              <li className="no-members">No members yet.</li>
            ) : (
              members.map((m, i) => (
                <li key={i} className="member-item">
                  <div className="member-info">
                    <span className={`role-badge ${m.role}`}>
                      {m.role === 'leader' ? '👑' : '👤'} {m.role || 'member'}
                    </span>
                    <strong>{m.full_name || m.name || 'Unknown'}</strong>
                    {m.email && <span className="member-email">{m.email}</span>}
                  </div>
                  {m.joined_at && (
                    <span className="join-date">Joined {formatDate(m.joined_at)}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Invite Members Section (Leader Only) */}
        {isLeader && (
          <div className="team-section invite-section">
            <h3>Invite Member</h3>
            {inviteMessage && (
              <p className={`invite-message ${inviteMessage.includes('success') ? 'success' : 'error'}`}>
                {inviteMessage}
              </p>
            )}
            <div className="invite-form">
              <input
                type="email"
                placeholder="Enter member's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-field"
                disabled={inviteLoading}
              />
              <button 
                onClick={handleInviteMember} 
                className="btn-primary"
                disabled={inviteLoading || members.length >= 5}
              >
                {inviteLoading ? 'Inviting...' : 'Invite'}
              </button>
            </div>
            {members.length >= 5 && (
              <p className="team-full-warning">⚠️ Team is full (max 5 members)</p>
            )}
          </div>
        )}

        <div className="team-section">
          <h3>Mentor</h3>
          <p>
            <strong>{mentor.name}</strong>
            {mentor.email && (
              <>
                {" - "}
                <a href={`mailto:${mentor.email}`} className="mentor-link">
                  {mentor.email}
                </a>
              </>
            )}
          </p>
        </div>

        <div className="team-section">
          <h3>Upload Team Files</h3>
          {team.id && user?.id ? (
            <FileUpload teamId={team.id} userId={user.id} />
          ) : (
            <p className="error">Unable to load file upload.</p>
          )}
        </div>

        <div className="team-section">
          <h3>Team Updates</h3>
          <div className="update-input">
            <input
              type="text"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Share your progress..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddUpdate()}
            />
            <button onClick={handleAddUpdate} className="post-btn">
              Post
            </button>
          </div>
          <ul className="update-list">
            {updates.length === 0 ? (
              <p className="no-updates">No updates yet.</p>
            ) : (
              updates.map((u, i) => <li key={i}>{u}</li>)
            )}
          </ul>
        </div>

        <div className="team-section">
          <h3>Presentation Schedule</h3>
          <p>{team?.presentationTime || "No schedule assigned"}</p>
        </div>
        <div className="team-section">
          <h3>Debug Info</h3>
          <p style={{fontSize:'12px', opacity:0.8}}>API Base: {api?.defaults?.baseURL || 'N/A'} | Token: {localStorage.getItem('token') ? 'present' : 'none'}</p>
        </div>
      </div>
    </div>
  );
}