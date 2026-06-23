const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// VULN: Insecure CORS — allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// VULN: Static file serving without security headers (no CSP, no X-Frame-Options, no HSTS)
// VULN: Serves /uploads/ directory — user-uploaded files accessible directly
app.use(express.static(path.join(__dirname, '..', 'public')));

// VULN: Internal error details exposed
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send(`<h1>My Blog</h1>
    <p>Welcome! This is a vulnerable blog for DevSecOps testing.</p>
    <ul>
      <li><a href="/posts">All Posts</a></li>
      <li><a href="/upload/list">Uploaded Files</a></li>
    </ul>`);
});

// VULN: Health check exposes env info
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, port: PORT });
});

app.listen(PORT, () => {
  console.log(`Blog server listening on port ${PORT}`);
});

module.exports = app;
