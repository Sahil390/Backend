const createRouter = require('../src/todos');

// Unit tests for the router behavior by mocking the repo
describe('todos router (unit)', () => {
  let router;
  const supertest = require('supertest');
  const express = require('express');

  function appWithRepo(repo) {
    const app = express();
    app.use(express.json());
    app.use('/todos', createRouter(repo));
    return app;
  }

  test('GET /todos returns list from repo', async () => {
    const repo = { list: () => Promise.resolve([{ id: 1, title: 'a' }]) };
    const app = appWithRepo(repo);
    const res = await supertest(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'a' }]);
  });

  test('GET /todos/:id returns 404 when missing', async () => {
    const repo = { get: () => Promise.resolve(null) };
    const app = appWithRepo(repo);
    const res = await supertest(app).get('/todos/99');
    expect(res.status).toBe(404);
  });

  test('POST /todos validates title', async () => {
    const repo = { create: () => Promise.resolve({ id: 2, title: 'ok' }) };
    const app = appWithRepo(repo);
    const res = await supertest(app).post('/todos').send({ title: '' });
    expect(res.status).toBe(400);
  });

  test('POST /todos creates and returns item', async () => {
    const repo = { create: (data) => Promise.resolve({ id: 3, title: data.title, completed: false }) };
    const app = appWithRepo(repo);
    const res = await supertest(app).post('/todos').send({ title: 'buy' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 3, title: 'buy', completed: false });
  });
});
