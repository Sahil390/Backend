// models/item.js
const { Schema, model } = require('mongoose');


const itemSchema = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('Item', itemSchema);