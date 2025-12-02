import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CertificatePage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const userObj = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(userObj);
        const [teamRes, leaderboardRes] = await Promise.all([
          api.get('/teams/me').catch(() => ({ data: null })),
          api.get('/users/leaderboard').catch(() => ({ data: [] }))
        ]);
        setTeam(teamRes.data);
        setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
      } catch (err) {
        setTeam(null);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading certificates…</p>;

  if (!user || !team) {
    return <div className="certificate-page"><h2 style={{ textAlign: 'center', marginBottom: 32 }}>Certificates</h2><p style={{ textAlign: 'center' }}>No certificates available.</p></div>;
  }

  // Find team rank and status
  let teamRank = null;
  let teamStatus = '';
  leaderboard.forEach((t, idx) => {
    if (t.id === team.id) {
      teamRank = idx + 1;
      teamStatus = teamRank === 1 ? 'WINNER OF THE S-2025' : 'RUNNER UP OF THE S-2025';
    }
  });

  // Fallback if not found
  if (!teamStatus) teamStatus = 'PARTICIPANT OF THE S-2025';

  // Download certificate as HTML file
  const downloadCertificate = (memberName) => {
    const html = `<!DOCTYPE html>
<html lang=\"en\">
<head>
<meta charset=\"UTF-8\">
<title>Hackathon Certificate</title>
<link href=\"https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap\" rel=\"stylesheet\">
<style>body { background: #f2f2f2; font-family: 'Montserrat', sans-serif; margin: 0; padding: 40px; } .certificate-wrapper { width: 1000px; margin: auto; background: white; padding: 60px; position: relative; box-shadow: 0 0 25px rgba(0,0,0,0.15); border: 1px solid #ddd; } .left-design { position: absolute; left: 0; top: 0; height: 100%; } .left-design div { position: absolute; background: linear-gradient(180deg, #1a73e8, #002c6a); opacity: 0.95; } .left-design .shape1 { width: 120px; height: 100%; transform: skewX(-12deg); } .left-design .shape2 { width: 80px; height: 90%; left: 90px; top: 30px; transform: skewX(-15deg); background: linear-gradient(180deg, #4fa3ff, #003d8a); opacity: 0.9; } .left-design .circle-logo { position: absolute; top: 230px; left: 80px; width: 130px; height: 130px; border-radius: 100%; background: white; border: 6px solid #1a73e8; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1a73e8; font-size: 26px; text-align: center; line-height: 1.2; } .top-logos { text-align: center; margin-bottom: 50px; } .top-logos img { height: 55px; margin: 0 15px; } .main-title { text-align: center; font-size: 62px; font-weight: 800; letter-spacing: 3px; color: #002c6a; margin-top: 10px; } .subtitle { text-align: center; font-size: 26px; font-weight: 600; color: #1976d2; margin-top: -5px; } .certificate-text { text-align: center; margin-top: 40px; font-size: 22px; font-weight: 500; color: #4a4a4a; } .name-line { margin: 40px auto 20px; width: 60%; border-bottom: 2px solid #444; text-align: center; padding-bottom: 5px; font-size: 28px; font-weight: 600; color: #333; } .signatures { display: flex; justify-content: space-between; margin-top: 70px; padding: 0 40px; } .sig-block { text-align: center; } .sig-line { width: 200px; border-bottom: 2px solid #555; margin: auto; height: 40px; } .sig-name { font-size: 16px; font-weight: 600; margin-top: 8px; } .sig-title { font-size: 14px; color: #666; }</style>
</head>
<body>
<div class=\"certificate-wrapper\">
  <div class=\"left-design\">
    <div class=\"shape1\"></div>
    <div class=\"shape2\"></div>
    <div class=\"circle-logo\">NCT<br>CODING</div>
  </div>
  <div class=\"top-logos\">
    <img src=\"Niagara-college_vectorized.svg\">
  </div>
  <div class=\"subtitle\">${teamStatus}</div>
  <div class=\"main-title\">HACKATHON</div>
  <div class=\"certificate-text\">THIS CERTIFICATE IS AWARDED TO</div>
  <div class=\"name-line\">${memberName}</div>
  <div class=\"signatures\">
    <div class=\"sig-block\">
      <div class=\"sig-line\"></div>
      <div class=\"sig-name\">Shallen Chen</div>
      <div class=\"sig-title\">Associate Dean</div>
    </div>
    <div class=\"sig-block\">
      <div class=\"sig-line\"></div>
      <div class=\"sig-name\">Subagini Manivannan</div>
      <div class=\"sig-title\">Academic Director</div>
    </div>
  </div>
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${memberName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="certificate-page">
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Certificates</h2>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="certificate-card" style={{ background: '#181c2a', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{team?.project_name || 'Project'}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Team: <strong>{team?.name}</strong></div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Status: <strong>{teamStatus}</strong></div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Members:</div>
          <ul style={{ marginBottom: 12 }}>
            {team?.members?.map((m, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{m.full_name || m.name}</span>
                <button
                  style={{ marginLeft: 16, padding: '4px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(90deg,#1a73e8,#003d8a)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => downloadCertificate(m.full_name || m.name)}
                >
                  Download Certificate
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
