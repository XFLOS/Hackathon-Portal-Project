import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorDashboard.css";

const mockMentorData = {
    mentorName: "Maria Marie",
    assignedTeams: [
        { id: "T001", name: "The Coders", projectStatus: "Working on MVP", lastUpdate: "2h ago", link: "/mentor/team/T001" },
        { id: "T002", name: "White Hats", projectStatus: "Need API help", lastUpdate: "Yesterday", link: "/mentor/team/T002" },
        { id: "T003", name: "A Tech on Titans", projectStatus: "Blueprint submitted", lastUpdate: "Day 1 End", link: "/mentor/team/T003" },
    ],
    briefingMaterials: [
        { name: "Challenge Document 2025", type: "PDF", link: "/files/challenge.pdf" },
        { name: "Judging Criteria", type: "DOCX", link: "/files/criteria.docx" },
    ],
};

export default function MentorDashboard() {
    const [mentorInfo, setMentorInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) navigate("/login");

        setMentorInfo(mockMentorData);
    }, [navigate]);

    const handleQnA = (teamId) => {
        navigate(`/mentor/chat/${teamId}`);
    };

    if (!mentorInfo) return <div className="loading-container">Loading Mentor Dashboard...</div>;

    return (
        <div className="dashboard-container mentor-container">
            <h1 className="dashboard-title">Welcome, {mentorInfo.mentorName}</h1>
            <p className="dashboard-subtitle">Your Hackathon Guide Portal</p>

            <section className="section assigned-teams-section">
                <h3 className="section-title">Assigned Teams ({mentorInfo.assignedTeams.length})</h3>
                <div className="team-list">
                    {mentorInfo.assignedTeams.map((team) => (
                        <div key={team.id} className="team-card">
                            <h4>{team.name}</h4>
                            <p className="team-status">Status: <strong>{team.projectStatus}</strong></p>
                            <p className="team-update">Last Update: {team.lastUpdate}</p>
                            <Link to={team.link} className="btn-link view-link">View Team Details</Link>
                            <button className="btn-action chat-btn" onClick={() => handleQnA(team.id)}>Start Q&A</button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section briefing-section">
                <h3 className="section-title">Briefing Materials</h3>
                <div className="material-list">
                    {mentorInfo.briefingMaterials.map((material, index) => (
                        <div key={index} className="material-item">
                            <span className="material-name">{material.name} ({material.type})</span>
                            <a href={material.link} target="_blank" rel="noopener noreferrer" className="btn-link download-link">Download</a>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}