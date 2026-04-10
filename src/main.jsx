import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from '../task-board.jsx'

// Polyfill window.storage with localStorage
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
