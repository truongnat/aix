#!/usr/bin/env node

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { initDb, TodoRepository } from './db.js';

function TodoApp() {
  const [view, setView] = useState('list');
  const [todos, setTodos] = useState([]);
  const db = initDb();
  const repo = new TodoRepository(db);
  const { exit } = useApp();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = () => {
    setTodos(repo.findAll());
  };

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
    if (key.return && view === 'list') {
      setView('menu');
    }
  });

  const handleComplete = (id) => {
    repo.update(id, { completed: !todos.find(t => t.id === id).completed });
    loadTodos();
  };

  const handleDelete = (id) => {
    repo.delete(id);
    loadTodos();
  };

  if (view === 'list') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="green">
            📋 Todo App
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Press Enter to open menu, Escape to exit</Text>
        </Box>
        {todos.length === 0 ? (
          <Text color="yellow">No todos yet. Add one from the menu!</Text>
        ) : (
          todos.map(todo => (
            <Box key={todo.id} marginBottom={1}>
              <Text>
                {todo.completed === 1 ? (
                  <Text color="green">✓</Text>
                ) : (
                  <Text color="gray">○</Text>
                )}{' '}
                <Text bold>
                  [{todo.id}]
                </Text>{' '}
                <Text color={
                  todo.priority === 'high' ? 'red' :
                  todo.priority === 'medium' ? 'yellow' : 'blue'
                }>
                  {todo.priority}
                </Text>{' '}
                {todo.title}
              </Text>
              {todo.description && (
                <Text dimColor>  {todo.description}</Text>
              )}
            </Box>
          ))
        )}
      </Box>
    );
  }

  if (view === 'menu') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">Menu:</Text>
        </Box>
        <Text>1. 📝 Add Todo</Text>
        <Text>2. 📋 List Todos</Text>
        <Text>3. ✓ Complete Todo</Text>
        <Text>4. ○ Uncomplete Todo</Text>
        <Text>5. ✗ Delete Todo</Text>
        <Text>6. ✏️ Update Todo</Text>
        <Text>7. ↩ Back to List</Text>
        <Box marginTop={1}>
          <Text dimColor>Type number and press Enter</Text>
        </Box>
        <MenuInput onSubmit={(value) => {
          const actions = {
            '1': 'add',
            '2': 'list',
            '3': 'complete',
            '4': 'uncomplete',
            '5': 'delete',
            '6': 'update',
            '7': 'back',
          };
          const action = actions[value];
          if (action === 'back') {
            setView('list');
          } else if (action === 'list') {
            loadTodos();
            setView('list');
          } else if (action) {
            setView(action);
          }
        }} />
      </Box>
    );
  }

  if (view === 'add') {
    return <AddTodo onAdd={(title, description, priority, dueDate) => {
      repo.add({ title, description, priority, due_date: dueDate });
      loadTodos();
      setView('list');
    }} onCancel={() => setView('menu')} />;
  }

  if (view === 'complete') {
    return <SelectTodo todos={todos} onSelect={(id) => {
      repo.update(id, { completed: true });
      loadTodos();
      setView('list');
    }} onCancel={() => setView('menu')} />;
  }

  if (view === 'uncomplete') {
    return <SelectTodo todos={todos} onSelect={(id) => {
      repo.update(id, { completed: false });
      loadTodos();
      setView('list');
    }} onCancel={() => setView('menu')} />;
  }

  if (view === 'delete') {
    return <SelectTodo todos={todos} onSelect={(id) => {
      repo.delete(id);
      loadTodos();
      setView('list');
    }} onCancel={() => setView('menu')} />;
  }

  return null;
}

function MenuInput({ onSubmit }) {
  const [value, setValue] = useState('');

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value);
      setValue('');
    }
  });

  return <TextInput value={value} onChange={setValue} placeholder="Select option" />;
}

function AddTodo({ onAdd, onCancel }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const steps = [
    { label: 'Title:', value: title, setter: setTitle },
    { label: 'Description:', value: description, setter: setDescription },
    { label: 'Priority (low/medium/high):', value: priority, setter: setPriority },
    { label: 'Due Date (YYYY-MM-DD):', value: dueDate, setter: setDueDate },
  ];

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  if (step < steps.length) {
    const current = steps[step];
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">{current.label}</Text>
        </Box>
        <TextInput
          value={current.value}
          onChange={current.setter}
          onSubmit={() => setStep(step + 1)}
          placeholder={current.label.replace(':', '')}
        />
        <Box marginTop={1}>
          <Text dimColor>Press Enter to continue, Escape to cancel</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">Confirm Todo:</Text>
      </Box>
      <Box marginBottom={1}>
        <Text>Title: {title}</Text>
      </Box>
      {description && (
        <Box marginBottom={1}>
          <Text>Description: {description}</Text>
        </Box>
      )}
      <Box marginBottom={1}>
        <Text>Priority: {priority}</Text>
      </Box>
      {dueDate && (
        <Box marginBottom={1}>
          <Text>Due Date: {dueDate}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text>Press Enter to save, Escape to cancel</Text>
      </Box>
      <MenuInput onSubmit={(value) => {
        if (value === '') {
          onAdd(title, description, priority, dueDate);
        } else {
          onCancel();
        }
      }} />
    </Box>
  );
}

function SelectTodo({ todos, onSelect, onCancel }) {
  const options = todos.map(todo => ({
    label: `${todo.completed === 1 ? '✓' : '○'} [${todo.id}] ${todo.title}`,
    value: todo.id,
  }));

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  if (options.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No todos available</Text>
        <Box marginTop={1}>
          <Text>Press Escape to go back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Select Todo (type ID and press Enter):</Text>
      </Box>
      {options.map((option, index) => (
        <Box key={option.value}>
          <Text>{index + 1}. {option.label}</Text>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>Press Escape to cancel</Text>
      </Box>
      <MenuInput onSubmit={(value) => {
        const id = parseInt(value);
        if (todos.find(t => t.id === id)) {
          onSelect(id);
        } else {
          onCancel();
        }
      }} />
    </Box>
  );
}

render(<TodoApp />);
