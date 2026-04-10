import express from 'express';
import { loadData, getData } from './data/store.js';

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
