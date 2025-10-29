// models/item.js
const { Schema, model } = require('mongoose');
const Audit = require('./audit');
const leanVirtuals = require('mongoose-lean-virtuals');


const itemSchema = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
  description: { type: String, default: '', maxlength: 1000, trim: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// add a text index for search across name and description
itemSchema.index({ name: 'text', description: 'text' });

// virtual: shortDescription (first 100 chars)
itemSchema.virtual('shortDescription').get(function () {
  return (this.description || '').slice(0, 100);
});

// pre-save hook: normalize name/description
itemSchema.pre('save', function (next) {
  if (this.name) this.name = this.name.trim();
  if (this.description && typeof this.description === 'string') {
    this.description = this.description.trim();
  }
  next();
});

// post-save/update/delete hooks for simple triggers/audit
itemSchema.post('save', function (doc) {
  Audit.create({ itemId: doc.id, op: 'insert', doc }).catch(()=>{});
  console.log('Trigger: item saved', { id: doc.id, name: doc.name });
});

itemSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    Audit.create({ itemId: doc.id, op: 'update', doc }).catch(()=>{});
    console.log('Trigger: item updated', { id: doc.id, name: doc.name });
  }
});

itemSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    Audit.create({ itemId: doc.id, op: 'delete', doc }).catch(()=>{});
    console.log('Trigger: item deleted', { id: doc.id });
  }
});

itemSchema.plugin(leanVirtuals);

module.exports = model('Item', itemSchema);