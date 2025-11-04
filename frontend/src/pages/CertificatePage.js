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
    <div>
      <h2>Certificates</h2>
      {certs.length === 0 ? <p>No certificates yet.</p> : (
        <ul>
          {certs.map(c => (
            <li key={c.id || c.name}>
              <div><strong>{c.name}</strong></div>
              {c.url ? <a href={c.url} target="_blank" rel="noreferrer">Download</a> : <span>No file</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

