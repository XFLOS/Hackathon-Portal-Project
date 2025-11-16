import React, { useEffect, useState } from "react";
import { auth, firebaseEnabled } from '../firebase/config'; // firebase auth
import api from '../services/api'; // for backend requests
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]); // store teams
  const [loading, setLoading] = useState(true); // loading state
  const [accessDenied, setAccessDenied] = useState(false); // admin check

  useEffect(() => {
    // determine current user (Firebase or backend JWT stored in localStorage)
    let user = null;
    if (firebaseEnabled && auth && auth.currentUser) {
      user = auth.currentUser;
    } else {
      try {
        user = JSON.parse(localStorage.getItem('user')) || null;
      } catch (err) {
        user = null;
      }
    }

    // check if user is admin (simple check)
    const adminEmail = 'coordinator@example.com';
    if (!user || user.email !== adminEmail) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    // fetch leaderboard from backend (api will attach auth header)
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/teams/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (accessDenied) return <p>Access denied. Only admins can view this page.</p>;

  return (
    <div className="leaderboard-container">
      <h2>leaderboard</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>rank</th>
              <th>team name</th>
              <th>score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((team, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{team.teamName}</td>
                <td>{team.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}