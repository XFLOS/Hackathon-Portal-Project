const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const notifications = new Map();

router.use(authMiddleware);

// GET /api/notifications
router.get('/', (req, res) => {
  // return notifications for user (if authenticated) or all for demo
  if (!req.user) return res.json(Array.from(notifications.values()));
  const userNotifications = Array.from(notifications.values()).filter(n => n.userId === req.user.id);
  res.json(userNotifications);
});

// POST /api/notifications/:id/read
router.post('/:id/read', (req, res) => {
  const n = notifications.get(req.params.id);
  if (!n) return res.status(404).json({ error: 'not found' });
  n.read = true;
  notifications.set(n.id, n);
  res.json(n);
});

module.exports = router;
