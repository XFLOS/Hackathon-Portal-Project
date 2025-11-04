const express = require('express');
const { authMiddleware, inMemoryUsers } = require('../middleware/auth');
const modelsRegistry = require('../models');

const router = express.Router();

// POST /api/users - upsert user record (name, email, role)
// NOTE: This route intentionally does NOT require authentication so the frontend
// can upsert a freshly-registered Firebase user (who may not yet have verified their email).
router.post('/', async (req, res) => {
  const { name, email, role } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  // If DB models are available, upsert into DB
  if (modelsRegistry.isInitialized()) {
    try {
      const User = modelsRegistry.get('User');
      const updated = await User.findOneAndUpdate(
        { email },
        { $set: { name, role: role || 'student' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      return res.status(200).json({ id: updated._id, name: updated.name, email: updated.email, role: updated.role });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }

  // Fallback: upsert into inMemoryUsers map
  let existing = Array.from(inMemoryUsers.values()).find(x => x.email === email);
  if (existing) {
    existing.name = name || existing.name;
    existing.role = role || existing.role;
    return res.json({ id: existing.id, name: existing.name, email: existing.email, role: existing.role });
  }

  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const u = { id, name: name || '', email, role: role || 'student' };
  inMemoryUsers.set(id, u);
  return res.status(201).json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

router.use(authMiddleware);

// GET /api/users/me
router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'not authenticated' });

  // If models are initialized, prefer DB lookup by email. If DB lookup fails
  // (or the user isn't found in DB), fall back to the in-memory store.
  if (modelsRegistry.isInitialized()) {
    try {
      const User = modelsRegistry.get('User');
      // Lookup by email first to avoid ObjectId cast errors when the auth id is a UUID/demo id
      let user = null;
      if (req.user && req.user.email) {
        user = await User.findOne({ email: req.user.email }).lean();
      }
      // If not found by email and the id looks like a valid ObjectId string, try by _id
      if (!user && req.user && req.user.id) {
        try {
          const possible = await User.findOne({ _id: req.user.id }).lean();
          if (possible) user = possible;
        } catch (castErr) {
          // ignore cast errors and fall through to in-memory fallback
        }
      }

      if (user) return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
      // else fall through to in-memory fallback below
    } catch (err) {
      // If DB errors occur, continue to in-memory fallback instead of failing hard
      // eslint-disable-next-line no-console
      console.warn('User DB lookup error, falling back to in-memory store:', err && err.message ? err.message : err);
    }
  }

  // Fallback to in-memory
  const u = Array.from(inMemoryUsers.values()).find(x => x.id === req.user.id || x.email === req.user.email);
  if (!u) return res.status(404).json({ error: 'user not found' });
  res.json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

module.exports = router;
