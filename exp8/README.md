# Experiment 7 — Testing strategies (To-do API)

This sample implements a small Express to-do API and demonstrates unit and integration tests using Jest and Supertest.

Quick start:

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Files:
- `src/app.js` - Express app factory that accepts a repo.
- `src/index.js` - Simple in-memory repo and start script.
- `src/todos.js` - Router for todo endpoints.
- `test/*.test.js` - Unit and integration tests.

Notes:
- Unit tests mock the repository to test router behavior in isolation.
- Integration tests use an in-memory repo to test end-to-end HTTP behavior.
