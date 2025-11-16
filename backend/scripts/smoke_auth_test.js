const axios = require('axios');

// Retry-friendly wrapper and multi-host fallback
const BASE_HOSTS = [
  'http://127.0.0.1:5000',
  'http://localhost:5000',
  'http://192.168.56.1:5000'
];
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;

async function tryRequest(method, path, data, headers) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    for (const host of BASE_HOSTS) {
      const url = host + path;
      try {
        return await axios({ method, url, data, headers, timeout: 5000 });
      } catch (err) {
        const isLast = attempt === MAX_ATTEMPTS && host === BASE_HOSTS[BASE_HOSTS.length - 1];
        console.warn(`Attempt ${attempt} to ${url} failed: ${err && err.message}`);
        if (isLast) throw err;
      }
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
}

(async () => {
  try {
    // 1) register via backend auth (in-memory fallback)
    const email = `smoke.user+${Date.now()}@example.test`;
    const name = 'Smoke User';
    const password = 'password123';
    console.log('Registering user', email);
    const reg = await tryRequest('post', '/api/auth/register', { name, email, password, role: 'student' });
    console.log('register response', reg.status, reg.data);

    // 2) login
    const login = await tryRequest('post', '/api/auth/login', { email, password });
    console.log('login response', login.status, Object.keys(login.data || {}));
    const token = login.data && login.data.token;
    if (!token) throw new Error('no token from login');

    // 3) call /users/me
    const me = await tryRequest('get', '/api/users/me', null, { Authorization: `Bearer ${token}` });
    console.log('me', me.status, me.data);

    console.log('SMOKE AUTH TEST PASSED');
    process.exit(0);
  } catch (err) {
    console.error('SMOKE AUTH TEST FAILED', err && err.message);
    if (err.response) console.error('RESP', err.response.status, err.response.data);
    process.exit(1);
  }
})();
