import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CoordinatorManagePage() {
  // State hooks
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [submissionsLocked, setSubmissionsLocked] = useState(false);

  // Initial data load
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
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Load evaluations for judge progress tracking
  useEffect(() => {
    let mounted = true;
    api.get('/evaluations').then(res => {
      if (mounted) setEvaluations(res.data || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Filter users by role
  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  // Assign mentor to team using backend API
  const assignMentor = async (teamId, mentorId) => {
    if (!mentorId) return;
    try {
      await api.post('/coordinator/assign-mentor', { mentor_id: mentorId, team_id: teamId });
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, mentorId } : t));
      alert('Mentor assigned successfully');
    } catch (err) {
      alert('Failed to assign mentor');
    }
  };

  // Assign judge to team using backend API
  const assignJudge = async (teamId, judgeId) => {
    if (!judgeId) return;
    try {
      await api.post('/teams/assign-judge', { judge_id: judgeId, team_id: teamId });
      alert('Judge assigned successfully');
    } catch (err) {
      alert('Failed to assign judge');
    }
  };

  // Force add student to team using backend API
  const addStudentToTeam = async (teamId, studentId) => {
    if (!studentId) return;
    try {
      await api.post('/teams/add-member', { team_id: teamId, user_id: studentId });
      alert('Student added to team');
    } catch (err) {
      alert('Failed to add student');
    }
  };

  // Remove student from team using backend API
  const removeStudentFromTeam = async (teamId, studentId) => {
    if (!studentId) return;
    try {
      await api.delete('/teams/remove-member', { data: { team_id: teamId, user_id: studentId } });
      alert('Student removed from team');
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  // Lock/unlock submissions using backend API
  const lockSubmissions = async (lock) => {
    try {
      await api.put('/submissions/lock', { locked: lock });
      setSubmissionsLocked(lock);
      alert(lock ? 'Submissions locked' : 'Submissions reopened');
    } catch (err) {
      alert('Failed to update submission lock');
    }
  };

  // Helper: get judges who scored a submission
  const getJudgesForSubmission = (submissionId) => {
    return evaluations.filter(e => e.submission_id === submissionId).map(e => e.judge_name || e.judge_id);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Coordinator — Manage Users & Teams</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Filter by role: </label>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="judge">Judge</option>
          <option value="coordinator">Coordinator</option>
        </select>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Users</h3>
        {filteredUsers.length === 0 ? <p>No users found.</p> : (
          <ul>
            {filteredUsers.map(u => (
              <li key={u.id}>{u.full_name || u.email} <span style={{ color: '#888' }}>({u.role})</span></li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3>Teams</h3>
        {teams.length === 0 ? <p>No teams found.</p> : (
          teams.map(t => (
            <div key={t.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
              <div><strong>{t.name}</strong></div>
              <div>Mentor: {t.mentorId ? (users.find(u => u.id === t.mentorId)?.full_name || t.mentorId) : 'Unassigned'}</div>
              <div>
                <select defaultValue="" onChange={e => assignMentor(t.id, e.target.value)}>
                  <option value="">Assign mentor…</option>
                  {users.filter(u => u.role === 'mentor').map(m => (
                    <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 8 }}>
                <form onSubmit={e => {
                  e.preventDefault();
                  const studentId = e.target.elements[`student-${t.id}`].value;
                  addStudentToTeam(t.id, studentId);
                }}>
                  <select name={`student-${t.id}`} defaultValue="">
                    <option value="">Add student…</option>
                    {users.filter(u => u.role === 'student').map(s => (
                      <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                    ))}
                  </select>
                  <button type="submit">Add</button>
                </form>
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Team Members:</strong>
                <ul style={{ paddingLeft: 20 }}>
                  {(t.members || []).length === 0 ? <li>No members</li> : (
                    t.members.filter(m => users.find(u => u.id === m && users.find(u2 => u2.id === m)?.role === 'student')).map(m => {
                      const user = users.find(u => u.id === m);
                      return user ? (
                        <li key={user.id}>
                          {user.full_name || user.email}
                          <button style={{ marginLeft: 8 }} onClick={() => removeStudentFromTeam(t.id, user.id)}>Remove</button>
                        </li>
                      ) : null;
                    })
                  )}
                </ul>
              </div>
              <div>Judge:
                <select defaultValue="" onChange={e => assignJudge(t.id, e.target.value)}>
                  <option value="">Assign judge…</option>
                  {users.filter(u => u.role === 'judge').map(j => (
                    <option key={j.id} value={j.id}>{j.full_name || j.email}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>Submissions</h3>
        <button onClick={() => lockSubmissions(!submissionsLocked)} style={{ marginBottom: 12 }}>
          {submissionsLocked ? 'Reopen Submissions' : 'Lock Submissions'}
        </button>
        {submissions.length === 0 ? <p>No submissions found.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 4 }}>Team</th>
                <th style={{ border: '1px solid #ccc', padding: 4 }}>Title</th>

                // ...existing code...

                  // Filter users by role
                  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

                  // Assign mentor to team using backend API
                  const assignMentor = async (teamId, mentorId) => {
                    if (!mentorId) return;
                    try {
                      await api.post('/coordinator/assign-mentor', { mentor_id: mentorId, team_id: teamId });
                      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, mentorId } : t));
                      alert('Mentor assigned successfully');
                    } catch (err) {
                      alert('Failed to assign mentor');
                    }
                  };

                  // Assign judge to team using backend API
                  const assignJudge = async (teamId, judgeId) => {
                    if (!judgeId) return;
                    try {
                      await api.post('/teams/assign-judge', { judge_id: judgeId, team_id: teamId });
                      alert('Judge assigned successfully');
                    } catch (err) {
                      alert('Failed to assign judge');
                    }
                  };

                  // Force add student to team using backend API
                  const addStudentToTeam = async (teamId, studentId) => {
                    if (!studentId) return;
                    try {
                      await api.post('/teams/add-member', { team_id: teamId, user_id: studentId });
                      alert('Student added to team');
                    } catch (err) {
                      alert('Failed to add student');
                    }
                  };

                  // Remove student from team using backend API
                  const removeStudentFromTeam = async (teamId, studentId) => {
                    if (!studentId) return;
                    try {
                      await api.delete('/teams/remove-member', { data: { team_id: teamId, user_id: studentId } });
                      alert('Student removed from team');
                    } catch (err) {
                      alert('Failed to remove student');
                    }
                  };

                  // Lock/unlock submissions using backend API
                  const lockSubmissions = async (lock) => {
                    try {
                      await api.put('/submissions/lock', { locked: lock });
                      setSubmissionsLocked(lock);
                      alert(lock ? 'Submissions locked' : 'Submissions reopened');
                    } catch (err) {
                      alert('Failed to update submission lock');
                    }
                  };

                  // Helper: get judges who scored a submission
                  const getJudgesForSubmission = (submissionId) => {
                    return evaluations.filter(e => e.submission_id === submissionId).map(e => e.judge_name || e.judge_id);
                  };

                  if (loading) return <p>Loading…</p>;

                  return (
                    <div>
                      <h2>Coordinator — Manage Users & Teams</h2>
                      <div style={{ marginBottom: 16 }}>
                        <label>Filter by role: </label>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                          <option value="all">All</option>
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="judge">Judge</option>
                          <option value="coordinator">Coordinator</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 24 }}>
                        <h3>Users</h3>
                        {filteredUsers.length === 0 ? <p>No users found.</p> : (
                          <ul>
                            {filteredUsers.map(u => (
                              <li key={u.id}>{u.full_name || u.email} <span style={{ color: '#888' }}>({u.role})</span></li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h3>Teams</h3>
                        {teams.length === 0 ? <p>No teams found.</p> : (
                          teams.map(t => (
                            <div key={t.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
                              <div><strong>{t.name}</strong></div>
                              <div>Mentor: {t.mentorId ? (users.find(u => u.id === t.mentorId)?.full_name || t.mentorId) : 'Unassigned'}</div>
                              <div>
                                <select defaultValue="" onChange={e => assignMentor(t.id, e.target.value)}>
                                  <option value="">Assign mentor…</option>
                                  {users.filter(u => u.role === 'mentor').map(m => (
                                    <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <form onSubmit={e => {
                                  e.preventDefault();
                                  const studentId = e.target.elements[`student-${t.id}`].value;
                                  addStudentToTeam(t.id, studentId);
                                }}>
                                  <select name={`student-${t.id}`} defaultValue="">
                                    <option value="">Add student…</option>
                                    {users.filter(u => u.role === 'student').map(s => (
                                      <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                                    ))}
                                  </select>
                                  <button type="submit">Add</button>
                                </form>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <strong>Team Members:</strong>
                                <ul style={{ paddingLeft: 20 }}>
                                  {(t.members || []).length === 0 ? <li>No members</li> : (
                                    t.members.filter(m => users.find(u => u.id === m && users.find(u2 => u2.id === m)?.role === 'student')).map(m => {
                                      const user = users.find(u => u.id === m);
                                      return user ? (
                                        <li key={user.id}>
                                          {user.full_name || user.email}
                                          <button style={{ marginLeft: 8 }} onClick={() => removeStudentFromTeam(t.id, user.id)}>Remove</button>
                                        </li>
                                      ) : null;
                                    })
                                  )}
                                </ul>
                              </div>
                              <div>Judge:
                                <select defaultValue="" onChange={e => assignJudge(t.id, e.target.value)}>
                                  <option value="">Assign judge…</option>
                                  {users.filter(u => u.role === 'judge').map(j => (
                                    <option key={j.id} value={j.id}>{j.full_name || j.email}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ marginTop: 32 }}>
                        <h3>Submissions</h3>
                        <button onClick={() => lockSubmissions(!submissionsLocked)} style={{ marginBottom: 12 }}>
                          {submissionsLocked ? 'Reopen Submissions' : 'Lock Submissions'}
                        </button>
                        {submissions.length === 0 ? <p>No submissions found.</p> : (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ border: '1px solid #ccc', padding: 4 }}>Team</th>
                                <th style={{ border: '1px solid #ccc', padding: 4 }}>Title</th>
                                <th style={{ border: '1px solid #ccc', padding: 4 }}>Submitted By</th>
                                <th style={{ border: '1px solid #ccc', padding: 4 }}>Submitted At</th>
                                <th style={{ border: '1px solid #ccc', padding: 4 }}>Judges Completed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submissions.map(s => (
                                <tr key={s.id}>
                                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{s.team_name || s.teamId || s.team_id}</td>
                                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{s.title || s.project_name || s.projectTitle}</td>
                                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{s.submitted_by_name || s.submittedBy || s.submitted_by}</td>
                                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''}</td>
                                  <td style={{ border: '1px solid #ccc', padding: 4 }}>
                                    {getJudgesForSubmission(s.id).length === 0 ? 'None' : getJudgesForSubmission(s.id).join(', ')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      <div style={{ marginTop: 32 }}>
                        <h3>Judging Control</h3>
                        <button disabled title="Backend support required for judging lock">
                          Lock Judging (backend required)
                        </button>
                        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                          This feature requires backend support for judging lock/unlock.
                        </div>
                      </div>
                    </div>
                  );
                }

