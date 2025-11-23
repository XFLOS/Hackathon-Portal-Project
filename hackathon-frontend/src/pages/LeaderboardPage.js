import React, { useEffect, useState } from "react";
import api from '../services/api';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myTeamId, setMyTeamId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch leaderboard and user's team in parallel
      const [leaderboardRes, teamRes] = await Promise.all([
        api.get('/users/leaderboard'),
        api.get('/teams/me').catch(() => ({ data: null }))
      ]);

      setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
      
      // Set user's team ID for highlighting
      if (teamRes.data && teamRes.data.id) {
        setMyTeamId(teamRes.data.id);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1:
        return { emoji: '🥇', class: 'gold', label: '1st' };
      case 2:
        return { emoji: '🥈', class: 'silver', label: '2nd' };
      case 3:
        return { emoji: '🥉', class: 'bronze', label: '3rd' };
      default:
        return { emoji: '', class: '', label: `${rank}th` };
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="leaderboard-subtitle">Top performing teams ranked by average scores</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <p>No teams evaluated yet</p>
            <p className="empty-subtitle">Rankings will appear once judges evaluate submissions</p>
          </div>
        ) : (
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="team-col">Team</th>
                  <th className="project-col">Project</th>
                  <th className="score-col">Total Score</th>
                  <th className="innovation-col">Innovation</th>
                  <th className="technical-col">Technical</th>
                  <th className="presentation-col">Presentation</th>
                  <th className="evals-col">Evaluations</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((team, idx) => {
                  const rank = idx + 1;
                  const rankBadge = getRankBadge(rank);
                  const isMyTeam = team.id === myTeamId;
                  
                  return (
                    <tr 
                      key={team.id} 
                      className={`${rankBadge.class} ${isMyTeam ? 'my-team' : ''}`}
                    >
                      <td className="rank-cell">
                        <div className="rank-badge">
                          {rankBadge.emoji && <span className="rank-emoji">{rankBadge.emoji}</span>}
                          <span className="rank-number">{rankBadge.label}</span>
                        </div>
                      </td>
                      <td className="team-cell">
                        <div className="team-info">
                          <span className="team-name">{team.team_name}</span>
                          {isMyTeam && <span className="my-team-badge">Your Team</span>}
                        </div>
                      </td>
                      <td className="project-cell">{team.project_name || 'No project name'}</td>
                      <td className="score-cell">
                        <div className="total-score">{team.average_score || '0.00'}</div>
                      </td>
                      <td className="innovation-cell">
                        <span className="score-value">{team.avg_innovation || '0.00'}</span>
                      </td>
                      <td className="technical-cell">
                        <span className="score-value">{team.avg_technical || '0.00'}</span>
                      </td>
                      <td className="presentation-cell">
                        <span className="score-value">{team.avg_presentation || '0.00'}</span>
                      </td>
                      <td className="evals-cell">
                        <span className="eval-count">{team.evaluation_count || 0}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="leaderboard-footer">
            <p className="footer-note">
              * Scores are averaged from multiple judge evaluations
            </p>
            {myTeamId && leaderboard.some(t => t.id === myTeamId) && (
              <p className="footer-highlight">
                Your team is highlighted in cyan
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}