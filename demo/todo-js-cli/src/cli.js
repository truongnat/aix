import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { initDb, TodoRepository } from './db.js';

const program = new Command();

program
  .name('todo')
  .description('Beautiful Todo app with CLI, TUI, local storage, and sync')
  .version('1.0.0');

// Add command
program
  .command('add')
  .description('Add a new todo')
  .argument('<title>', 'Todo title')
  .option('-d, --description <text>', 'Description')
  .option('-p, --priority <level>', 'Priority (low, medium, high)', 'medium')
  .option('--due <date>', 'Due date (YYYY-MM-DD)')
  .action((title, options) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    const todo = repo.add({
      title,
      description: options.description,
      priority: options.priority,
      due_date: options.due,
    });
    
    console.log(chalk.green('✓ Added todo:'), todo.title);
    console.log(`  ID: ${todo.id}`);
    console.log(`  Priority: ${todo.priority}`);
    if (todo.due_date) console.log(`  Due: ${todo.due_date}`);
  });

// List command
program
  .command('list')
  .description('List all todos')
  .option('-c, --completed', 'Show only completed')
  .option('-p, --pending', 'Show only pending')
  .option('--priority <level>', 'Filter by priority')
  .action((options) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    let todos = repo.findAll();
    
    if (options.completed) {
      todos = todos.filter(t => t.completed === 1);
    } else if (options.pending) {
      todos = todos.filter(t => t.completed === 0);
    }
    
    if (options.priority) {
      todos = todos.filter(t => t.priority === options.priority);
    }
    
    if (todos.length === 0) {
      console.log(chalk.yellow('No todos found'));
      return;
    }
    
    console.log(chalk.bold(`\n📋 Todos (${todos.length})\n`));
    
    todos.forEach(todo => {
      const status = todo.completed === 1 ? chalk.green('✓') : chalk.gray('○');
      const priorityColor = {
        low: chalk.blue,
        medium: chalk.yellow,
        high: chalk.red,
      }[todo.priority] || chalk.white;
      
      console.log(`${status} [${todo.id}] ${priorityColor(todo.priority)} ${todo.title}`);
      if (todo.description) {
        console.log(`    ${chalk.gray(todo.description)}`);
      }
      if (todo.due_date) {
        console.log(`    ${chalk.gray(`Due: ${todo.due_date}`)}`);
      }
    });
  });

// Complete command
program
  .command('complete')
  .description('Mark todo as completed')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    const todo = repo.findById(parseInt(id));
    if (!todo) {
      console.log(chalk.red(`Todo ${id} not found`));
      return;
    }
    
    repo.update(parseInt(id), { completed: true });
    console.log(chalk.green('✓ Completed:'), todo.title);
  });

// Uncomplete command
program
  .command('uncomplete')
  .description('Mark todo as pending')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    const todo = repo.findById(parseInt(id));
    if (!todo) {
      console.log(chalk.red(`Todo ${id} not found`));
      return;
    }
    
    repo.update(parseInt(id), { completed: false });
    console.log(chalk.yellow('○ Marked as pending:'), todo.title);
  });

// Delete command
program
  .command('delete')
  .description('Delete a todo')
  .argument('<id>', 'Todo ID')
  .action((id) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    const todo = repo.findById(parseInt(id));
    if (!todo) {
      console.log(chalk.red(`Todo ${id} not found`));
      return;
    }
    
    repo.delete(parseInt(id));
    console.log(chalk.red('✗ Deleted:'), todo.title);
  });

// Update command
program
  .command('update')
  .description('Update a todo')
  .argument('<id>', 'Todo ID')
  .option('-t, --title <text>', 'New title')
  .option('-d, --description <text>', 'New description')
  .option('-p, --priority <level>', 'New priority (low, medium, high)')
  .option('--due <date>', 'New due date (YYYY-MM-DD)')
  .action((id, options) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    
    const todo = repo.findById(parseInt(id));
    if (!todo) {
      console.log(chalk.red(`Todo ${id} not found`));
      return;
    }
    
    const updates = {};
    if (options.title) updates.title = options.title;
    if (options.description !== undefined) updates.description = options.description;
    if (options.priority) updates.priority = options.priority;
    if (options.due !== undefined) updates.due_date = options.due;
    
    const updated = repo.update(parseInt(id), updates);
    console.log(chalk.green('✓ Updated:'), updated.title);
  });

// Export command
program
  .command('export')
  .description('Export todos to JSON file')
  .option('-f, --file <path>', 'Output file path', 'todos.json')
  .action((options) => {
    const db = initDb();
    const repo = new TodoRepository(db);
    const todos = repo.findAll();
    
    writeFileSync(options.file, JSON.stringify(todos, null, 2), 'utf8');
    
    console.log(chalk.green(`✓ Exported ${todos.length} todos to ${options.file}`));
  });

// Import command
program
  .command('import')
  .description('Import todos from JSON file')
  .argument('<file>', 'JSON file path')
  .option('--merge', 'Merge with existing todos (default: replace)')
  .action((file, options) => {
    if (!existsSync(file)) {
      console.log(chalk.red(`File not found: ${file}`));
      return;
    }
    
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const db = initDb();
    const repo = new TodoRepository(db);
    
    if (options.merge) {
      // Merge: add todos that don't exist
      let added = 0;
      for (const todo of data) {
        const existing = repo.findById(todo.id);
        if (!existing) {
          repo.add({
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            due_date: todo.due_date,
          });
          added++;
        }
      }
      console.log(chalk.green(`✓ Merged ${added} new todos from ${file}`));
    } else {
      // Replace: clear and add all
      db.exec('DELETE FROM todos');
      for (const todo of data) {
        repo.add({
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          due_date: todo.due_date,
        });
      }
      console.log(chalk.green(`✓ Imported ${data.length} todos from ${file}`));
    }
  });

// Sync command (alias for export/import)
program
  .command('sync')
  .description('Sync todos (export/import)')
  .argument('<action>', 'Action: export or import')
  .argument('<file>', 'File path')
  .action((action, file) => {
    if (action === 'export') {
      program.parse(['node', 'index.js', 'export', '-f', file], { from: 'user' });
    } else if (action === 'import') {
      program.parse(['node', 'index.js', 'import', file], { from: 'user' });
    } else {
      console.log(chalk.red('Invalid action. Use: export or import'));
    }
  });

// Web command
program
  .command('web')
  .description('Launch web UI server')
  .option('-p, --port <number>', 'Port number', '3000')
  .action((options) => {
    console.log(chalk.green('🚀 Starting web UI server...'));
    console.log(chalk.dim(`Open http://localhost:${options.port}`));
    
    // Set port environment variable
    process.env.PORT = options.port;
    
    // Start server
    import('./server.js').catch(err => {
      console.error(chalk.red('Failed to start server:'), err.message);
    });
  });

// TUI command (deprecated - use web instead)
program
  .command('tui')
  .description('Launch web UI (alias for web command)')
  .action(() => {
    console.log(chalk.yellow('TUI not available. Use: node index.js web'));
  });

export default program;
