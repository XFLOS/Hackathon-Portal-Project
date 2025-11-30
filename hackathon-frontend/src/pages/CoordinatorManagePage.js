import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorManagePage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submissionsLocked, setSubmissionsLocked] = useState(false);

  /* =========================
     INITIAL DATA LOAD
  ========================= */
  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get('/teams').catch(() => ({ data: [] })),
      api.get('/users').catch(() => ({ data: [] })),
      api.get('/submissions').catch(() => ({ data: [] }))
    ])
      .then(([t, u, s]) => {
        if (mounted) {
          setTeams(t.data || []);
          setUsers(u.data || []);
          setSubmissions(s.data || []);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  /* =========================
     LOAD EVALUATIONS
  ========================= */
  useEffect(() => {
    let mounted = true;
    api.get('/evaluations')
      .then(res => mounted && setEvaluations(res.data || []))
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter);

  /* =========================
     ACTION HANDLERS
  ========================= */
  const assignMentor = async (teamId, mentorId) => {
    if (!mentorId) return;
    try {
      await api.post('/coordinator/assign-mentor', {
        mentor_id: mentorId,
        team_id: teamId
      });

      setTeams(prev =>
        prev.map(t => t.id === teamId ? { ...t, mentorId } : t)
      );
    } catch {
      alert('Failed to assign mentor');
    }
  };

  const assignJudge = async (teamId, judgeId) => {
    if (!judgeId) return;
    try {
      await api.post('/teams/assign-judge', { judge_id: judgeId, team_id: teamId });
      alert('Judge assigned successfully');
    } catch {
      alert('Failed to assign judge');
    }
  };

  const addStudentToTeam = async (teamId, studentId) => {
    if (!studentId) return;
    try {
      await api.post('/teams/add-member', { team_id: teamId, user_id: studentId });
      alert('Student added to team');
    } catch {
      alert('Failed to add student');
    }
  };

  const removeStudentFromTeam = async (teamId, studentId) => {
    try {
      await api.delete('/teams/remove-member', {
        data: { team_id: teamId, user_id: studentId }
      });
      alert('Student removed from team');
    } catch {
      alert('Failed to remove student');
    }
  };

  const lockSubmissions = async (lock) => {
    try {
      await api.put('/submissions/lock', { locked: lock });
      setSubmissionsLocked(lock);
      alert(lock ? 'Submissions locked' : 'Submissions reopened');
    } catch {
      alert('Failed to update submission lock');
    }
  };

  const getJudgesForSubmission = (submissionId) => {
    return evaluations
      .filter(e => e.submission_id === submissionId)
      .map(e => e.judge_name || e.judge_id);
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Coordinator — Manage Users & Teams</h2>

      <div>
        <label>Filter by role: </label>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="judge">Judge</option>
          <option value="coordinator">Coordinator</option>
        </select>
      </div>

      <h3>Users</h3>
      <ul>
        {filteredUsers.map(u => (
          <li key={u.id}>{u.full_name || u.email} ({u.role})</li>
        ))}
      </ul>

      <h3>Teams</h3>
      {teams.map(t => (
        <div key={t.id}>
          <strong>{t.name}</strong>

          <select onChange={e => assignMentor(t.id, e.target.value)}>
            <option value="">Assign mentor…</option>
            {users.filter(u => u.role === 'mentor').map(m => (
              <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
            ))}
          </select>

          <select onChange={e => assignJudge(t.id, e.target.value)}>
            <option value="">Assign judge…</option>
            {users.filter(u => u.role === 'judge').map(j => (
              <option key={j.id} value={j.id}>{j.full_name || j.email}</option>
            ))}
          </select>
        </div>
      ))}

      <h3>Submissions</h3>
      <button onClick={() => lockSubmissions(!submissionsLocked)}>
        {submissionsLocked ? 'Reopen Submissions' : 'Lock Submissions'}
      </button>

      <table border="1">
        <thead>
          <tr>
            <th>Team</th>
            <th>Title</th>
            <th>Submitted By</th>
            <th>Submitted At</th>
            <th>Judges Completed</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(s => (
            <tr key={s.id}>
              <td>{s.team_id}</td>
              <td>{s.title}</td>
              <td>{s.submitted_by}</td>
              <td>{new Date(s.submitted_at).toLocaleString()}</td>
              <td>{getJudgesForSubmission(s.id).join(', ') || 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Judging Control</h3>
      <button disabled>Lock Judging (backend required)</button>
    </div>
  );
}
