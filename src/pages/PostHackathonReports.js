import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./PostHackathonReports.css";

const COORDINATOR_EMAIL = "Jonathan@niagaracollegetoronto.com";

const mockAnalytics = {
    totalTeams: 30,
    completionRate: "90%",
    avgFinalScore: 82.5,
    participationByCollege: [
        { college: "Niagara College - Toronto", count: 120 },
        { college: "GUS College B", count: 30 },
    ],
    topTeams: [
        { rank: 1, name: "The Code Whisperers", score: 98.5 },
        { rank: 2, name: "Phoenix Rising", score: 95.0 },
    ],
};

const mockFeedback = {
    averageRating: 4.2,
    surveyCompletion: "75%",
    themes: [
        { theme: "Event Organization", feedback: "Excellent communication, but setup was slow." },
        { theme: "Judging Process", feedback: "Rubrics were clear, but feedback was sometimes inconsistent." },
    ],
};

export default function PostHackathonReports() {
    const [analytics, setAnalytics] = useState(mockAnalytics);
    const [feedbackSummary, setFeedbackSummary] = useState(mockFeedback);
    const [isCoordinator, setIsCoordinator] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || user.email !== COORDINATOR_EMAIL) {
            navigate("/coordinator/dashboard");
            return;
        }
        setIsCoordinator(true);
    }, [navigate]);

    if (!isCoordinator) {
        return <div className="reports-denied">Access Denied: Coordinator Login Required.</div>;
    }

    return (
        <div className="reports-container">
            <h1 className="reports-title">Post-Hackathon Reports & Analytics</h1>
            <p className="reports-subtitle">
                Comprehensive data for future event planning and institutional records.
            </p>

            <section className="section metrics-section">
                <h2 className="section-title">Key Performance Indicators (KPIs)</h2>
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <h3>Total Teams</h3>
                        <p className="kpi-value">{analytics.totalTeams}</p>
                    </div>
                    <div className="kpi-card">
                        <h3>Project Completion Rate</h3>
                        <p className="kpi-value">{analytics.completionRate}</p>
                    </div>
                    <div className="kpi-card">
                        <h3>Average Final Score</h3>
                        <p className="kpi-value">{analytics.avgFinalScore.toFixed(1)}</p>
                    </div>
                    <div className="kpi-card">
                        <h3>Survey Response Rate</h3>
                        <p className="kpi-value">{feedbackSummary.surveyCompletion}</p>
                    </div>
                </div>
            </section>

            <section className="section ranking-section">
                <h2 className="section-title">Final Team Ranking Summary</h2>
                <table className="ranking-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team Name</th>
                            <th>Final Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.topTeams.map(team => (
                            <tr key={team.rank}>
                                <td>{team.rank}</td>
                                <td>{team.name}</td>
                                <td>{team.score.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="section feedback-section">
                <h2 className="section-title">Event Feedback Summary</h2>
                <div className="feedback-cards">
                    <div className="feedback-overall">
                        <h3>Overall Satisfaction Rating</h3>
                        <p className="kpi-value">{feedbackSummary.averageRating} / 5</p>
                    </div>
                    {feedbackSummary.themes.map((theme, index) => (
                        <div key={index} className="feedback-theme-card">
                            <h4>{theme.theme}</h4>
                            <p>{theme.feedback}</p>
                        </div>
                    ))}
                </div>
            </section>

            <p className="reports-footer">
                <a href="/api/reports/download/full" className="download-full-report">
                    Download Full Report (PDF/Excel)
                </a>
            </p>
        </div>
    );
}