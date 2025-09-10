const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const repo = require('../repositories/itemRepository');
let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });
beforeEach(async () => { await mongoose.connection.db.dropDatabase(); });

test('create and paginate', async () => {
  await repo.create({ name: 'A' });
  await repo.create({ name: 'B' });
  const r = await repo.findAll({ page:1, limit:1 });
  expect(r.total).toBe(2);
  expect(r.items.length).toBe(1);
});