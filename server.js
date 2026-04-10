import express from 'express';
import { loadData, getData } from './data/store.js';
import adminRoutes from './routes/admin.js';
import memberRoutes from './routes/members.js';
import weekRoutes from './routes/week.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
