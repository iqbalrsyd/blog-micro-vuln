const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data', 'blog.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'author'
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  INSERT OR IGNORE INTO users (id, username, email, password) VALUES
    (1, 'admin', 'admin@blog.local', 'admin123'),
    (2, 'editor', 'editor@blog.local', 'editor123');

  INSERT OR IGNORE INTO posts (id, author_id, title, slug, body) VALUES
    (1, 1, 'Hello World', 'hello-world', '## Welcome to my blog!\n\nThis is my first post.'),
    (2, 1, 'JavaScript Tips', 'javascript-tips', '## 10 JavaScript tips\n\n1. Use `const`\n2. Avoid `eval()`'),
    (3, 2, 'Markdown Demo', 'markdown-demo', '## Markdown is awesome\n\n<a href="javascript:alert(1)">click me</a>');
`);

module.exports = db;
