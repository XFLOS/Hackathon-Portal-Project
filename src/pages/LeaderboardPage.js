import React, { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { getIdToken } from "firebase/auth";
import './LeaderboardPage.css';

const mockLeaderboardData = [
    { teamName: "The Coders", score: 98.5 },
    { teamName: "White Hats", score: 95.0 },
    { teamName: "A Tech on Titans", score: 92.2 },
    { teamName: "Code+", score: 88.9 },
    { teamName: "The testers", score: 85.5 },
];

const COORDINATOR_EMAIL = "maria@niagaracollegetoronto.com"; 

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user || user.email !== COORDINATOR_EMAIL) {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            try {
                const token = await getIdToken(user); 
                setTimeout(() => {
                    setLeaderboard(mockLeaderboardData);
                    setLoading(false);
                }, 500);
            } catch (err) {
                setLeaderboard(mockLeaderboardData);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="leaderboard-loading">Loading Coordinator Leaderboard...</div>;

    if (accessDenied) {
        return (
            <div className="access-denied-container">
                <h1 className="access-denied-title">Access Restricted</h1>
                <p className="access-denied-message">
                    This leaderboard is only for Program Coordinators.
                </p>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <h1 className="leaderboard-title">Coordinator Live Leaderboard</h1>
            <p className="leaderboard-subtitle">Current ranking based on judges' scoring.</p>
            
            <div className="table-wrapper">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((team, idx) => (
                            <tr key={idx} className={idx < 3 ? 'top-team' : ''}>
                                <td>{idx + 1}</td>
                                <td>{team.teamName}</td>
                                <td className="team-score">{team.score.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="leaderboard-footer">Scores update automatically from judges' submissions.</p>
        </div>
    );
}