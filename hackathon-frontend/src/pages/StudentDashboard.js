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
        const [teamRes, subsRes, scheduleRes] = await Promise.all([
          api.get("/teams/me").catch(() => ({ data: null })),
          api.get("/submission").catch(() => ({ data: [] })),
          api.get("/users/schedule").catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        // ---- TEAM ----
        setTeam(teamRes?.data || null);

        // ---- SUBMISSIONS ----
        const subs = subsRes?.data;
        setSubmissions(
          Array.isArray(subs) ? subs : subs ? [subs] : []
        );

        // ---- DEADLINES & ANNOUNCEMENTS ----
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

        const a = events.filter((e) => e.type === "announcement");

        setAnnouncements(
          a.map((e) => ({
            id: e.id || Math.random(),
            title: e.title || "Announcement",
            body: e.description || "",
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
      <div className="student-dashboard">

        {/* HEADER */}
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p className="dashboard-subtitle">
            Your team status, submissions, deadlines, and announcements.
          </p>
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
                  <p>Leader: {team.creator_name || "Unknown"}</p>
                  <p>Status: Active</p>
                </div>
              ) : (
                <div>
                  <p className="no-team-message">You are not in a team.</p>
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
                  Upload
                </Button>
              }
            >
              {submissions.length > 0 ? (
                <ul className="dashboard-list">
                  {submissions.map((s) => (
                    <li key={s.id}>
                      <strong>{s.filename || "File"}</strong>
                      — {safeDate(s.time || s.createdAt)}
                      — <em>{s.status || "Unknown"}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No submissions yet.</p>
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
                      — {a.body}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No announcements.</p>
              )}
            </Card>

          </div>
        )}
      </div>
    </AppShell>
  );
}
