const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const repo = require('./repositories/itemRepository');
const Item = require('./models/item');
const Audit = require('./models/audit');

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
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

    const server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      res.setHeader('Content-Type', 'application/json');

      const { method, headers } = req;
      // parse URL and query params reliably
      const base = `http://${headers.host || 'localhost'}`;
      const reqUrl = new URL(req.url, base);
      const pathname = reqUrl.pathname;

      try {
        // GET /items with pagination/search/sort
        if (method === 'GET' && pathname === '/items') {
          const page = Number(reqUrl.searchParams.get('page') || 1);
          const limit = Math.min(100, Number(reqUrl.searchParams.get('limit') || 50));
          const search = reqUrl.searchParams.get('search') || undefined;
          const sortParam = reqUrl.searchParams.get('sort') || undefined;
          let sort;
          if (sortParam) {
            // simple format: field:dir or field1:dir1,field2:dir2  (dir = 1 or -1)
            sort = {};
            sortParam.split(',').forEach(pair => {
              const [field, dir] = pair.split(':');
              sort[field.trim()] = Number(dir) || 1;
            });
          }
          const result = await repo.findAll({ page, limit, search, sort });
          res.writeHead(200);
          res.end(JSON.stringify(result));
          return;
        }

        // GET /items/:id
        if (method === 'GET' && pathname.match(/^\/items\/[0-9]+$/)) {
          const id = pathname.split('/')[2];
          const item = await repo.findById(id);
          if (item) {
            res.writeHead(200);
            res.end(JSON.stringify(item));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Item not found' }));
          }
          return;
        }

        // POST /items
        if (method === 'POST' && pathname === '/items') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', async () => {
            const { name, description } = JSON.parse(body || '{}');
            if (!name) {
              res.writeHead(400);
              res.end(JSON.stringify({ message: 'Name is required' }));
              return;
            }
            const newItem = await repo.create({ name, description });
            res.writeHead(201);
            res.end(JSON.stringify(newItem));
          });
          return;
        }

        // PUT /items/:id
        if (method === 'PUT' && pathname.match(/^\/items\/[0-9]+$/)) {
          const id = pathname.split('/')[2];
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', async () => {
            const { name, description } = JSON.parse(body || '{}');
            const updated = await repo.update(id, { name, description });
            if (updated) {
              res.writeHead(200);
              res.end(JSON.stringify(updated));
            } else {
              res.writeHead(404);
              res.end(JSON.stringify({ message: 'Item not found' }));
            }
          });
          return;
        }

        // DELETE /items/:id
        if (method === 'DELETE' && pathname.match(/^\/items\/[0-9]+$/)) {
          const id = pathname.split('/')[2];
          const ok = await repo.delete(id);
          if (ok) {
            res.writeHead(204);
            res.end();
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Item not found' }));
          }
          return;
        }

        // Not found
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Route not found' }));
      } catch (err) {
        console.error('Request handler error', err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: 'Internal server error' }));
      }
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
