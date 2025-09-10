const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const repo = require('./repositories/itemRepository');

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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

      const { method, url } = req;

      try {
        // GET /items
        if (method === 'GET' && url === '/items') {
          const items = await repo.findAll();
          res.writeHead(200);
          res.end(JSON.stringify(items));
          return;
        }

        // GET /items/:id
        if (method === 'GET' && url.match(/\/items\/[0-9]+/)) {
          const id = url.split('/')[2];
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
        if (method === 'POST' && url === '/items') {
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

        if (method === 'PUT' && url.match(/\/items\/[0-9]+/)) {
          const id = url.split('/')[2];
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
        if (method === 'DELETE' && url.match(/\/items\/[0-9]+/)) {
          const id = url.split('/')[2];
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
