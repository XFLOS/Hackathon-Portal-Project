import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorBriefingView.css";

const MENTOR_EMAIL = "mentor@example.com"; 

const mockBriefingMaterials = [
    { title: "Official Hackathon Challenge Document", description: "The core problem statement and scope.", link: "/files/challenge.pdf", date: "Nov 23, 2025" },
    { title: "Judging Rubric Summary", description: "High-level overview of scoring criteria.", link: "/files/rubric.pdf", date: "Nov 24, 2025" },
    { title: "Mentor Guidelines & FAQ", description: "Best practices for interacting with teams.", link: "/files/guide.pdf", date: "Nov 20, 2025" },
];

export default function MentorBriefingView() {
    const [materials, setMaterials] = useState(mockBriefingMaterials);
    const [isMentor, setIsMentor] = useState(false);
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
        <div className="briefing-container">
            <h1 className="briefing-title">Briefing Materials</h1>
            <p className="briefing-subtitle">Essential documents to guide your teams effectively (Req 2.0).</p>

            <div className="materials-list">
                {materials.map((material, index) => (
                    <div key={index} className="material-card">
                        <div className="material-icon">📘</div>
                        <div className="material-details">
                            <h3>{material.title}</h3>
                            <p>{material.description}</p>
                            <span className="material-date">Published: {material.date}</span>
                        </div>
                        <a 
                            href={material.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="download-link-button"
                        >
                            View / Download
                        </a>
                    </div>
                ))}
            </div>
            
            <p className="briefing-footer">
                Please review all materials before interacting with your assigned teams.
            </p>
        </div>
    );
}