const express = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

const router = express.Router();

// POST /api/files/upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  // Return a local URL to the uploaded file
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, originalName: req.file.originalname });
});

module.exports = router;
