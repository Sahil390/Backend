const createApp = require('../src/app');

const supertest = require('supertest');

// Integration tests using the in-memory repo from src/index.js
const repoFactory = () => {
  let todos = [];
  let id = 1;
  return {
    list: () => Promise.resolve(todos.slice()),
    get: (id_) => Promise.resolve(todos.find(t => t.id === Number(id_)) || null),
    create: (data) => {
      const item = { id: id++, title: data.title || '', completed: !!data.completed };
      todos.push(item);
      return Promise.resolve(item);
    },
    reset: () => { todos = []; id = 1; }
  };
};

describe('todos integration', () => {
  let repo;
  let app;

  beforeEach(() => {
    repo = repoFactory();
    repo.reset();
    app = createApp(repo);
  });

  test('POST then GET list', async () => {
    const agent = supertest(app);
    const r1 = await agent.post('/todos').send({ title: 'task1' });
    expect(r1.status).toBe(201);
    expect(r1.body.title).toBe('task1');

    const r2 = await agent.get('/todos');
    expect(r2.status).toBe(200);
    expect(r2.body.length).toBe(1);
    expect(r2.body[0].title).toBe('task1');
  });

  test('GET /todos/:id returns item', async () => {
    const agent = supertest(app);
    const created = await agent.post('/todos').send({ title: 't2' });
    const id = created.body.id;
    const res = await agent.get(`/todos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });
});
