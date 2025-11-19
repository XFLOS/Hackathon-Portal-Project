import React, { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import api from "../services/api";
import "./TeamPage.css";

export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");

  useEffect(() => {
    // Load user from localStorage (same as before)
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const loggedUser = JSON.parse(stored);
        setUser(loggedUser);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }

    // Load team
    api
      .get("/team/me")
      .then(function (res) {
        var t = res.data;
        if (t) {
          setTeam(t);
          if (Array.isArray(t.updates)) {
            setUpdates(t.updates);
          } else {
            setUpdates([]);
          }
        }
      })
      .catch(function (err) {
        console.error("Failed to fetch team:", err);
      });
  }, []);

  function handleAddUpdate() {
    if (!newUpdate || newUpdate.trim() === "") return;
    if (!team) return;

    var message = newUpdate.trim();
    var updatedList = updates.concat(message);
    setUpdates(updatedList);
    setNewUpdate("");

    var teamId = team.id || team._id;
    if (!teamId) return;

    api
      .post("/team/" + teamId + "/update", { message: message })
      .catch(function (err) {
        console.error("Failed to send update:", err);
      });
  }

  function handleLeaveTeam() {
    if (!team || !user) return;

    if (!window.confirm("Are you sure you want to leave the team?")) return;

    var userId = user.id || user._id || user.uid;
    if (!userId) {
      console.error("No user id found for leave team");
      return;
    }

    api
      .delete("/team/member/" + userId)
      .then(function () {
        setTeam(null);
        alert("You have left the team.");
      })
      .catch(function (err) {
        console.error("Failed to leave team:", err);
        alert("Failed to leave team.");
      });
  }

  // If no team, show simple message
  if (!team) {
    return (
      <div className="team-message">
        <p>You are not part of a team.</p>
      </div>
    );
  }

  // Safe members list
  var members =
    team.members ||
    team.memberEmails ||
    team.memberNames ||
    [];
  if (!Array.isArray(members)) {
    members = [];
  }

  var mentor = team.mentor || {};
  var mentorName = mentor.name || "No mentor assigned";
  var mentorEmail = mentor.email || "";

  var teamIdForUpload = team.id || team._id || "";
  var userIdForUpload =
    (user && (user.id || user._id || user.uid)) || "";

  return (
    <div className="team-container">
      <div className="team-card">
        {/* Header */}
        <div className="team-header">
          <h1 className="team-title">{team.name || "Unnamed Team"}</h1>
          <p className="team-description">
            {team.description || "No description available."}
          </p>
        </div>

        {/* Leader */}
        <div className="team-section">
          <h3>Team Leader</h3>
          <p>
            <strong>{team.leader || "N/A"}</strong>
          </p>
        </div>

        {/* Members */}
        <div className="team-section">
          <h3>Team Members</h3>
          <ul className="member-list">
            {members.length === 0 ? (
              <li>No members added.</li>
            ) : (
              members.map(function (m, index) {
                return <li key={index}>{m}</li>;
              })
            )}
          </ul>
        </div>

        {/* Mentor */}
        <div className="team-section">
          <h3>Mentor</h3>
          <p>
            <strong>{mentorName}</strong>
            {mentorEmail && (
              <span>
                {" - "}
                <a href={"mailto:" + mentorEmail} className="mentor-link">
                  {mentorEmail}
                </a>
              </span>
            )}
          </p>
        </div>

        {/* File upload */}
        <div className="team-section">
          <h3>Upload Team Files</h3>
          {teamIdForUpload && userIdForUpload ? (
            <FileUpload teamId={teamIdForUpload} userId={userIdForUpload} />
          ) : (
            <p>File upload not available (missing ids).</p>
          )}
        </div>

        {/* Updates */}
        <div className="team-section">
          <h3>Team Updates</h3>
          <div className="update-input">
            <input
              type="text"
              value={newUpdate}
              onChange={function (e) {
                setNewUpdate(e.target.value);
              }}
              placeholder="Share your progress..."
            />
            <button onClick={handleAddUpdate} className="post-btn">
              Post
            </button>
          </div>

          <ul className="update-list">
            {updates.length === 0 ? (
              <li className="no-updates">No updates yet.</li>
            ) : (
              updates.map(function (u, index) {
                return <li key={index}>{u}</li>;
              })
            )}
          </ul>
        </div>

        {/* Schedule */}
        <div className="team-section">
          <h3>Presentation Schedule</h3>
          <p>{team.presentationTime || "Not scheduled yet."}</p>
        </div>

        {/* Leave team */}
        <div className="team-section">
          <button onClick={handleLeaveTeam} className="leave-team-button">
            Leave Team
          </button>
        </div>
      </div>
    </div>
  );
}
