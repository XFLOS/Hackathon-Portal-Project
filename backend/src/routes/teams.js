const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const modelsRegistry = require('../models');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// lightweight in-memory teams store for demo
const teams = new Map();

// Default team capacity
const DEFAULT_TEAM_CAPACITY = 4;

router.use(authMiddleware);

// GET /api/teams
router.get('/', async (req, res) => {
  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      const list = await Team.find().lean();
      return res.json(list.map(t => ({ id: t._id, name: t.name, description: t.description, memberEmails: t.memberEmails })));
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }
  res.json(Array.from(teams.values()));
});

// POST /api/teams
router.post('/', async (req, res) => {
  const { name, description, memberEmails } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      // Ensure creator is member if authenticated
      const members = Array.isArray(memberEmails) ? memberEmails.slice() : [];
      if (req.user && req.user.email && !members.includes(req.user.email)) members.push(req.user.email);
      const joinCode = uuidv4().split('-')[0];
      const capacity = DEFAULT_TEAM_CAPACITY;
      const t = await Team.create({ name, description, memberEmails: members, joinCode, capacity, leaderId: req.user && req.user.id });
      return res.status(201).json({ id: t._id, name: t.name, description: t.description, memberEmails: t.memberEmails, joinCode: t.joinCode, capacity: t.capacity });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }

  const id = uuidv4();
  const joinCode = uuidv4().split('-')[0];
  const members = Array.isArray(memberEmails) ? memberEmails.slice() : [];
  if (req.user && req.user.email && !members.includes(req.user.email)) members.push(req.user.email);
  const team = { id, name, description: description || '', memberEmails: members, joinCode, capacity: DEFAULT_TEAM_CAPACITY };
  teams.set(id, team);
  res.status(201).json(team);
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      const t = await Team.findById(req.params.id).lean();
      if (!t) return res.status(404).json({ error: 'not found' });
      return res.json({ id: t._id, name: t.name, description: t.description, memberEmails: t.memberEmails });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }

  const t = teams.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  res.json(t);
});

// POST /api/teams/join { code }
router.post('/join', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      const t = await Team.findOne({ joinCode }).exec();
      if (!t) return res.status(404).json({ error: 'team not found' });
      const members = t.memberEmails || [];
      const capacity = t.capacity || DEFAULT_TEAM_CAPACITY;
      if (members.length >= capacity) return res.status(400).json({ error: 'Team is full' });
      if (req.user && req.user.email && !members.includes(req.user.email)) {
        members.push(req.user.email);
        t.memberEmails = members;
        await t.save();
      }
      return res.json({ id: t._id, name: t.name, memberEmails: t.memberEmails });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }

  // In-memory fallback
  const found = Array.from(teams.values()).find(x => x.joinCode === code);
  if (!found) return res.status(404).json({ error: 'team not found' });
  if ((found.memberEmails || []).length >= (found.capacity || DEFAULT_TEAM_CAPACITY)) return res.status(400).json({ error: 'Team is full' });
  if (req.user && req.user.email && !found.memberEmails.includes(req.user.email)) found.memberEmails.push(req.user.email);
  return res.json(found);
});

// POST /api/teams/:id/leave
router.post('/:id/leave', async (req, res) => {
  const id = req.params.id;
  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      const t = await Team.findById(id).exec();
      if (!t) return res.status(404).json({ error: 'not found' });
      const members = (t.memberEmails || []).filter(e => e !== (req.user && req.user.email));
      t.memberEmails = members;
      await t.save();
      return res.json({ id: t._id, name: t.name, memberEmails: t.memberEmails });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }

  const t = teams.get(id);
  if (!t) return res.status(404).json({ error: 'not found' });
  t.memberEmails = (t.memberEmails || []).filter(e => e !== (req.user && req.user.email));
  teams.set(id, t);
  return res.json(t);
});

// GET /api/teams/me
router.get('/me', async (req, res) => {
  if (!req.user || !req.user.email) return res.status(204).json(null);
  const email = req.user.email;
  if (modelsRegistry.isInitialized()) {
    try {
      const Team = modelsRegistry.get('Team');
      const t = await Team.findOne({ memberEmails: email }).lean();
      if (!t) return res.status(404).json({ error: 'not found' });
      return res.json({ id: t._id, name: t.name, memberEmails: t.memberEmails, joinCode: t.joinCode, capacity: t.capacity });
    } catch (err) {
      return res.status(500).json({ error: 'db error' });
    }
  }
  const found = Array.from(teams.values()).find(x => (x.memberEmails || []).includes(email));
  if (!found) return res.status(404).json({ error: 'not found' });
  return res.json(found);
});

module.exports = router;
