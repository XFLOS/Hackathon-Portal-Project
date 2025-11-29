
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AppShell from '../components/layout/AppShell';
import './CoordinatorDashboard.css';

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/coordinator/stats');
        if (mounted && res?.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to load coordinator stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <AppShell>
      <div className="coordinator-dashboard-bg">
        <div className="coordinator-dashboard-container glass">
          <div className="coordinator-dashboard-header">
            <div className="coordinator-dashboard-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#00e0ff33"/>
                <path d="M16 32V20H32V32" stroke="#00e0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="20" y="24" width="8" height="8" rx="2" fill="#00e0ff"/>
              </svg>
            </div>
            <div>
              <div className="coordinator-dashboard-title">Coordinator Dashboard</div>
              <div className="coordinator-dashboard-subtitle">Manage teams, mentors, reports &amp; analytics.</div>
            </div>
          </div>
          {loading && <LoadingSpinner />}
          <div className="coordinator-dashboard-stats-row">
            <StatWidget label="Teams" value={stats?.total_teams ?? 0} icon="👥" color="#00e0ff" />
            <StatWidget label="Submissions" value={stats?.total_submissions ?? 0} icon="📄" color="#ffb300" />
            <StatWidget label="Students" value={stats?.total_students ?? 0} icon="🎓" color="#7cffb2" />
            <StatWidget label="Evaluated" value={stats?.total_evaluations ?? 0} icon="✅" color="#ff5e5e" />
          </div>
          <div className="coordinator-dashboard-card glass">
            <h3>Quick Stats</h3>
            <div className="coordinator-dashboard-card-desc">Hackathon overview and metrics</div>
            {loading ? <p>Loading...</p> : (
              stats ? (
                <ul>
                  <li>Total Teams <span>{stats.total_teams ?? 0}</span></li>
                  <li>Total Submissions <span>{stats.total_submissions ?? 0}</span></li>
                  <li>Total Students <span>{stats.total_students ?? 0}</span></li>
                  <li>Evaluated Submissions <span>{stats.total_evaluations ?? 0}</span></li>
                </ul>
              ) : <p className="muted">No stats available.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );

  function StatWidget({ label, value, icon, color }) {
    return (
      <div className="coordinator-dashboard-stat-widget glass" style={{ borderColor: color }}>
        <div className="stat-icon" style={{ color }}>{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }
}
