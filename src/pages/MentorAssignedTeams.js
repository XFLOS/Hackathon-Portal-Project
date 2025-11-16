import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorAssignedTeams.css";


const MENTOR_EMAIL = "maria@niagaracollegetoronto.com"; 

const mockAssignedTeams = [
    { teamId: "T001", teamName: "The Coders", lead: "Alex J.", project: "AI-Driven Eco-Route", status: "Active" },
    { teamId: "T005", teamName: "The Matters", lead: "Henry K.", project: "Smart Waste Management", status: "Active" },
    { teamId: "T009", teamName: "Innovate+", lead: "Miguel M.", project: "Campus Safety App", status: "Needs Help" },
];

export default function MentorAssignedTeams() {
    const [teams, setTeams] = useState(mockAssignedTeams);
    const [isMentor, setIsMentor] = useState(false);
    const [mentorName, setMentorName] = useState("Mentor Chris");
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;

        if (!user || user.email !== MENTOR_EMAIL) {
            navigate("/mentorlogin"); 
            return;
        }
        setIsMentor(true);
        
    }, [navigate]);

    if (!isMentor) {
        return <div className="mentor-denied">Access Denied: Mentor Login Required.</div>;
    }

    return (
        <div className="mentor-dashboard-container">
            <h1 className="mentor-title">Welcome, {mentorName}!</h1>
            <p className="mentor-subtitle">Your Assigned Teams - Provide guidance and support during the hackathon.</p>

            <div className="teams-list-wrapper">
                {teams.map(team => (
                    <div key={team.teamId} className={`team-card status-${team.status.toLowerCase().replace(' ', '-')}`}>
                        <div className="team-header">
                            <h2 className="team-name">{team.teamName}</h2>
                            <span className="team-status">{team.status}</span>
                        </div>
                        
                        <p className="team-project">**Project:** {team.project}</p>
                        <p className="team-lead">**Leader:** {team.lead}</p>
                        
                        <div className="team-actions">
                            <Link to={`/mentor/updates/${team.teamId}`} className="action-button updates">
                                View Updates (Req 4.0)
                            </Link>
                            <Link to={`/chat/${team.teamId}`} className="action-button chat">
                                Go to Team Chat (Req 2.0)
                            </Link>
                            <Link to={`/mentor/briefing`} className="action-button briefing">
                                View Briefing &rarr;
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}