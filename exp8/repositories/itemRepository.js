// repositories/itemRepository.js
// Small repository layer that encapsulates Mongoose operations for the Item model.
// Keeps DB calls out of route handlers and makes testing/mocking easier.

const Item = require('../models/item');
const mongoose = require('mongoose');

// Simple counter collection to generate numeric ids similar to auto-increment.
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function getNextSequence(name) {
  const ret = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();
  return ret.seq;
}

module.exports = {
  async create(data) {
    const nextId = await getNextSequence('items');
    const doc = await Item.create({ id: nextId, ...data });
    return { id: doc.id, name: doc.name, description: doc.description, shortDescription: (doc.description || '').slice(0, 100) };
  },

  // options: { filter, page, limit, sort, search }
  async findAll(options = {}) {
    const { filter = {}, page = 1, limit = 50, sort: userSort, search } = options;
    const skip = Math.max(0, page - 1) * limit;

    const mongoFilter = { ...filter };
    let projection = null;
    let sort = userSort || { createdAt: -1 };

    if (search) {
      mongoFilter.$text = { $search: search };
      projection = { score: { $meta: "textScore" } };
      // if no explicit sort provided, sort by relevance
      if (!userSort) sort = { score: { $meta: "textScore" } };
    }

    const total = await Item.countDocuments(mongoFilter);
    const docs = await Item.find(mongoFilter, projection).sort(sort).skip(skip).limit(limit).lean();

    const items = docs.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      shortDescription: (d.description || '').slice(0, 100),
      // include text score when available
      ...(d.score !== undefined ? { score: d.score } : {})
    }));

    return { items, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const doc = await Item.findOne({ id: Number(id) }).lean();
    if (!doc) return null;
    return { id: doc.id, name: doc.name, description: doc.description, shortDescription: (doc.description || '').slice(0, 100) };
  },

  async update(id, changes) {
    const updated = await Item.findOneAndUpdate({ id: Number(id) }, changes, { new: true, runValidators: true }).lean();
    if (!updated) return null;
    return { id: updated.id, name: updated.name, description: updated.description, shortDescription: (updated.description || '').slice(0, 100) };
  },

  async delete(id) {
    const res = await Item.deleteOne({ id: Number(id) });
    return res.deletedCount > 0;
  },

  async count(filter = {}) {
    return await Item.countDocuments(filter);
  }
};
