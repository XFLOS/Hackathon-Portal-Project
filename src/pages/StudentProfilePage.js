import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./StudentProfilePage.css";

const mockProfileData = {
  fullName: "Cassia Millnitz",
  email: "kssia.mill@gmail.com",
  college: "Niagara College - Toronto (NCT)",
  collegeId: "N00123456",
  role: "Student",
  teamName: "The Coders",
  hackathonHistory: [
    { year: 2024, position: "Top 10 Finalist", project: "Eco-Route Planner" }
  ],
  achievements: [
    { id: 1, name: "First Timer Badge", description: "Completed registration for the first time." },
    { id: 2, name: "Blueprint Master", description: "Submitted Blueprint on time." },
    { id: 3, name: "Team Leader", description: "Successfully created and led a team." }
  ]
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }
    setProfile(mockProfileData);
  }, [navigate]);

  if (!profile) {
    return <div className="loading-container">Loading Student Profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Student Profile</h1>
      <p className="profile-subtitle">Hackathon History & Achievements</p>

      <section className="section info-section">
        <h3 className="section-title">Personal Details</h3>
        <div className="info-grid">
          <div className="info-item"><strong>Full Name:</strong> {profile.fullName}</div>
          <div className="info-item"><strong>Email:</strong> {profile.email}</div>
          <div className="info-item"><strong>College:</strong> {profile.college}</div>
          <div className="info-item"><strong>Student ID:</strong> {profile.collegeId}</div>
          <div className="info-item"><strong>Current Team:</strong> {profile.teamName}</div>
          <div className="info-item"><strong>Role:</strong> {profile.role}</div>
        </div>
      </section>

      <section className="section achievements-section">
        <h3 className="section-title">Achievements ({profile.achievements.length})</h3>
        <div className="achievements-grid">
          {profile.achievements.map(a => (
            <div key={a.id} className="achievement-card">
              <h4>{a.name}</h4>
              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section history-section">
        <h3 className="section-title">Hackathon History</h3>
        <ul className="history-list">
          {profile.hackathonHistory.length > 0 ? (
            profile.hackathonHistory.map((h, index) => (
              <li key={index} className="history-item">
                <span className="history-year">{h.year}</span>
                <span className="history-project">{h.project}</span>
                <span className="history-position">({h.position})</span>
              </li>
            ))
          ) : (
            <p className="no-history">No past hackathon history found.</p>
          )}
        </ul>
      </section>
    </div>
  );
}