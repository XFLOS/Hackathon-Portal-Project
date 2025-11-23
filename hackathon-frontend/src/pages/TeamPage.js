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

  // If no team, show the original message
  if (!team) {
    return (
      <div className="team-container">
        <p className="team-message">
          You are not part of a team.
        </p>
      </div>
    );
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
      </div>
    </div>
  );
}