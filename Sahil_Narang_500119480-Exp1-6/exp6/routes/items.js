// routes/items.js
const express = require('express');
const repo = require('../repositories/itemRepository');
const router = express.Router();

// GET /items - list with pagination, search, sort
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(100, Number(req.query.limit || 50));
    const search = req.query.search || undefined;
    const sort = req.query.sort ? parseSort(req.query.sort) : undefined;
    const result = await repo.findAll({ page, limit, search, sort });
    res.json(result);
  } catch (err) { next(err); }
});

// POST /items - create
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const newItem = await repo.create({ name, description });
    res.status(201).json(newItem);
  } catch (err) { next(err); }
});

// Nested routes for a single item
router.route('/:id')
  .get(async (req, res, next) => {
    try {
      const item = await repo.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json(item);
    } catch (err) { next(err); }
  })
  .put(async (req, res, next) => {
    try {
      const updated = await repo.update(req.params.id, req.body || {});
      if (!updated) return res.status(404).json({ message: 'Item not found' });
      res.json(updated);
    } catch (err) { next(err); }
  })
  .delete(async (req, res, next) => {
    try {
      const ok = await repo.delete(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Item not found' });
      res.status(204).end();
    } catch (err) { next(err); }
  });

// Example nested sub-route: /items/:id/audits
router.get('/:id/audits', async (req, res, next) => {
  try {
    // lightweight audit fetch - directly using Audit model to keep example small
    const Audit = require('../models/audit');
    const docs = await Audit.find({ itemId: Number(req.params.id) }).sort({ ts: -1 }).lean();
    res.json({ audits: docs });
  } catch (err) { next(err); }
});

function parseSort(sortParam) {
  const sort = {};
  sortParam.split(',').forEach(pair => {
    const [field, dir] = pair.split(':');
    sort[field.trim()] = Number(dir) || 1;
  });
  return sort;
}

module.exports = router;
