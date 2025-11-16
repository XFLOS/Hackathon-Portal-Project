import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./JudgeDashboard.css";

const mockJudgeData = {
    judgeName: "Professor Hamilton Fuzinato",
    teamsToGrade: [
        { id: "T004", name: "A Tech on Titans", latestSubmission: "Blueprint", status: "Ready for Blueprint Review", link: "/judge/submissions/T004" },
        { id: "T005", name: "Code+", latestSubmission: "Final Project", status: "Ready for Final Review", link: "/judge/submissions/T005" },
        { id: "T006", name: "The testers", latestSubmission: "None", status: "No Submissions Yet", link: "/judge/submissions/T006" },
    ],
    presentationSchedule: [
        { time: "10:00 AM", team: "A Tech on Titans", room: "M101" },
        { time: "10:30 AM", team: "Code+", room: "M101" },
        { time: "11:00 AM", team: "The testers", room: "M102" },
    ],
};

export default function JudgeDashboard() {
    const [judgeInfo, setJudgeInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }
        setJudgeInfo(mockJudgeData);
    }, [navigate]);

    if (!judgeInfo) {
        return <div className="loading-container">Loading Judge Dashboard...</div>;
    }

    return (
        <div className="dashboard-container judge-container">
            <h1 className="dashboard-title">Judge Portal, {judgeInfo.judgeName}</h1>
            <p className="dashboard-subtitle">Manage team submissions and live grading.</p>

            <section className="section grading-action-section">
                <h3 className="section-title">Grading Action Center</h3>
                <Link to="/judge/submissions" className="cta-btn primary-btn">
                    Access Live Grading System &rarr;
                </Link>
                <p className="grading-note">Use the Live Grading System to enter scores, comments, and calculate final rankings based on the predefined rubrics.</p>
            </section>

            <section className="section teams-review-section">
                <h3 className="section-title">Teams Awaiting Review</h3>
                <div className="review-list">
                    {judgeInfo.teamsToGrade.map((team) => (
                        <div key={team.id} className={`review-card ${team.latestSubmission ? 'submitted' : 'pending'}`}>
                            <h4>{team.name}</h4>
                            <p><strong>Latest Submission:</strong> {team.latestSubmission || 'N/A'}</p>
                            <p className="status-text">Status: {team.status}</p>
                            <Link to={team.link} className="btn-link view-submission-link">View All Submissions</Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section schedule-section">
                <h3 className="section-title">Day 2 Presentation Schedule</h3>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Team Name</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {judgeInfo.presentationSchedule.map((item, index) => (
                            <tr key={index}>
                                <td>{item.time}</td>
                                <td>{item.team}</td>
                                <td>{item.room}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="schedule-note">This schedule is generated automatically but can be adjusted by Coordinators.</p>
            </section>
        </div>
    );
}