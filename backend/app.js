const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Simple request logger to aid debugging network/connectivity issues
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Static uploads folder (for multer local storage)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir); } catch (e) { /* ignore */ }
}
app.use('/uploads', express.static(uploadsDir));

// Health endpoint used by tests and for local sanity
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount server routes (if present)
try {
  // backend/src/index.js exports an Express Router
  // eslint-disable-next-line global-require
  const apiRouter = require('./src');
  if (apiRouter && typeof apiRouter === 'function') {
    app.use('/api', apiRouter());
  } else if (apiRouter && apiRouter.use) {
    app.use('/api', apiRouter);
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.log('No server routes mounted:', err.message);
}

module.exports = app;
