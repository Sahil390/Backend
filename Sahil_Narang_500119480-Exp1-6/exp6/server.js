require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/item');
const Audit = require('./models/audit');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const itemsRouter = require('./routes/items');

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test');
    console.log('Connected to MongoDB');

    // ensure model indexes exist (text index etc.)
    await Item.syncIndexes();
    console.log('Item indexes synced');

    // change-stream: listen for DB changes (requires replica set / Atlas)
    try {
      const changeStream = Item.collection.watch();
      changeStream.on('change', async change => {
        console.log('ChangeStream event:', change.operationType);
        try {
          if (change.fullDocument) {
            await Audit.create({ itemId: change.fullDocument.id, op: change.operationType, doc: change.fullDocument });
          } else {
            await Audit.create({ itemId: change.documentKey && change.documentKey._id, op: change.operationType, doc: change });
          }
        } catch (e) { console.warn('Audit save failed', e.message); }
      });
      console.log('Item change-stream started');
    } catch (err) {
      console.warn('Change-stream not started:', err.message);
    }

    const app = express();

    // Built-in middleware
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // custom logger (early)
    app.use(logger);

    // mount routers
    app.use('/items', itemsRouter);

    // fallback route
    app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

    // error handler (last)
    app.use(errorHandler);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
