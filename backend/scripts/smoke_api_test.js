const axios = require('axios');

// Retry-friendly smoke test: try multiple local endpoints and retry transient errors
const BASE_HOSTS = [
  'http://127.0.0.1:5000',
  'http://localhost:5000',
  'http://192.168.56.1:5000'
];
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;

async function tryRequest(method, path, data) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    for (const host of BASE_HOSTS) {
      const url = host + path;
      try {
        const res = await axios({ method, url, data, timeout: 5000 });
        return res;
      } catch (err) {
        // If this was the last host on the last attempt, rethrow
        const isLast = attempt === MAX_ATTEMPTS && host === BASE_HOSTS[BASE_HOSTS.length - 1];
        console.warn(`Request attempt ${attempt} to ${url} failed: ${err && err.message}`);
        if (isLast) throw err;
        // otherwise continue to next host/attempt
      }
    }
    // wait before next attempt
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
}

(async () => {
  try {
    const create = await tryRequest('post', '/api/teams', { name: 'Automated Smoke Team', description: 'created by node smoke test', memberEmails: ['node@smoke.test'] });
    console.log('created', create.data);

    const list = await tryRequest('get', '/api/teams');
    console.log('list', list.data);

    if (create.data && create.data.id) {
      console.log('Attempting delete via script for id', create.data.id);
      const { exec } = require('child_process');
      const path = require('path');
      const deleteScript = path.join(__dirname, 'delete_team.js');
      exec(`node "${deleteScript}" ${create.data.id}`, (err, stdout, stderr) => {
        if (err) console.error('delete err', err, stderr);
        else console.log('delete stdout', stdout);
      });
    }
  } catch (e) {
    console.error('request error', e && e.message);
    if (e && e.stack) console.error(e.stack);
    if (e.response) {
      console.error('status', e.response.status, e.response.data);
    }
    process.exit(1);
  }
})();
