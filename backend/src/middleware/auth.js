const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { init: initFirebaseAdmin } = require('../config/firebaseAdmin');
const firebaseAdmin = initFirebaseAdmin();

// In-memory user store fallback for when DB isn't connected
const inMemoryUsers = new Map();

function getInMemoryUserByEmail(email) {
  for (const u of inMemoryUsers.values()) {
    if (u.email === email) return u;
  }
  return null;
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) return next();

  try {
    // First try verifying as our backend JWT
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // minimal payload (id, email, role)
    // Ensure a normalized flag for compatibility with Firebase tokens
    if (typeof req.user.emailVerified === 'undefined') req.user.emailVerified = true;
    // Optionally enforce email-verified globally (if configured).
    // For safety during local development we only enforce this when running in production
    // and REQUIRE_EMAIL_VERIFIED is explicitly set to 'true'. This allows disabling
    // verification for temporary demos or classroom tests.
    const requireVerified = (process.env.NODE_ENV === 'production') && (process.env.REQUIRE_EMAIL_VERIFIED === 'true');
    if (requireVerified && req.user && req.user.emailVerified === false) {
      return res.status(403).json({ error: 'email not verified' });
    }
    return next();
  } catch (err) {
    // If we have Firebase Admin initialized, try verifying the token as a Firebase ID token
    if (firebaseAdmin) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        // decodedToken contains uid, email, email_verified, name, etc.
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || null,
          emailVerified: !!decodedToken.email_verified
        };
        // Only enforce email verification for Firebase tokens when running in
        // production and REQUIRE_EMAIL_VERIFIED is explicitly enabled. This
        // keeps local/dev flows permissive for demos and classroom testing.
        const requireVerifiedFirebase = (process.env.NODE_ENV === 'production') && (process.env.REQUIRE_EMAIL_VERIFIED === 'true');
        if (requireVerifiedFirebase && !req.user.emailVerified) {
          return res.status(403).json({ error: 'email not verified' });
        }
        return next();
      } catch (fvErr) {
        // fall through to demo token handling
        // eslint-disable-next-line no-console
        // console.warn('Firebase token verify failed:', fvErr.message);
      }
    }

    // Not a JWT or invalid — fall back to in-memory token format (demo only)
    // e.g., token: "demo:<email>"
    if (token.startsWith('demo:')) {
      const email = token.split(':', 2)[1];
      const u = getInMemoryUserByEmail(email);
      if (u) {
        req.user = { id: u.id, email: u.email, role: u.role, emailVerified: true };
      }
    }
    return next();
  }
}

module.exports = { authMiddleware, inMemoryUsers };
