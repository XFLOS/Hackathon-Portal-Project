import React, { useState, useEffect } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AppShell from "../components/layout/AppShell";
import "./StudentDashboard.css";

// Safe date helper
function safeDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [team, setTeam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // ================================
  // Load Dashboard Data
  // ================================

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [teamRes, subsRes, scheduleRes, announcementsRes] = await Promise.all([
          api.get("/teams/me").catch(() => ({ data: null })),
          api.get("/submission/me").catch(() => ({ data: [] })),
          api.get("/users/schedule").catch(() => ({ data: [] })),
          api.get("/users/announcements").catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        // ---- TEAM ----
        setTeam(teamRes?.data || null);

        // ---- SUBMISSIONS ----
        const subs = subsRes?.data;
        setSubmissions(
          Array.isArray(subs) ? subs : subs ? [subs] : []
        );

        // ---- DEADLINES (from schedule) ----
        const events = scheduleRes?.data || [];

        const d = events.filter((e) =>
          (e.type === "deadline") ||
          (e.title?.toLowerCase().includes("deadline"))
        );

        setDeadlines(
          d.map((e) => ({
            id: e.id || Math.random(),
            title: e.title || "Deadline",
            due: e.time || null,
          }))
        );

        // ---- ANNOUNCEMENTS (from announcements endpoint) ----
        const announcements = announcementsRes?.data || [];
        setAnnouncements(
          announcements.map((a) => ({
            id: a.id || Math.random(),
            title: a.title || "Announcement",
            body: a.message || a.description || a.body || "",
            created_at: a.created_at || a.time || null,
          }))
        );

      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Failed to load dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => { mounted = false; };
  }, []);

  // ================================
  // Render
  // ================================

  return (
    <AppShell>
      <div className="student-dashboard-bg">
        <div className="student-dashboard glass">
          <div className="student-dashboard-header">
            <div className="student-dashboard-icon">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#00e0ff33"/>
                <path d="M12 20L24 12L36 20" stroke="#00e0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="16" y="24" width="16" height="10" rx="2" fill="#00e0ff"/>
              </svg>
            </div>
            <div>
              <div className="student-dashboard-title">Student Dashboard</div>
              <div className="student-dashboard-subtitle">Your team status, submissions, deadlines, and announcements.</div>
            </div>
          </div>
          {loading && (
            <div className="dashboard-loading">
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <div className="dashboard-alert">
              <strong>⚠️ Warning:</strong> {error}
            </div>
          )}
          {!loading && (
            <>
              <div className="student-dashboard-stats-row">
                <StatWidget label="Team" value={team ? (team.name || "Yes") : "No"} icon="👥" color="#00e0ff" />
                <StatWidget label="Submissions" value={submissions.length} icon="📄" color="#ffb300" />
                <StatWidget label="Deadlines" value={deadlines.length} icon="⏰" color="#7cffb2" />
                <StatWidget label="Announcements" value={announcements.length} icon="📢" color="#ff5e5e" />
              </div>
              <div className="dashboard-grid">
                {/* TEAM CARD */}
                <Card
                  title="Team"
                  subtitle={
                    team
                      ? `${team.name || "Team"} · ${team.members?.length || 0} members`
                      : null
                  }
                  actions={
                    team && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (window.location.href = "/team")}
                      >
                        View Team
                      </Button>
                    )
                  }
                >
                  {team ? (
                    <div className="team-info">
                      <div className="team-detail">
                        <strong>Team Leader:</strong> {team.creator_name || "Unknown"}
                      </div>
                      <div className="team-detail">
                        <strong>Status:</strong> <span className="status-active">Active</span>
                      </div>
                      {team.project_name && (
                        <div className="team-detail">
                          <strong>Project:</strong> {team.project_name}
                        </div>
                      )}
                      {team.mentor_name || (team.mentor && team.mentor.name) ? (
                        <div className="team-detail">
                          <strong>Mentor:</strong> {team.mentor_name || team.mentor?.name}
                        </div>
                      ) : (
                        <div className="team-detail mentor-unassigned">
                          <strong>Mentor:</strong> Not assigned yet
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="no-team-message">You are not in a team yet.</p>
                      <div className="team-actions">
                        <Button
                          variant="primary"
                          onClick={() => (window.location.href = "/team-selection")}
                        >
                          Create Team
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => (window.location.href = "/team-selection")}
                        >
                          Join Team
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
                {/* SUBMISSIONS */}
                <Card
                  title="Submissions"
                  subtitle="Track your project uploads"
                  actions={
                    <Button size="sm" onClick={() => window.location.href = "/submission"}>
                      New Submission
                    </Button>
                  }
                >
                  {submissions.length > 0 ? (
                    <ul className="dashboard-list">
                      {submissions.map((s) => (
                        <li key={s.id} className="submission-item">
                          <div className="submission-header">
                            <strong>{s.title || s.project_name || s.filename || "Project Submission"}</strong>
                            <span className={`submission-status status-${(s.status || "pending").toLowerCase()}`}>
                              {s.status || "Pending"}
                            </span>
                          </div>
                          {s.description && (
                            <p className="submission-description">{s.description}</p>
                          )}
                          <div className="submission-meta">
                            Submitted: {safeDate(s.submitted_at || s.created_at || s.time)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state-with-action">
                      <p>No submissions yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = "/submission"}
                      >
                        Submit Your Project
                      </Button>
                    </div>
                  )}
                </Card>
                {/* DEADLINES */}
                <Card
                  title="Deadlines"
                  subtitle="Upcoming milestones"
                >
                  {deadlines.length > 0 ? (
                    <ul className="dashboard-list">
                      {deadlines.map((d) => (
                        <li key={d.id}>
                          {d.title} — due {safeDate(d.due)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No upcoming deadlines.</p>
                  )}
                </Card>
                {/* ANNOUNCEMENTS */}
                <Card
                  title="Announcements"
                  subtitle="Latest updates"
                >
                  {announcements.length > 0 ? (
                    <ul className="dashboard-list">
                      {announcements.map((a) => (
                        <li key={a.id}>
                          <strong>{a.title}</strong>
                          {a.body && <> — {a.body}</>}
                          {a.created_at && (
                            <div className="announcement-date">
                              {safeDate(a.created_at)}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No announcements.</p>
                  )}
                </Card>
                {/* LEADERBOARD LINK */}
                <Card
                  title="Leaderboard"
                  subtitle="View team rankings"
                  actions={
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => window.location.href = "/leaderboard"}
                    >
                      View Leaderboard
                    </Button>
                  }
                >
                  <p className="info-text">
                    Check where your team ranks among all participating teams. 
                    Track scores and competition progress.
                  </p>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );

  function StatWidget({ label, value, icon, color }) {
    return (
      <div className="student-dashboard-stat-widget glass" style={{ borderColor: color }}>
        <div className="stat-icon" style={{ color }}>{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }
}
