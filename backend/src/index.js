const express = require('express');
const router = express.Router();
const db = require('./config/db');
const modelsRegistry = require('./models');

// Route modules (keep them lightweight and optional)
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const teamsRoutes = require('./routes/teams');
const projectsRoutes = require('./routes/projects');
const notificationsRoutes = require('./routes/notifications');
const filesRoutes = require('./routes/files');

// Attempt DB connection in background; if it succeeds, initialize models.
db.connect().then((conn) => {
  if (conn) {
    try {
      modelsRegistry.init(db.mongoose);
      // eslint-disable-next-line no-console
      console.log('Models initialized after DB connect');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to init models:', err && err.message ? err.message : err);
    }
  }
}).catch((err) => {
  // Log full error for diagnostics (stack, message)
  // eslint-disable-next-line no-console
  console.error('DB connect skipped or failed:', err && err.message ? err.message : err);
  if (err && err.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
});

module.exports = () => {
  const api = express.Router();

  api.use('/auth', authRoutes);
  api.use('/users', usersRoutes);
  api.use('/teams', teamsRoutes);
  api.use('/projects', projectsRoutes);
  api.use('/notifications', notificationsRoutes);
  api.use('/files', filesRoutes);

  // fallback for /api
  api.get('/', (req, res) => res.json({ status: 'api ok' }));

  return api;
};
