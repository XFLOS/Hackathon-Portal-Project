import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorProfilePage.css";

const MENTOR_EMAIL = "maria@niagaracollegetoronto.com"; 

const mockMentorProfile = {
    name: "Maria Marie",
    email: MENTOR_EMAIL,
    expertise: "Full-Stack Development, Node.js, Cloud Architecture",
    company: "TechNexus Solutions",
    bio: "Passionate about mentoring the next generation of developers. I specialize in scaling applications and optimizing backend performance.",
    availability: "10:00 AM - 4:00 PM EST (Days 2 & 3)",
};

export default function MentorProfilePage() {
    const [profile, setProfile] = useState(mockMentorProfile);
    const [isMentor, setIsMentor] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;

        if (!user || user.email !== MENTOR_EMAIL) {
            navigate("/mentorlogin"); 
            return;
        }
        setIsMentor(true);
        
    }, [navigate]);

    const handleSave = (e) => {
        e.preventDefault();

        console.log("Saving mentor profile:", profile);
        alert("Profile updated successfully!");
        setEditMode(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    if (!isMentor) {
        return <div className="mentor-denied">Access Denied: Mentor Login Required.</div>;
    }

    return (
        <div className="mentor-profile-container">
            <h1 className="profile-title">Mentor Profile</h1>
            <p className="profile-subtitle">View and update your professional details (Req 2.0).</p>

            <form onSubmit={handleSave} className="profile-form">
                <div className="profile-details-grid">
                    <div className="profile-field">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            readOnly={!editMode}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Email</label>
                        <input type="email" value={profile.email} readOnly />
                    </div>
                    <div className="profile-field">
                        <label>Company</label>
                        <input
                            type="text"
                            name="company"
                            value={profile.company}
                            onChange={handleChange}
                            readOnly={!editMode}
                        />
                    </div>
                    <div className="profile-field full-width">
                        <label>Expertise / Specialization</label>
                        <input
                            type="text"
                            name="expertise"
                            value={profile.expertise}
                            onChange={handleChange}
                            readOnly={!editMode}
                        />
                    </div>
                    <div className="profile-field full-width">
                        <label>Bio / Introduction</label>
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows="4"
                            readOnly={!editMode}
                        />
                    </div>
                    <div className="profile-field full-width">
                        <label>Availability During Hackathon</label>
                        <input
                            type="text"
                            name="availability"
                            value={profile.availability}
                            onChange={handleChange}
                            readOnly={!editMode}
                        />
                    </div>
                </div>

                <div className="profile-actions">
                    <button type="button" onClick={() => setEditMode(!editMode)} className="edit-toggle-button">
                        {editMode ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    {editMode && (
                        <button type="submit" className="save-button">
                            Save Changes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}