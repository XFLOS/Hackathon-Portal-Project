import React, { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import api from "../services/api";
import "./TeamPage.css";

// Simplified version without AppShell wrapper
export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (loggedUser) setUser(loggedUser);

    api.get("/team/me")
      .then((res) => {
        if (res.data) {
          setTeam(res.data);
          setUpdates(res.data.updates || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch team:", err);
      });
  }, []);

  if (!team)
    return (
      <p className="team-message">
        You are not part of a team.
      </p>
    );

  const mentor = team.mentor || { name: "No mentor assigned", email: "" };
  const members =
    team.members ||
    team.memberEmails ||
    [];

  const handleAddUpdate = () => {
    if (!newUpdate.trim()) return;

    setUpdates([...updates, newUpdate]);

    api.post(`/team/${team.id}/update`, { message: newUpdate })
      .catch((err) => console.error("Failed to send update:", err));

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
              members.map((m, i) => <li key={i}>{m}</li>)
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
          <FileUpload teamId={team.id} userId={user?.id} />
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
