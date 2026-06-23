const express = require('express');
const db = require('../db');

const router = express.Router();

// VULN: No CSRF token validation on any comment endpoint
// VULN: No authentication check — anyone can post comments

router.post('/:postId/comment', (req, res) => {
  const { author_name, body } = req.body;

  // VULN: No input sanitization — stored XSS
  // VULN: SQL Injection in postId
  const stmt = db.prepare('INSERT INTO comments (post_id, author_name, body) VALUES (?, ?, ?)');
  const result = stmt.run(req.params.postId, author_name, body);

  // VULN: Reflects user input back without escaping
  res.send(`<p>Comment posted by <b>${author_name}</b>: ${body}</p><a href="/posts/post/${req.params.postId}">Back</a>`);
});

router.get('/post/:postId/comments', (req, res) => {
  // VULN: SQL Injection
  const query = `SELECT * FROM comments WHERE post_id = ${req.params.postId} ORDER BY created_at DESC`;
  const comments = db.prepare(query).all();

  // VULN: comment body rendered without escaping in JSON response
  res.json(comments.map(c => ({
    id: c.id,
    author: c.author_name,
    body: c.body,
  })));
});

module.exports = router;
