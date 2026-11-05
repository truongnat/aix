import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent unhandled promise rejections from crashing the Electron window silently
window.addEventListener('unhandledrejection', (event) => {
  console.error('[renderer:unhandledrejection]', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
