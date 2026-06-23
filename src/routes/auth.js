const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = 'myverysupersecretjwtkey42';

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // VULN: No input validation, password stored in plaintext
  const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
  const result = stmt.run(username, email, password);

  res.json({ id: result.lastInsertRowid, username, email });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // VULN: SQL Injection via unsanitized input
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const user = db.prepare(query).get();

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
  );

  // VULN: Insecure cookie — no httpOnly, no secure, no sameSite
  res.cookie('session', token);
  res.cookie('user_role', user.role);

  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

module.exports = router;
