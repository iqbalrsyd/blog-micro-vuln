const request = require('supertest');
const app = require('../src/server');

describe('Blog monolith smoke tests', () => {
  test('GET / returns welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('My Blog');
  });

  test('GET /posts returns posts list', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hello World');
  });

  test('POST /auth/register creates user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', email: 'test@blog.local', password: 'test123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('testuser');
  });

  test('POST /auth/login returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@blog.local', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('GET /posts/search finds posts', async () => {
    const res = await request(app).get('/posts/search?q=Hello');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
