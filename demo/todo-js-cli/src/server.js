import express from 'express';
import cors from 'cors';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, TodoRepository } from './db.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// API endpoints
app.get('/api/todos', (req, res) => {
  const db = initDb();
  const repo = new TodoRepository(db);
  const todos = repo.findAll();
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const db = initDb();
  const repo = new TodoRepository(db);
  const todo = repo.add(req.body);
  res.json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const db = initDb();
  const repo = new TodoRepository(db);
  const todo = repo.update(parseInt(req.params.id), req.body);
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const db = initDb();
  const repo = new TodoRepository(db);
  repo.delete(parseInt(req.params.id));
  res.json({ success: true });
});

// Serve the web UI
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Todo app web UI running at http://localhost:${port}`);
});
