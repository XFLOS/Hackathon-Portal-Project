// Prefer global fetch (Node 18+). Fall back to node-fetch if necessary.
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}
const path = require('path');
(async () => {
  try {
    const { init } = require('../src/config/firebaseAdmin');
    const admin = init();
    if (!admin) {
      console.error('Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_FILE or FIREBASE_SERVICE_ACCOUNT_JSON.');
      process.exit(2);
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      console.error('FIREBASE_API_KEY is required to exchange custom token for ID token.');
      process.exit(2);
    }

    // create a test user
    const email = `integration.test+${Date.now()}@example.test`;
    const password = 'Password123!';
    console.log('Creating Firebase user', email);
    const userRecord = await admin.auth().createUser({ email, password, displayName: 'Integration Test' });
    console.log('Created uid', userRecord.uid);

    // mark email verified
    await admin.auth().updateUser(userRecord.uid, { emailVerified: true });
    console.log('Marked emailVerified=true');

    // create custom token and exchange for ID token via REST
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const exchangeRes = await fetch(exchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    });
    const exchangeJson = await exchangeRes.json();
    if (!exchangeJson.idToken) {
      console.error('Failed to exchange custom token:', exchangeJson);
      process.exit(1);
    }
    const idToken = exchangeJson.idToken;
    console.log('Obtained ID token from custom token exchange');

    // Call backend endpoints with ID token
    const base = 'http://localhost:5000/api';
    const headers = { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };

    // Upsert via POST /api/users
    const upsertRes = await fetch(`${base}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Integration Test', email, role: 'student' })
    });
    const upsertJson = await upsertRes.json();
    console.log('POST /api/users', upsertRes.status, upsertJson);

    // GET /api/users/me
    const meRes = await fetch(`${base}/users/me`, { method: 'GET', headers });
    const meJson = await meRes.json();
    console.log('GET /api/users/me', meRes.status, meJson);

    if (meRes.status === 200 && meJson.email === email) {
      console.log('Firebase integration test PASSED');
      // cleanup
      await admin.auth().deleteUser(userRecord.uid);
      console.log('Cleaned up test user');
      process.exit(0);
    }

    console.error('Integration test failed: unexpected response');
    await admin.auth().deleteUser(userRecord.uid);
    process.exit(1);
  } catch (err) {
    console.error('Integration test error', err && err.message);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
