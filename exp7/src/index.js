const createApp = require('./app');

// Simple in-memory repo
const repo = (function() {
  let todos = [];
  let id = 1;
  return {
    list: () => Promise.resolve(todos.slice()),
    get: (id_) => Promise.resolve(todos.find(t => t.id === Number(id_)) || null),
    create: (data) => {
      const item = { id: id++, title: data.title || '', completed: !!data.completed };
      todos.push(item);
      return Promise.resolve(item);
    },
    reset: () => { todos = []; id = 1; }
  };
})();

const app = createApp(repo);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
