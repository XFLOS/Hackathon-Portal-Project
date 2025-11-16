import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorTeamUpdates.css";

const MENTOR_EMAIL = "maria@niagaracollegetoronto.com"; 

const mockTeamUpdates = {
    teamName: "Innovate+ (T009)",
    updates: [
        { 
            id: 3, 
            date: "Nov 26, 2025 - Day 3", 
            content: "Completed core API integration. Moving on to styling and bug fixes.",
            attachment: "screenshot_ui_progress.png",
            visibility: "Mentor & Coordinator"
        },
        { 
            id: 2, 
            date: "Nov 25, 2025 - Day 2", 
            content: "Stuck on authentication flow. Need mentor input.",
            attachment: null,
            visibility: "Mentor Only"
        },
        { 
            id: 1, 
            date: "Nov 24, 2025 - Day 1", 
            content: "Blueprint finalized. Focused on database schema design.",
            attachment: "db_schema_diagram.pdf",
            visibility: "Public"
        },
    ],
};

export default function MentorTeamUpdates() {
    const { teamId } = useParams();
    const [teamUpdates, setTeamUpdates] = useState(null);
    const [isMentor, setIsMentor] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || user.email !== MENTOR_EMAIL) {
            navigate("/mentorlogin"); 
            return;
        }
        setIsMentor(true);
        setTeamUpdates(mockTeamUpdates);
    }, [navigate, teamId]);

    if (!isMentor || !teamUpdates) {
        return <div className="mentor-denied">Loading Team Updates or Access Denied...</div>;
    }

    return (
        <div className="updates-container">
            <h1 className="updates-title">Progress Updates for {teamUpdates.teamName}</h1>
            <p className="updates-subtitle">Review milestones and progress shared by the team.</p>

            <div className="updates-list">
                {teamUpdates.updates.map(update => (
                    <div key={update.id} className="update-card">
                        <div className="update-header">
                            <span className="update-date">{update.date}</span>
                            <span className="update-visibility">{update.visibility}</span>
                        </div>
                        
                        <p className="update-content">{update.content}</p>

                        {update.attachment && (
                            <div className="update-attachment">
                                <a href={`/files/${update.attachment}`} target="_blank" rel="noopener noreferrer">
                                    {update.attachment}
                                </a>
                            </div>
                        )}
                        
                        {update.content.toLowerCase().includes("stuck") && (
                            <div className="mentor-call-to-action">
                                <Link to={`/chat/${teamId}`} className="chat-link-button">
                                    Reply via Team Chat
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <p className="updates-footer">
                Use the Team Chat feature to assist the team when needed.
            </p>
        </div>
    );
}