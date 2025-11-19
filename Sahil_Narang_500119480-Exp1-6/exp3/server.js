const http = require('http');


let items = [
  { id: 1, name: 'Item 1', description: 'This is the first item.' },
  { id: 2, name: 'Item 2', description: 'This is the second item.' },
  { id: 3, name: 'Item 3', description: 'This is the third item.' }
];
let nextId = 4;

const server = http.createServer((req, res) => {
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
  if (method === 'GET' && url === '/items') {
    res.writeHead(200);
    res.end(JSON.stringify(items));
  } 

  else if (method === 'GET' && url.match(/\/items\/([0-9]+)/)) {
    const id = parseInt(url.split('/')[2]);
    const item = items.find(i => i.id === id);

    if (item) {
      res.writeHead(200);
      res.end(JSON.stringify(item));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Item not found' }));
    }
  } 
  
  else if (method === 'POST' && url === '/items') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name, description } = JSON.parse(body);
      const newItem = { id: nextId++, name, description };
      items.push(newItem);
      res.writeHead(201); // 201 Created
      res.end(JSON.stringify(newItem));
    });
  } 
  else if (method === 'PUT' && url.match(/\/items\/([0-9]+)/)) {
    const id = parseInt(url.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name, description } = JSON.parse(body);
      const itemIndex = items.findIndex(i => i.id === id);

      if (itemIndex !== -1) {
        const updatedItem = { id, name, description };
        items[itemIndex] = updatedItem;
        res.writeHead(200);
        res.end(JSON.stringify(updatedItem));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    });
  } 

  else if (method === 'DELETE' && url.match(/\/items\/([0-9]+)/)) {
    const id = parseInt(url.split('/')[2]);
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex !== -1) {
      items.splice(itemIndex, 1);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Item not found' }));
    }
  } 
  
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} using the native HTTP module.`);
});
