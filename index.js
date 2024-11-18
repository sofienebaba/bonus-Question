const express = require('express');
const db = require('./db'); 
const app = express();
const port = 3000;

app.use(express.json());

app.get('/todos', (req, res) => {
  const { completed } = req.query;
  let query = `
  SELECT id, task, 
         CASE WHEN completed = 1 THEN true ELSE false END AS completed, 
         priority 
  FROM todos`;
    let params = [];

  if (completed !== undefined) {
    query += ' WHERE completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }

    res.json(rows);
  });
});

app.post('/todos', (req, res) => {
  const { task, priority } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).send({ error: 'Task is required and must be a non-empty string' });
  }

  const query = 'INSERT INTO todos (task, priority) VALUES (?, ?)';
  const params = [task.trim(), priority?.trim() || 'medium'];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.status(201).json({ id: this.lastID, task: task.trim(), completed: false, priority: params[1] });
  });
});

app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { task, completed, priority } = req.body;

  const query = 'UPDATE todos SET task = ?, completed = ?, priority = ? WHERE id = ?';
  const params = [task !== undefined ? task.trim() : undefined, completed !== undefined ? completed : undefined, priority?.trim() || 'medium', id];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).send({ error: 'Todo item not found' });
    }
    res.json({ id, task: task || 'No change', completed: completed !== undefined ? completed : false, priority: priority || 'medium' });
  });
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const query = 'DELETE FROM todos WHERE id = ?';

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).send({ error: 'Todo item not found' });
    }
    res.status(204).send();
  });
});

app.put('/todos/complete-all', (req, res) => {
  const query = 'UPDATE todos SET completed = 1';

  db.run(query, function (err) {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.json({ message: 'All todos marked as completed' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
