let currentFilter = 'all';

async function loadTodos() {
  const response = await fetch('/api/todos');
  const todos = await response.json();
  return todos;
}

function filterTodos(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderTodos();
}

async function addTodo() {
  const title = document.getElementById('todoTitle').value;
  const description = document.getElementById('todoDescription').value;
  const priority = document.getElementById('todoPriority').value;
  const dueDate = document.getElementById('todoDueDate').value;

  if (!title) {
    alert('Please enter a title');
    return;
  }

  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, due_date: dueDate }),
  });

  const todo = await response.json();
  
  document.getElementById('todoTitle').value = '';
  document.getElementById('todoDescription').value = '';
  document.getElementById('todoDueDate').value = '';
  
  renderTodos();
}

async function toggleComplete(id) {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  });
  
  renderTodos();
}

async function toggleUncomplete(id) {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: false }),
  });
  
  renderTodos();
}

async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  });
  
  renderTodos();
}

async function renderTodos() {
  const todos = await loadTodos();
  const todoList = document.getElementById('todoList');
  
  let filteredTodos = todos;
  if (currentFilter === 'completed') {
    filteredTodos = todos.filter(t => t.completed === 1);
  } else if (currentFilter === 'pending') {
    filteredTodos = todos.filter(t => t.completed === 0);
  }
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p>No todos yet. Add one above!</p>
      </div>
    `;
    return;
  }
  
  todoList.innerHTML = filteredTodos.map(todo => `
    <div class="todo-item ${todo.completed === 1 ? 'completed' : ''}">
      <div class="todo-checkbox ${todo.completed === 1 ? 'checked' : ''}" 
           onclick="${todo.completed === 1 ? `toggleUncomplete(${todo.id})` : `toggleComplete(${todo.id})`}">
      </div>
      <div class="todo-content">
        <div class="todo-title">${todo.title}</div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
        <div class="todo-meta">
          <span class="priority ${todo.priority}">${todo.priority}</span>
          ${todo.due_date ? `<span>📅 ${todo.due_date}</span>` : ''}
        </div>
      </div>
      <div class="todo-actions">
        <button class="delete-btn" onclick="deleteTodo(${todo.id})">✕</button>
      </div>
    </div>
  `).join('');
}

async function exportTodos() {
  const todos = await loadTodos();
  const dataStr = JSON.stringify(todos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'todos.json';
  link.click();
}

function importTodos() {
  document.getElementById('importFile').click();
}

async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      for (const todo of data) {
        await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            due_date: todo.due_date,
          }),
        });
      }
      
      alert(`Imported ${data.length} todos`);
      renderTodos();
    } catch (err) {
      alert('Failed to import todos');
    }
  };
  reader.readAsText(file);
}

// Initial load
renderTodos();
