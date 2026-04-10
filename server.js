import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadData, getData } from './data/store.js';
import adminRoutes from './routes/admin.js';
import memberRoutes from './routes/members.js';
import weekRoutes from './routes/week.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve built frontend static files
app.use(express.static(join(__dirname, 'dist')));

// Initialize data on startup
loadData();

// Health check
app.get('/api/health', (req, res) => {
  const data = getData();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataLoaded: data !== null,
  });
});

// Admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/week', weekRoutes);

// SPA fallback — send index.html for any non-API route
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
