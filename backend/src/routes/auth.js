const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { inMemoryUsers } = require('../middleware/auth');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!email || !name) return res.status(400).json({ error: 'name and email required' });

  // If DB is connected we'd create a User document; here use in-memory fallback
  if (inMemoryUsers.has(email)) {
    return res.status(409).json({ error: 'user exists' });
  }

  const id = uuidv4();
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const user = { id, name, email, passwordHash, role: role || 'student' };
  inMemoryUsers.set(id, user);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  // lookup in inMemoryUsers
  let user = null;
  for (const u of inMemoryUsers.values()) {
    if (u.email === email) { user = u; break; }
  }
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  if (user.passwordHash) {
    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/demo-login
// Returns a JWT for the demo user seeded in-memory. Only available in non-production
// or when DEMO_LOGIN_ENABLED is explicitly set to 'true'.
router.post('/demo-login', async (req, res) => {
  try {
    const allowDemo = (process.env.NODE_ENV || 'development') !== 'production' || process.env.DEMO_LOGIN_ENABLED === 'true';
    if (!allowDemo) return res.status(403).json({ error: 'demo login disabled' });

    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@local.test';
    const demoName = process.env.DEMO_USER_NAME || 'Local Demo';
    const demoRole = process.env.DEMO_USER_ROLE || 'student';

    // find existing in-memory user by email
    let user = null;
    for (const u of inMemoryUsers.values()) {
      if (u.email === demoEmail) { user = u; break; }
    }

    // If not present, create one without a password (login endpoint can still create tokens)
    if (!user) {
      const id = uuidv4();
      user = { id, name: demoName, email: demoEmail, role: demoRole };
      inMemoryUsers.set(id, user);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('demo-login error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'demo login failed' });
  }
});

// GET /api/auth/demo-info
// Returns whether demo login is available and the demo account metadata (email/name/role)
router.get('/demo-info', (req, res) => {
  try {
    const allowDemo = (process.env.NODE_ENV || 'development') !== 'production' || process.env.DEMO_LOGIN_ENABLED === 'true';
    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@local.test';
    const demoName = process.env.DEMO_USER_NAME || 'Local Demo';
    const demoRole = process.env.DEMO_USER_ROLE || 'student';
    return res.json({ enabled: !!allowDemo, email: demoEmail, name: demoName, role: demoRole });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('demo-info failed', err && err.message ? err.message : err);
    return res.json({ enabled: false });
  }
});

module.exports = router;
