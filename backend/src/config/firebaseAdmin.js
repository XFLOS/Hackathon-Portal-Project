const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

function init() {
  if (initialized) return admin;

  // Allow service account JSON either from FILE path in env or raw JSON string
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_FILE || '';
  if (!raw) {
    // Not configured
    // eslint-disable-next-line no-console
    console.log('Firebase Admin not configured (no service account).');
    return null;
  }

  try {
    let credObj = null;
    // If env points to a file path
    if (fs.existsSync(raw)) {
      // eslint-disable-next-line global-require
      credObj = require(path.resolve(raw));
    } else {
      // Try parse JSON string
      credObj = JSON.parse(raw);
    }

    admin.initializeApp({ credential: admin.credential.cert(credObj) });
    initialized = true;
    // eslint-disable-next-line no-console
    console.log('Firebase Admin initialized');
    return admin;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to initialize Firebase Admin:', err && err.message ? err.message : err);
    return null;
  }
}

module.exports = { init, admin };
