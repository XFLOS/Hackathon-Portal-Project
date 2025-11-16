import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./TeamSelectionPage.css";

const auth = getAuth();
const MOCK_INVITE = { teamId: 'T005', teamName: 'Code+', leaderName: 'Joe Jonas' };

export default function TeamFormationPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('select');
    const [joinCode, setJoinCode] = useState('');
    const [pendingInvite, setPendingInvite] = useState(MOCK_INVITE);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [memberEmails, setMemberEmails] = useState(["", "", ""]);
    
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setMessage("");
        if (!joinCode.trim()) {
            setMessage("Please enter a Team ID or Invite Code.");
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setMessage("Success! Join request sent to the Team Leader for approval.");
        setJoinCode('');
    };

    const handleAcceptInvite = async () => {
        setMessage("");
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage(`Welcome to ${pendingInvite.teamName}! Redirecting to your team page.`);
        setPendingInvite(null);
        setTimeout(() => navigate('/student/team'), 1000);
        setIsLoading(false);
    };

    if (viewMode === 'select') {
        return (
            <div className="formation-container">
                <div className="select-card">
                    <h2 className="formation-title">Hackathon Team Status</h2>
                    <p className="formation-subtitle">Choose how you wish to participate.</p>
                    {pendingInvite && (
                        <div className="invite-alert">
                            You have a pending invitation to join {pendingInvite.teamName}!
                            <button onClick={() => setViewMode('join')} className="join-button">
                                Review Invitation
                            </button>
                        </div>
                    )}
                    <div className="select-options">
                        <button onClick={() => setViewMode('create')} className="create-button">
                            Start a New Team (Become Team Leader)
                        </button>
                        <button onClick={() => setViewMode('join')} className="join-button">
                            Join an Existing Team
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'create') {
        return (
            <div className="formation-container">
                <div className="creation-card">
                    <h2 className="creation-title">Create Your Team</h2>
                    <p className="creation-subtitle">You will be the team leader. Add up to 4 teammates below.</p>
                    <button onClick={() => setViewMode('select')} className="back-link">
                        Back to Options
                    </button>
                </div>
            </div>
        );
    }

    if (viewMode === 'join') {
        return (
            <div className="formation-container">
                <div className="join-card">
                    <h2 className="join-title">Join a Team</h2>
                    <p className="join-subtitle">Accept an invite or search using a team code.</p>
                    {pendingInvite && (
                        <div className="invite-card">
                            <h3>Invitation: {pendingInvite.teamName}</h3>
                            <p>Invited by {pendingInvite.leaderName}.</p>
                            <div className="invite-actions">
                                <button onClick={handleAcceptInvite} className="accept-button" disabled={isLoading}>
                                    Accept Invitation
                                </button>
                                <button onClick={() => setPendingInvite(null)} className="decline-button" disabled={isLoading}>
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleJoinTeam} className="joining-form">
                        <h3>Join by Code</h3>
                        <div className="form-group">
                            <label htmlFor="joinCode">Team ID or Invite Code</label>
                            <input
                                id="joinCode"
                                type="text"
                                placeholder="Enter the code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="joining-input"
                                required
                            />
                        </div>
                        <button type="submit" className="join-button" disabled={isLoading}>
                            {isLoading ? 'Sending Request...' : 'Send Join Request'}
                        </button>
                    </form>
                    <button onClick={() => setViewMode('select')} className="back-link">
                        Back to Options
                    </button>
                </div>
            </div>
        );
    }
}
