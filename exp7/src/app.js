const express = require('express');
const bodyParser = require('body-parser');
const createTodoRouter = require('./todos');

function createApp(repo) {
  const app = express();
  app.use(bodyParser.json());
  app.use('/todos', createTodoRouter(repo));

  app.get('/', (req, res) => res.json({ ok: true }));
  return app;
}

module.exports = createApp;
