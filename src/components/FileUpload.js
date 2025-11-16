import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import FileUpload from "../components/FileUpload";
import "./FileUpload.css";

const mockSubmissionHistory = [
    { type: "Blueprint Submission (Day 1)", date: "Nov 23, 2025", status: "Successful", fileName: "Team7_Blueprint_V1.pdf" },
    { type: "Final Project Code (Day 2)", date: "Pending", status: "Awaiting Upload", fileName: "N/A" },
    { type: "Final Presentation Slides (Day 2)", date: "Pending", status: "Awaiting Upload", fileName: "N/A" },
];

const MOCK_TEAM_ID = "T007_CWHISPERERS";
const MOCK_USER_ID = "FIREBASE_UID_12345";

export default function SubmissionPage() {
    const [history, setHistory] = useState(mockSubmissionHistory);
    const [submissionType, setSubmissionType] = useState("Blueprint");
    const [message, setMessage] = useState("");
    const [teamId, setTeamId] = useState(MOCK_TEAM_ID);
    const [userId, setUserId] = useState(MOCK_USER_ID);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }
        setUserId(user.uid);
    }, [navigate]);

    const handleSubmissionSuccess = (fileName) => {
        setMessage(`Success! Your ${submissionType} (${fileName}) was uploaded.`);
        setHistory(prev => {
            const index = prev.findIndex(item => item.type.includes(submissionType) && item.status.includes("Pending"));
            if (index > -1) {
                const updated = [...prev];
                updated[index] = { ...updated[index], date: new Date().toLocaleDateString(), status: "Successful", fileName };
                return updated;
            }
            return prev;
        });
        setTimeout(() => setMessage(""), 5000);
    };

    return (
        <div className="submission-container">
            <h1 className="submission-title">Project Submission Portal</h1>
            <p className="submission-subtitle">Upload your required files (Blueprints & Final Projects).</p>

            {message && <p className="status-message success-message">{message}</p>}

            <section className="section upload-section">
                <h3 className="section-title">New Submission</h3>
                <div className="form-group">
                    <label htmlFor="submissionType">Select Submission Type*</label>
                    <select
                        id="submissionType"
                        value={submissionType}
                        onChange={(e) => setSubmissionType(e.target.value)}
                        className="select-input"
                    >
                        <option value="Blueprint">Blueprint (Day 1)</option>
                        <option value="Final Project Code">Final Project Code (Day 2)</option>
                        <option value="Final Presentation Slides">Final Presentation Slides (Day 2)</option>
                    </select>
                </div>
                <p className="upload-note">
                    File types allowed: PDF, DOCX, PPTX, or ZIP. Max size: 50MB.
                </p>
                <FileUpload 
                    teamId={teamId}
                    userId={userId}
                    submissionType={submissionType}
                    onSuccess={handleSubmissionSuccess}
                />
            </section>

            <section className="section history-section">
                <h3 className="section-title">Submission History</h3>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>File Name</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index}>
                                <td>{item.type}</td>
                                <td>{item.fileName}</td>
                                <td>{item.date}</td>
                                <td className={`status-${item.status.toLowerCase().replace(' ', '-')}`}>
                                    {item.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}