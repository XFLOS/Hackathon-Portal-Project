import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./JudgeGradingView.css";

const JUDGE_EMAIL = "hamilton_fuzinato@niagaracollegetoronto.com"; 

const mockRubric = [
    { id: 1, criterion: "Innovation & Creativity", maxScore: 30, score: 0, comment: "" },
    { id: 2, criterion: "Technical Execution & Polish", maxScore: 30, score: 0, comment: "" },
    { id: 3, criterion: "Project Blueprint & Planning", maxScore: 20, score: 0, comment: "" },
    { id: 4, criterion: "Presentation & Clarity", maxScore: 20, score: 0, comment: "" },
];

export default function JudgeGradingView() {
    const { teamId } = useParams();
    const [teamName, setTeamName] = useState("");
    const [rubricScores, setRubricScores] = useState(mockRubric);
    const [judgeComment, setJudgeComment] = useState("");
    const [isJudge, setIsJudge] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || user.email !== JUDGE_EMAIL) {
            navigate("/judgelogin");
            return;
        }
        setIsJudge(true);
        setTeamName(`Team ${teamId}`);
    }, [navigate, teamId]);
    
    const totalScore = rubricScores.reduce((sum, item) => sum + parseInt(item.score || 0), 0);
    const maxTotalScore = rubricScores.reduce((sum, item) => sum + item.maxScore, 0);

    const handleScoreChange = (id, value) => {
        const score = Math.max(0, Math.min(value, rubricScores.find(r => r.id === id).maxScore));
        setRubricScores(prev => prev.map(item => item.id === id ? { ...item, score } : item));
    };

    const handleCommentChange = (id, comment) => {
        setRubricScores(prev => prev.map(item => item.id === id ? { ...item, comment } : item));
    };

    const handleSubmitGrade = (e) => {
        e.preventDefault();
        if (totalScore === 0) return alert("Please enter scores before submitting.");
        console.log(`Submitting grades for ${teamName}:`, { totalScore, rubric: rubricScores, overallComment: judgeComment });
        alert(`Grades for ${teamName} submitted! Score: ${totalScore}/${maxTotalScore}. Ranking will update automatically.`);
        navigate("/judge/submissions");
    };

    if (!isJudge) {
        return <div className="judge-denied">Access Denied: Judge Login Required.</div>;
    }

    return (
        <div className="grading-container">
            <h1 className="grading-title">Grading: {teamName}</h1>
            <p className="grading-subtitle">Live Grading System - Enter scores based on the hackathon rubric.</p>

            <form onSubmit={handleSubmitGrade} className="grading-form">
                <section className="section rubric-section">
                    <h3 className="section-title">Rubric Criteria Scores</h3>
                    {rubricScores.map(rubric => (
                        <div key={rubric.id} className="rubric-item">
                            <div className="rubric-header">
                                <h4>{rubric.criterion}</h4>
                                <span className="max-score">Max: {rubric.maxScore}</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                max={rubric.maxScore}
                                value={rubric.score}
                                onChange={(e) => handleScoreChange(rubric.id, parseInt(e.target.value))}
                                className="score-input"
                            />
                            <textarea
                                placeholder="Criterion-specific feedback..."
                                value={rubric.comment}
                                onChange={(e) => handleCommentChange(rubric.id, e.target.value)}
                                rows="2"
                                className="comment-input"
                            />
                        </div>
                    ))}
                </section>

                <section className="section overall-comment-section">
                    <h3 className="section-title">Overall Feedback (Required)</h3>
                    <textarea
                        placeholder="Provide comprehensive, constructive comments and suggestions for the team."
                        value={judgeComment}
                        onChange={(e) => setJudgeComment(e.target.value)}
                        rows="5"
                        className="overall-comment-textarea"
                        required
                    />
                </section>

                <div className="submission-footer">
                    <div className="total-score-box">
                        Total Score: <span>{totalScore} / {maxTotalScore}</span>
                    </div>
                    <button type="submit" className="submit-grade-button">
                        Submit Final Grade & Update Ranking
                    </button>
                </div>
            </form>
        </div>
    );
}