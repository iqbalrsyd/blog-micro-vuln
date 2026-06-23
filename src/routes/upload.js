const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// VULN: No file type validation — any file accepted
// VULN: No file size limit
// VULN: Original filename preserved (path traversal in filename possible)
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  // VULN: No fileFilter — allows .php, .html, .js, etc.
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // VULN: Serves user-uploaded file directly — RCE risk via .php/.html/.js
  const url = `/uploads/${req.file.filename}`;

  // VULN: Reflected XSS — filename reflected unescaped
  res.send(`<p>File uploaded: <a href="${url}">${req.file.originalname}</a></p>`);
});

router.get('/list', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot list uploads' });

    const list = files.map(f =>
      // VULN: filename reflected unescaped (XSS)
      `<li><a href="/uploads/${f}">${f}</a></li>`
    ).join('');

    res.send(`<h1>Uploaded Files</h1><ul>${list}</ul>`);
  });
});

module.exports = router;
