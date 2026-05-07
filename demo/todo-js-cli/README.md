# Todo CLI App

A beautiful Todo app demonstrating the Skills Devkit capabilities with CLI interface, Web UI, SQLite local storage, and file-based sync.

## Features

- ✅ **CLI Interface** - Full CRUD operations via command line
- 🌐 **Web UI** - Beautiful responsive web interface with Express
- 💾 **SQLite Storage** - Local database for persistent storage
- 🔄 **File Sync** - Export/import todos as JSON for backup and sync
- 🎨 **Beautiful Design** - Gradient UI with modern styling
- 🏷️ **Priority System** - Low, Medium, High priority levels
- 📅 **Due Dates** - Optional due date tracking

## Installation

```bash
cd demo/todo-js-cli
npm install
```

## Usage

### CLI Commands

**Add a Todo:**
```bash
node index.js add "Buy groceries" --description "Milk, eggs, bread" --priority high --due 2026-12-31
```

**List Todos:**
```bash
# List all todos
node index.js list

# List only completed
node index.js list --completed

# List only pending
node index.js list --pending

# Filter by priority
node index.js list --priority high
```

**Complete/Uncomplete Todo:**
```bash
node index.js complete 1
node index.js uncomplete 1
```

**Delete Todo:**
```bash
node index.js delete 1
```

**Update Todo:**
```bash
node index.js update 1 --title "New title" --priority medium
```

**Sync (Export/Import):**
```bash
# Export todos to JSON
node index.js export -f my-todos.json

# Import todos from JSON (replace)
node index.js import my-todos.json

# Import todos (merge with existing)
node index.js import my-todos.json --merge

# Sync alias
node index.js sync export my-todos.json
node index.js sync import my-todos.json
```

### Web UI

**Launch Web Server:**
```bash
node index.js web
# Or specify port
node index.js web --port 3001
```

Then open http://localhost:3000 in your browser.

**Web UI Features:**
- Add todos with title, description, priority, and due date
- Mark todos as complete/incomplete
- Delete todos
- Filter by All/Pending/Completed
- Export todos as JSON
- Import todos from JSON
- Beautiful gradient design
- Responsive layout

## Data Storage

Todos are stored in SQLite database at:
```
data/todos.db
```

Database schema:
- `id` - Primary key
- `title` - Todo title (required)
- `description` - Optional description
- `completed` - Completion status (0/1)
- `priority` - Priority level (low/medium/high)
- `due_date` - Optional due date (YYYY-MM-DD)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `synced` - Sync status (0/1)
- `sync_id` - External sync ID

## Skills Demonstrated

This demo was built using the following skills from the Skills Devkit repository:

- **brainstorming-pro** - Ideated features and UX patterns
- **planning-pro** - Created 5-phase implementation roadmap
- **karpathy-coding-pro** - Applied coding principles (simplicity, surgical changes)
- **javascript-pro** - JavaScript/Node.js implementation
- **sql-data-access-pro** - SQLite database design and queries
- **api-design-pro** - RESTful API design for web UI

## Implementation Phases

### Phase 1: Foundation ✅
- Project structure setup
- SQLite database schema
- Data access layer (TodoRepository)

### Phase 2: CLI Interface ✅
- Command parsing with commander
- Full CRUD operations
- Color-coded output with chalk

### Phase 3: Web UI ✅
- Express server with RESTful API
- Beautiful HTML/CSS/JS interface
- Gradient design with modern styling
- Real-time CRUD operations
- Export/import functionality

### Phase 4: Sync Capability ✅
- JSON export/import
- Merge vs replace modes
- File-based sync for backup/transfer

### Phase 5: Testing & Polish ✅
- Documentation
- README
- Usage examples

## Architecture

```
┌─────────────┐
│   CLI       │
│  Commands   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SQLite    │
│  Database   │
└─────────────┘

Web UI → Express API → SQLite
CLI → Direct → SQLite
```

## License

MIT
