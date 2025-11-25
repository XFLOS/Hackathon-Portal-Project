import React, { useEffect, useState } from 'react';
import api from '../services/api';


export default function CertificatePage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/users/me/certificates')
      .then(res => { if (mounted) setCerts(res.data || []); })
      .catch(() => { if (mounted) setCerts([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading certificates…</p>;

  return (
    <div className="certificate-page">
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Certificates</h2>
      {certs.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No certificates yet.</p>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {certs.map(c => (
            <div key={c.id} className="certificate-card" style={{ background: '#181c2a', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px #0002' }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{c.project_title}</div>
              <div style={{ fontSize: 16, marginBottom: 4 }}>Team: <strong>{c.team_name}</strong></div>
              <div style={{ fontSize: 16, marginBottom: 4 }}>Student: <strong>{c.student_name}</strong></div>
              <div style={{ fontSize: 15, marginBottom: 4 }}>Submission Date: {c.submission_date ? new Date(c.submission_date).toLocaleString() : '—'}</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}>Average Scores: <strong>Innovation {c.avg_innovation}</strong> | <strong>Technical {c.avg_technical}</strong> | <strong>Presentation {c.avg_presentation}</strong> | <strong>Total {c.avg_total}</strong></div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Judges: {c.judges && c.judges.length > 0 ? c.judges.join(', ') : '—'}</div>
              <div>
                {c.url ? (
                  <a
                    href={c.url}
                    className="certificate-download-btn"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(90deg,#1a73e8,#003d8a)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 28px',
                      marginTop: 8,
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px #003d8a33',
                      transition: 'background 0.2s',
                    }}
                  >
                    Download Certificate
                  </a>
                ) : (
                  <button
                    className="certificate-download-btn"
                    disabled
                    style={{
                      opacity: 0.6,
                      background: '#888',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 28px',
                      marginTop: 8,
                    }}
                  >
                    Download (Coming Soon)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

