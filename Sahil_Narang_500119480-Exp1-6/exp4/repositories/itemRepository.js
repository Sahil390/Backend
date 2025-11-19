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
  // Create a new item. `data` should be { name: string, description?: string }
  async create(data) {
    // allocate numeric id
    const nextId = await getNextSequence('items');
    const doc = await Item.create({ id: nextId, ...data });
  return { id: doc.id, name: doc.name, description: doc.description };
  },


  async findAll(options = {}) {
    const { filter = {}, page = 1, limit = 50, sort = { createdAt: -1 } } = options;
    const skip = Math.max(0, page - 1) * limit;
    const docs = await Item.find(filter).sort(sort).skip(skip).limit(limit).lean();
  return docs.map(d => ({ id: d.id, name: d.name, description: d.description }));
  },


  async findById(id) {
  const doc = await Item.findOne({ id: Number(id) }).lean();
  if (!doc) return null;
  return { id: doc.id, name: doc.name, description: doc.description };
  },


  async update(id, changes) {
  const updated = await Item.findOneAndUpdate({ id: Number(id) }, changes, { new: true, runValidators: true }).lean();
  if (!updated) return null;
  return { id: updated.id, name: updated.name, description: updated.description };
  },


  async delete(id) {
    const res = await Item.findOneAndDelete({ id: Number(id) }).lean();
    return !!res;
  },


  async count(filter = {}) {
    return Item.countDocuments(filter);
  }
};
