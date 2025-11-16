import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import "./JudgeSubmissionsList.css";

const JUDGE_EMAIL = "hamilton_fuzinato@niagaracollegetoronto.com"; 

const mockAssignedTeams = [
  { teamId: "T001", teamName: "The Coders", blueprintStatus: "Submitted", finalProjectStatus: "Submitted", score: "78/100" },
  { teamId: "T002", teamName: "White Hats", blueprintStatus: "Submitted", finalProjectStatus: "Submitted", score: "Pending" },
  { teamId: "T003", teamName: "Sum math", blueprintStatus: "Missing", finalProjectStatus: "Submitted", score: "Pending" },
];

export default function JudgeSubmissionsList() {
  const [teams, setTeams] = useState(mockAssignedTeams);
  const [isJudge, setIsJudge] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.email !== JUDGE_EMAIL) {
      navigate("/judgelogin");
      return;
    }
    setIsJudge(true);

  }, [navigate]);

  if (!isJudge) {
    return <div className="judge-denied">Access Denied: Judge Login Required.</div>;
  }

  return (
    <div className="judge-submissions-container">
      <h1 className="judge-title">Team Submissions Overview</h1>
      <p className="judge-subtitle">Review the project files and grading status for your assigned teams.</p>

      <table className="submissions-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Blueprint (Day 1)</th>
            <th>Final Project (Day 4)</th>
            <th>Current Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.teamId}>
              <td className="team-name-cell">{team.teamName}</td>

              <td className={`status-cell status-${team.blueprintStatus.toLowerCase()}`}>
                {team.blueprintStatus === "Submitted" ? (
                  <a href={`/api/files/download/${team.teamId}_Blueprint`} target="_blank" rel="noopener noreferrer">
                    View File &rarr;
                  </a>
                ) : (
                  <span>{team.blueprintStatus}</span>
                )}
              </td>

              <td className={`status-cell status-${team.finalProjectStatus.toLowerCase()}`}>
                {team.finalProjectStatus === "Submitted" ? (
                  <a href={`/api/files/download/${team.teamId}_Final`} target="_blank" rel="noopener noreferrer">
                    View File &rarr;
                  </a>
                ) : (
                  <span>{team.finalProjectStatus}</span>
                )}
              </td>

              <td className="score-cell">{team.score}</td>

              <td className="action-cell">
                <Link to={`/judge/grade/${team.teamId}`} className="grade-button">
                  {team.score === "Pending" ? "Start Grading" : "Review/Edit Grade"}
                </Link>
                <Link to={`/judge/history/${team.teamId}`} className="history-button">
                  History (Req 3.0)
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}