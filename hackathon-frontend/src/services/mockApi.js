// Lightweight in-browser mock API to satisfy functional flows without a backend.
// Stores data in localStorage. Not for production use.

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

function currentUser() {
  // Prefer Firebase-backed user stored by Navbar/Auth, else a mock token user
  const u = load('user', null) || load('mock_current_user', null);
  return u;
}

function ensureSeeds() {
  if (!load('mock_users')) save('mock_users', []);
  if (!load('mock_teams')) save('mock_teams', []);
  if (!load('mock_projects')) save('mock_projects', []);
  if (!load('mock_notifications')) save('mock_notifications', []);
  if (!load('mock_judge_evals')) save('mock_judge_evals', []);
}

ensureSeeds();

async function router(method, url, body) {
  await delay();
  const path = url.split('?')[0];

  // Health
  if (method === 'GET' && path === '/') return { data: { status: 'ok', mode: 'mock' } };

  // Auth (mock)
  if (path === '/register' && method === 'POST') {
    const users = load('mock_users', []);
    if (users.find((u) => u.email === body.email)) {
      return { data: { message: 'Already registered' } };
    }
    const user = { id: String(Date.now()), name: body.name || body.email, email: body.email, role: body.role || 'student' };
    users.push(user); save('mock_users', users);
    return { data: { ok: true } };
  }
  if (path === '/login' && method === 'POST') {
    const users = load('mock_users', []);
    const user = users.find((u) => u.email === body.email) || { id: 'mock', email: body.email, role: 'student' };
    save('mock_current_user', user);
    save('token', 'mock-token');
    return { data: { token: 'mock-token', user } };
  }

  // Users - GET /users/me
  if (path === '/users/me' && method === 'GET') {
    const u = currentUser();
    return { data: u || null };
  }
  if (path === '/users/me' && method === 'PUT') {
    const u = currentUser();
    if (u) {
      const updated = { ...u, ...body };
      const users = load('mock_users', []);
      const idx = users.findIndex((user) => user.id === u.id);
      if (idx >= 0) users[idx] = updated;
      save('mock_users', users);
      save('mock_current_user', updated);
      return { data: updated };
    }
    return { data: null };
  }
  if (path === '/users/me/certificates' && method === 'GET') {
    const u = currentUser();
    return { data: [{ id: 'cert-1', title: 'Participation', url: '#', userId: u?.id }] };
  }

  // Teams
  if (path === '/teams' && method === 'GET') {
    return { data: load('mock_teams', []) };
  }
  if (path === '/teams/me' && method === 'GET') {
    const u = currentUser();
    const teams = load('mock_teams', []);
    const team = teams.find((t) => t.members?.includes(u?.email) || t.leader === u?.email) || null;
    return { data: team };
  }
  if (path === '/teams' && method === 'POST') {
    const teams = load('mock_teams', []);
    const u = currentUser();
    const team = { id: String(Date.now()), name: body.name || `Team-${teams.length + 1}`, description: body.description || '', leader: u?.email || 'leader@example.com', members: [u?.email].filter(Boolean), mentor: { name: 'Unassigned', email: 'mentor@example.com' }, mentorId: null, score: 0, updates: [], presentationTime: 'TBD' };
    teams.push(team); save('mock_teams', teams);
    // also stamp team on user for convenience
    try {
      const user = { ...(u || {}), teamId: team.id };
      save('mock_current_user', user); save('user', user);
    } catch (_) {}
    return { data: team };
  }
  if (path === '/teams/join' && method === 'POST') {
    const teams = load('mock_teams', []);
    const u = currentUser();
    const team = teams.find((t) => t.id === body.code || t.name === body.code) || teams[0];
    if (team && u) {
      team.members = [...(team.members || []), u.email];
      save('mock_teams', teams);
      const user = { ...u, teamId: team.id };
      save('mock_current_user', user); save('user', user);
      return { data: team };
    }
    return { data: null };
  }
  if (path.startsWith('/teams/') && method === 'GET' && !path.endsWith('/updates') && !path.endsWith('/update') && !path.endsWith('/leave') && path !== '/teams/me') {
    const teamId = path.split('/')[2];
    const teams = load('mock_teams', []);
    const team = teams.find((t) => t.id === teamId) || null;
    return { data: team };
  }
  if (path.startsWith('/teams/') && (path.endsWith('/update') || path.endsWith('/updates')) && method === 'POST') {
    const pathParts = path.split('/');
    const teamId = pathParts[2];
    const teams = load('mock_teams', []);
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx >= 0) {
      teams[idx].updates = teams[idx].updates || [];
      teams[idx].updates.push(body.message || '');
      save('mock_teams', teams);
      return { data: { ok: true } };
    }
    return { data: { ok: false } };
  }
  if (path.startsWith('/teams/') && path.endsWith('/leave') && method === 'POST') {
    // This is a no-op in mock mode; front-end updates UI.
    return { data: { ok: true } };
  }
  if (path.startsWith('/admin/teams/') && path.endsWith('/assign') && method === 'POST') {
    const teamId = path.split('/')[3];
    const teams = load('mock_teams', []);
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx >= 0) { teams[idx].mentorId = body.mentorId || 'mentor-1'; save('mock_teams', teams); }
    return { data: teams[idx] || null };
  }
  if (path === '/teams/leaderboard' && method === 'GET') {
    const teams = load('mock_teams', []).slice().sort((a,b) => (b.score||0)-(a.score||0));
    return { data: teams };
  }

  // Projects
  if (path === '/projects' && method === 'GET') {
    const u = currentUser();
    const all = load('mock_projects', []);
    const mine = all.filter((p) => !u || p.userId === u.id);
    return { data: mine };
  }
  if (path === '/projects' && method === 'POST') {
    const u = currentUser();
    const all = load('mock_projects', []);
    const proj = { id: String(Date.now()), userId: u?.id || 'anon', title: body.title, description: body.description, createdAt: Date.now() };
    all.push(proj); save('mock_projects', all);
    return { data: proj };
  }

  // Files
  if (path === '/api/files/upload' && method === 'POST') {
    return { data: { ok: true, url: '#uploaded' } };
  }

  // Notifications
  if (path === '/notifications' && method === 'GET') {
    const arr = load('mock_notifications', []);
    if (arr.length === 0) {
      const seed = [
        { id: 'n1', text: 'Welcome to the portal!', read: false },
        { id: 'n2', text: 'Submission deadline is Sunday 6pm.', read: false }
      ];
      save('mock_notifications', seed);
      return { data: seed };
    }
    return { data: arr };
  }
  if (path.startsWith('/notifications/') && path.endsWith('/read') && method === 'POST') {
    const id = path.split('/')[2];
    const arr = load('mock_notifications', []);
    const idx = arr.findIndex((n) => n.id === id);
    if (idx >= 0) { arr[idx].read = true; save('mock_notifications', arr); }
    return { data: { ok: true } };
  }

  // Mentor
  if (path === '/api/mentor/teams' && method === 'GET') {
    return { data: load('mock_teams', []) };
  }
  if (path.startsWith('/api/mentor/teams/') && path.endsWith('/feedback') && method === 'POST') {
    // no-op record
    return { data: { ok: true } };
  }

  // Judge
  if (path === '/assignments' && method === 'GET') {
    return { data: load('mock_projects', []).slice(0, 5) };
  }
  if (path === '/api/judge/evaluations' && method === 'GET') {
    return { data: load('mock_judge_evals', []) };
  }
  if (path.startsWith('/api/judge/evaluations/') && method === 'POST') {
    const id = path.split('/')[3];
    const evals = load('mock_judge_evals', []);
    const idx = evals.findIndex((e) => e.id === id);
    const rec = { id, score: body.score || 0, comments: body.comments || '' };
    if (idx >= 0) evals[idx] = rec; else evals.push(rec);
    save('mock_judge_evals', evals);
    return { data: rec };
  }
  if (path === '/api/judge/feedback' && method === 'GET') {
    return { data: load('mock_judge_evals', []) };
  }

  // Admin
  if (path === '/admin/stats' && method === 'GET') {
    const users = load('mock_users', []);
    const teams = load('mock_teams', []);
    const projects = load('mock_projects', []);
    return { data: { users: users.length, teams: teams.length, projects: projects.length } };
  }
  if (path === '/admin/reports' && method === 'GET') {
    return { data: { topTeams: load('mock_teams', []).slice(0, 3) } };
  }

  // Default
  return { data: null };
}

const api = {
  get: (url, cfg) => router('GET', url, cfg?.data),
  post: (url, data) => router('POST', url, data),
  put: (url, data) => router('PUT', url, data),
  delete: (url) => router('DELETE', url),
};

export default api;
