// Entry point to run a local backend server for development
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Bind explicitly to 0.0.0.0 so the server is reachable via localhost and network interfaces
const server = app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
  try {
    const addr = server.address();
    // eslint-disable-next-line no-console
    console.log('Server bound address:', addr);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not read server address:', e && e.message ? e.message : e);
  }
});

// Seed a demo in-memory user so local developers can log in without Firebase/email verification.
// This is only enabled in non-production environments. Credentials can be supplied via
// DEMO_USER_EMAIL and DEMO_USER_PASSWORD env vars. Defaults are provided for convenience.
try {
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    const bcrypt = require('bcrypt');
    const { v4: uuidv4 } = require('uuid');
    // inMemoryUsers is exported from the auth middleware
    // path relative to backend/server.js
    // eslint-disable-next-line global-require
    const { inMemoryUsers } = require('./src/middleware/auth');

    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@local.test';
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'Password123!';
    const demoName = process.env.DEMO_USER_NAME || 'Local Demo';
    const demoRole = process.env.DEMO_USER_ROLE || 'student';

    // only add if not already present (by email)
    const exists = Array.from(inMemoryUsers.values()).some(u => u && u.email === demoEmail);
    if (!exists) {
      const id = uuidv4();
      const passwordHash = bcrypt.hashSync(demoPassword, 10);
      const user = { id, name: demoName, email: demoEmail, passwordHash, role: demoRole };
      inMemoryUsers.set(id, user);
      // eslint-disable-next-line no-console
      console.log(`Demo user seeded: email=${demoEmail} password=${demoPassword} (role=${demoRole})`);
      // eslint-disable-next-line no-console
      console.log('Use POST /api/auth/login with { email, password } to obtain a JWT for local testing.');
    }
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Failed to seed demo user:', e && e.message ? e.message : e);
}

server.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Server error:', err && err.message ? err.message : err);
  if (err && err.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
});

// Global handlers to diagnose unexpected exits in development
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('[uncaughtException] ', err && err.message ? err.message : err);
  if (err && err.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
  // Do not exit automatically so interactive sessions can inspect the error.
});

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('[unhandledRejection] promise=', promise, ' reason=', reason);
  if (reason && reason.stack) {
    // eslint-disable-next-line no-console
    console.error(reason.stack);
  }
  // Keep process alive for debugging; developers can decide to exit if desired.
});
