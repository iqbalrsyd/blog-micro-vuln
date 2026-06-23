const express = require('express');
const path = require('path');
const db = require('../db');
const { renderMarkdown } = require('../lib/markdown');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;

  let query;
  if (category) {
    // VULN: SQL Injection — unsanitized category in LIKE clause
    query = `SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.body LIKE '%${category}%' ORDER BY p.created_at DESC`;
  } else {
    query = 'SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC';
  }

  const posts = db.prepare(query).all();

  const html = posts.map(p => {
    // VULN: Content injection — marked renders raw HTML inside post body
    const bodyHtml = renderMarkdown(p.body);
    return `<article>
      <h2>${p.title}</h2>
      <small>by ${p.username}</small>
      <div>${bodyHtml}</div>
    </article>`;
  }).join('<hr>');

  res.send(`<h1>Blog</h1>${html}`);
});

router.get('/post/:slug', (req, res) => {
  // VULN: SQL Injection in slug
  const query = `SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.slug = '${req.params.slug}'`;
  const post = db.prepare(query).get();

  if (!post) return res.status(404).send('Post not found');

  const bodyHtml = renderMarkdown(post.body);

  // VULN: SQL Injection — comments query
  const commentsQuery = `SELECT * FROM comments WHERE post_id = ${post.id} ORDER BY created_at ASC`;
  const comments = db.prepare(commentsQuery).all();

  const commentsHtml = comments.map(c =>
    // VULN: Stored XSS — comment body rendered unescaped
    `<div class="comment"><strong>${c.author_name}</strong><p>${c.body}</p></div>`
  ).join('');

  res.send(`<h1>${post.title}</h1>
    <small>by ${post.username}</small>
    <div>${bodyHtml}</div>
    <h3>Comments</h3>
    ${commentsHtml || '<p>No comments yet.</p>'}
    <form method="POST" action="/posts/${post.id}/comment">
      <input name="author_name" placeholder="Your name"><br>
      <textarea name="body" placeholder="Your comment"></textarea><br>
      <button>Post Comment</button>
    </form>`);
});

router.post('/', (req, res) => {
  const { author_id, title, slug, body } = req.body;

  // VULN: No CSRF protection, no authentication check
  // VULN: SQL Injection
  const query = `INSERT INTO posts (author_id, title, slug, body) VALUES (${author_id}, '${title}', '${slug}', '${body}')`;
  const result = db.prepare(query).run();

  res.json({ id: result.lastInsertRowid, title, slug });
});

router.get('/search', (req, res) => {
  // VULN: SQL Injection in search
  const { q } = req.query;
  const query = `SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.title LIKE '%${q}%' OR p.body LIKE '%${q}%'`;
  const posts = db.prepare(query).all();
  res.json(posts);
});

// VULN: Path traversal — static file serving without path validation
router.get('/static', (req, res) => {
  const file = req.query.file || 'default.html';
  const filePath = path.join(__dirname, '..', 'public', file);
  res.sendFile(filePath);
});

module.exports = router;
