const { Schema, model } = require('mongoose');

const auditSchema = new Schema({
  itemId: Number,
  op: String, // insert/update/delete
  doc: Schema.Types.Mixed,
  ts: { type: Date, default: Date.now }
});

module.exports = model('Audit', auditSchema);