import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./StudentDashboard.css";

const mockStudentData = {
  userName: "Cassia Millnitz",
  teamName: "The Coders",
  teamId: "T007",
  isTeamLeader: true,
  mentorName: "Dr. Maria Marie",
  nextDeadline: "Blueprint Submission",
  deadlineTime: "Day 1 - 5:00 PM EST",
  submissionStatus: {
    blueprint: "Submitted",
    finalProject: "Pending",
  },
  achievementsCount: 2,
};

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }
    setStudentInfo(mockStudentData);
  }, [navigate]);

  if (!studentInfo) {
    return <div className="loading-container">Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome back, {studentInfo.userName}</h1>
      <p className="dashboard-subtitle">Your Hackathon Command Center</p>

      <section className="section deadline-section">
        <h3 className="section-title">Next Critical Deadline</h3>
        <div className="deadline-card">
          <p className="deadline-label">{studentInfo.nextDeadline}</p>
          <p className="deadline-time">{studentInfo.deadlineTime}</p>
          <p className="deadline-tip">
            Use the <Link to="/submission" className="inline-link">Submission Portal</Link>.
          </p>
        </div>
      </section>

      <section className="section team-overview-section">
        <h3 className="section-title">Team Overview: {studentInfo.teamName}</h3>
        <div className="team-grid">
          <div className="team-item">
            <p className="box-label">Role:</p>
            <p className="box-value">{studentInfo.isTeamLeader ? "Team Leader" : "Team Member"}</p>
            {studentInfo.isTeamLeader && <Link to="/team-management" className="btn-small">Manage Team</Link>}
          </div>
          <div className="team-item">
            <p className="box-label">Mentor:</p>
            <p className="box-value">{studentInfo.mentorName}</p>
            <Link to="/mentor-chat" className="btn-small">Start Q&A</Link>
          </div>
          <div className="team-item">
            <p className="box-label">Blueprint Status:</p>
            <p className="box-value">{studentInfo.submissionStatus.blueprint}</p>
            <Link to="/submission" className="btn-small">Submission Portal</Link>
          </div>
        </div>
      </section>

      <section className="section quick-links-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-links-grid">
          <Link to="/team-workspace" className="quick-link">Team Workspace</Link>
          <Link to="/team-updates" className="quick-link">Post Team Updates</Link>
          <Link to="/student-profile" className="quick-link">My Profile ({studentInfo.achievementsCount} Badges)</Link>
          <Link to="/presentation-schedule" className="quick-link">Presentation Schedule</Link>
        </div>
      </section>
    </div>
  );
}