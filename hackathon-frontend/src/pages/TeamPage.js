import React, { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload"; // Ensure this component exists and is correctly imported
import api from "../services/api"; // Ensure this service is set up (e.g., Axios instance)
import "./TeamPage.css";

// Simplified version without AppShell wrapper
export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state to prevent blank screen
  const [error, setError] = useState(null); // Added error state for better UX

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (!loggedUser) {
          setError("You must be logged in to view this page.");
          setLoading(false);
          return;
        }
        setUser(loggedUser);

        const res = await api.get("/team/me");
        if (res.data) {
          setTeam(res.data);
          setUpdates(res.data.updates || []);
        } else {
          setError("No team data found.");
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
        setError("Failed to load team data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Show loading spinner or message while fetching
  if (loading) {
    return (
      <div className="team-container">
        <p className="team-message">Loading team data...</p>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
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
      await api.post(`/team/${team.id}/update`, { message: newUpdate });
    } catch (err) {
      console.error("Failed to send update:", err);
      // Revert on error
      setUpdates(updates);
      alert("Failed to post update. Please try again.");
    }

    setNewUpdate("");
  };

  return (
    <div className="team-container">
      <div className="team-card">
        <div className="team-header">
          <h1 className="team-title">{team?.name || "Unnamed Team"}</h1>
          <p className="team-description">
            {team?.description || "No description provided."}
          </p>
        </div>

        <div className="team-section">
          <h3>Team Leader</h3>
          <p><strong>{team?.leader || "N/A"}</strong></p>
        </div>

        <div className="team-section">
          <h3>Team Members</h3>
          <ul className="member-list">
            {members.length === 0 ? (
              <li>No members yet.</li>
            ) : (
              members.map((m, i) => <li key={i}>{typeof m === 'string' ? m : m.name || 'Unknown'}</li>) // Handle object members
            )}
          </ul>
        </div>

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