const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const projects = new Map();

router.use(authMiddleware);

// GET /api/projects
router.get('/', (req, res) => {
  res.json(Array.from(projects.values()));
});

// POST /api/projects
router.post('/', (req, res) => {
  const { teamId, title, description } = req.body || {};
  if (!title || !teamId) return res.status(400).json({ error: 'title and teamId required' });
  const id = uuidv4();
  const p = { id, teamId, title, description: description || '', files: [], submittedBy: req.user ? req.user.id : null };
  projects.set(id, p);
  res.status(201).json(p);
});

module.exports = router;
