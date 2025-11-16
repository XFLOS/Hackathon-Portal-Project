import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./TeamUpdatesPage.css";

const mockTeamUpdates = {
    teamName: "The Coders",
    teamBio: "Building a smart traffic management system using AI.",
    updates: [
        { id: 1, content: "Successfully set up the Node.js backend server and MongoDB connection! Progress: 20%", timestamp: "Nov 7, 10:00 AM", privacy: "Public" },
        { id: 2, content: "Stuck on integrating the Cloudinary file upload component. Need mentor help.", timestamp: "Nov 7, 2:30 PM", privacy: "Mentor Only" },
        { id: 3, content: "Internal file structure review complete. Finalizing presentation slides.", timestamp: "Nov 8, 9:00 AM", privacy: "Private" },
    ],
    logoUrl: "https://placehold.co/80x80/65c5e8/ffffff?text=LOGO"
};

export default function TeamUpdatesPage() {
    const [teamData, setTeamData] = useState(null);
    const [newUpdate, setNewUpdate] = useState("");
    const [privacy, setPrivacy] = useState("Public");
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }
        setTeamData(mockTeamUpdates);
    }, [navigate]);

    const handlePostUpdate = (e) => {
        e.preventDefault();
        if (!newUpdate.trim() && !imageFile) {
            alert("Please enter some text or select a file to post.");
            return;
        }

        const newMockUpdate = {
            id: teamData.updates.length + 1,
            content: newUpdate,
            timestamp: new Date().toLocaleString(),
            privacy: privacy
        };
        setTeamData(prev => ({
            ...prev,
            updates: [newMockUpdate, ...prev.updates]
        }));

        setNewUpdate("");
        setPrivacy("Public");
        setImageFile(null);
        alert("Update posted successfully!");
    };

    if (!teamData) {
        return <div className="loading-container">Loading Team Updates...</div>;
    }

    return (
        <div className="updates-container">
            <header className="team-header">
                <img src={teamData.logoUrl} alt={`${teamData.teamName} Logo`} className="team-logo" />
                <h1 className="updates-title">{teamData.teamName} Updates</h1>
                <p className="team-bio">{teamData.teamBio}</p>
                <Link to="/team-management" className="btn-edit-profile">Edit Team Profile</Link>
            </header>
            
            <section className="section new-update-section">
                <h3 className="section-title">Post New Update</h3>
                <form onSubmit={handlePostUpdate} className="update-form">
                    <textarea
                        placeholder="Share your progress, milestones, or a picture update..."
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        rows="4"
                        className="update-textarea"
                    ></textarea>

                    <div className="form-controls">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setImageFile(e.target.files[0])} 
                            className="file-input"
                        />
                        <select 
                            value={privacy} 
                            onChange={(e) => setPrivacy(e.target.value)}
                            className="privacy-select"
                        >
                            <option value="Public">Public</option>
                            <option value="Mentor Only">Mentor Only</option>
                            <option value="Private">Private</option>
                        </select>
                    </div>

                    <button type="submit" className="post-button">
                        Post Update
                    </button>
                    {imageFile && <p className="file-info">Selected file: {imageFile.name}</p>}
                </form>
            </section>

            <section className="section update-history-section">
                <h3 className="section-title">Update History</h3>
                <div className="updates-list">
                    {teamData.updates.map(update => (
                        <div key={update.id} className={`update-item ${update.privacy.toLowerCase().replace(' ', '-')}`}>
                            <p className="update-content">{update.content}</p>
                            <div className="update-footer">
                                <span className="update-timestamp">{update.timestamp}</span>
                                <span className={`update-privacy tag-${update.privacy.toLowerCase().replace(' ', '-')}`}>{update.privacy}</span>
                            </div>
                        </div>
                    ))}
                    {teamData.updates.length === 0 && <p className="no-updates">No updates yet. Post your first milestone!</p>}
                </div>
            </section>
        </div>
    );
}