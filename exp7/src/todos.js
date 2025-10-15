const express = require('express');

function createRouter(repo) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const list = await repo.list();
    res.json(list);
  });

  router.get('/:id', async (req, res) => {
    const it = await repo.get(req.params.id);
    if (!it) return res.status(404).json({ error: 'Not found' });
    res.json(it);
  });

  router.post('/', async (req, res) => {
    const data = req.body;
    if (!data || typeof data.title !== 'string' || !data.title.trim()) {
      return res.status(400).json({ error: 'title required' });
    }
    const item = await repo.create({ title: data.title, completed: !!data.completed });
    res.status(201).json(item);
  });

  return router;
}

module.exports = createRouter;
