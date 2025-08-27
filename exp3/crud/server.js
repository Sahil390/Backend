const express = require('express');
const app = express();
const port = 3000;  

app.use(express.json());

let items = [
  { id: 1, name: 'Breakfast', description: 'Eat Breakfast' },
  { id: 2, name: 'Lunch', description: 'Eat Lunch' },
  { id: 3, name: 'Dinner', description: 'Eat Dinner' }
];
let nextId = 4;  

app.get('/items', (req, res) => {
   
  res.status(200).json(items);
}); 
 
app.get('/items/:id', (req, res) => {
   
  const id = parseInt(req.params.id);
   
  const item = items.find(i => i.id === id);

  if (item) {
     
    res.status(200).json(item);
  } else {
     
    res.status(404).json({ message: 'Item not found' });
  }
});


app.post('/items', (req, res) => {
    const newItem = {
    id: nextId++,
    name: req.body.name,
    description: req.body.description
  };

   
  if (!newItem.name) {
    return res.status(400).json({ message: 'Name is required' });
  }

   
  items.push(newItem);
   
  res.status(201).json(newItem);
});

  
app.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
   
  const itemIndex = items.findIndex(i => i.id === id);

  if (itemIndex !== -1) {
     
    const updatedItem = {
      id: id,
      name: req.body.name,
      description: req.body.description
    };
     
    items[itemIndex] = updatedItem;
     
    res.status(200).json(updatedItem);
  } else {
     
    res.status(404).json({ message: 'Item not found' });
  }
});
 
app.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
   
  const itemIndex = items.findIndex(i => i.id === id);

  if (itemIndex !== -1) {
     
    items.splice(itemIndex, 1);
     
    res.status(204).send();
  } else {
     
    res.status(404).json({ message: 'Item not found' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
