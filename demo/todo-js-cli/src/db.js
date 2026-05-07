import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const DB_PATH = join(process.cwd(), 'data', 'todos.db');

export function initDb() {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  const db = new Database(DB_PATH);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0,
      sync_id TEXT
    );
  `);
  
  return db;
}

export function getDb() {
  return new Database(DB_PATH);
}

export class TodoRepository {
  constructor(db) {
    this.db = db;
  }
  
  add(todo) {
    const stmt = this.db.prepare(`
      INSERT INTO todos (title, description, priority, due_date)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(todo.title, todo.description || null, todo.priority || 'medium', todo.due_date || null);
    return this.findById(result.lastInsertRowid);
  }
  
  findAll() {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
    return stmt.all();
  }
  
  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    return stmt.get(id);
  }
  
  update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.findById(id);
  }
  
  delete(id) {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    stmt.run(id);
  }
  
  markSynced(id, syncId) {
    const stmt = this.db.prepare('UPDATE todos SET synced = 1, sync_id = ? WHERE id = ?');
    stmt.run(syncId, id);
  }
  
  getUnsynced() {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE synced = 0');
    return stmt.all();
  }
}
