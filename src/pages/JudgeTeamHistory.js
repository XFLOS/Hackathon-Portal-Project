import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./JudgeTeamHistory.css";

const JUDGE_EMAIL = "hamilton_fuzinato@niagaracollegetoronto.com"; 

const mockTeamHistory = {
    teamName: "The Coders (T001)",
    submissions: [
        { 
            type: "Blueprint Submission", 
            date: "Nov 23, 2025", 
            fileName: "T001_Blueprint_V1.pdf", 
            fileUrl: "/download/blueprint_t001",
            status: "Successful"
        },
        { 
            type: "Final Project Code", 
            date: "Nov 26, 2025", 
            fileName: "T001_Final_Code.zip", 
            fileUrl: "/download/final_code_t001",
            status: "Successful"
        },
        { 
            type: "Final Presentation Slides", 
            date: "Nov 26, 2025", 
            fileName: "T001_Slides.pptx", 
            fileUrl: "/download/slides_t001",
            status: "Successful"
        },
    ],
    comments: [
        { 
            judge: "Judge Maria K.", 
            score: "55/100",
            date: "Nov 26, 2025",
            overallComment: "Strong concept, but the front-end design is very rough and could use polish. Technical execution was sound for the MVP.",
            rubricBreakdown: [
                { criterion: "Innovation", score: 20 },
                { criterion: "Technical", score: 25 },
            ]
        },
        { 
            judge: "Judge Alex B.", 
            score: "62/100",
            date: "Nov 27, 2025",
            overallComment: "Excellent use of the required API. The blueprint was clear, but the team seemed to deviate significantly from the original plan.",
            rubricBreakdown: [
                { criterion: "Innovation", score: 25 },
                { criterion: "Technical", score: 30 },
            ]
        },
    ]
};

export default function JudgeTeamHistory() {
    const { teamId } = useParams();
    const [history, setHistory] = useState(null);
    const [isJudge, setIsJudge] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        
        if (!user || user.email !== JUDGE_EMAIL) {
            navigate("/judgelogin"); 
            return;
        }
        setIsJudge(true);
        
        setHistory(mockTeamHistory);
    }, [navigate, teamId]);

    if (!isJudge || !history) {
        return <div className="history-denied">Loading History or Access Denied...</div>;
    }

    return (
        <div className="history-container">
            <h1 className="history-title">{history.teamName}</h1>
            <p className="history-subtitle">Access all files and past feedback for informed grading decisions.</p>

            <section className="section submission-files">
                <h2 className="section-title">Project Submission Files</h2>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Submission Type</th>
                            <th>File Name</th>
                            <th>Date Uploaded</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.submissions.map((sub, idx) => (
                            <tr key={idx}>
                                <td>{sub.type}</td>
                                <td>{sub.fileName}</td>
                                <td>{sub.date}</td>
                                <td>
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                                        Download &darr;
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="section feedback-section">
                <h2 className="section-title">Judge Feedback</h2>
                
                {history.comments.length > 0 ? (
                    history.comments.map((comment, idx) => (
                        <div key={idx} className="feedback-card">
                            <div className="feedback-header">
                                <span className="judge-name">{comment.judge}</span>
                                <span className="score-date">{comment.score} | {comment.date}</span>
                            </div>
                            <p className="overall-comment"><strong>Overall Comment:</strong> {comment.overallComment}</p>
                            <div className="rubric-breakdown">
                                <strong>Rubric Breakdown:</strong>
                                <ul>
                                    {comment.rubricBreakdown.map((item, i) => (
                                        <li key={i}>{item.criterion}: {item.score} pts</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-feedback">No comments submitted yet for this team.</p>
                )}
            </section>
        </div>
    );
}